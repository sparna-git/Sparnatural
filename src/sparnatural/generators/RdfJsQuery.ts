import GroupWrapper from "../components/builder-section/groupwrapper/GroupWrapper";
import { Language, Order } from "./ISparJson";
import { OptionTypes } from "../components/builder-section/groupwrapper/criteriagroup/optionsgroup/OptionsGroup";
import ISpecProvider from "../spec-providers/ISpecProviders";
import {
  IriTerm,
  OptionalPattern,
  Ordering,
  Pattern,
  PropertyPath,
  SelectQuery,
  Term,
  Triple,
  Variable,
  VariableTerm,
  Wildcard,
} from "sparqljs";
import Sparnatural from "../components/SparnaturalComponent";
import CriteriaGroup from "../components/builder-section/groupwrapper/criteriagroup/CriteriaGroup";
import * as DataFactory from "@rdfjs/data-model" ;
import { AbstractWidget } from "../components/widgets/AbstractWidget";
import StartClassGroup from "../components/builder-section/groupwrapper/criteriagroup/startendclassgroup/StartClassGroup";
import EndClassGroup from "../components/builder-section/groupwrapper/criteriagroup/startendclassgroup/EndClassGroup";
import SparqlFactory from "./SparqlFactory";
/*
  Reads out the UI and creates the and sparqljs pattern. 
  sparqljs pattern builds pattern structure on top of rdfjs datamodel. see:https://rdf.js.org/data-model-spec/
  It goes recursively through all the grpWrappers and reads out their values.
*/
export default class RdfJsGenerator {
  typePredicate: string;
  specProvider: ISpecProvider;
  additionnalPrefixes: { [key: string]: string } = {};
  sparnatural: Sparnatural;
  defaultLabelVars:Variable[] = []// see: #checkForDefaultLabel()
  constructor(
    sparnatural: Sparnatural,
    typePredicate = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
    specProvider: ISpecProvider
  ) {
    this.sparnatural = sparnatural;
    this.typePredicate = typePredicate;
    this.specProvider = specProvider;
    this.additionnalPrefixes = {};
  }

  // add a new prefix to the generated query
  addPrefix(prefix: string | number, uri: any) {
    this.additionnalPrefixes[prefix] = uri;
  }

  setPrefixes(prefixes: any) {
    this.additionnalPrefixes = prefixes;
  }

  generateQuery(
    variables: Array<string>,
    distinct: boolean,
    order: Order,
    lang: Language
  ):SelectQuery {
    let RdfJsQuery: SelectQuery = {
      queryType: "SELECT",
      distinct: distinct,
      variables: this.#varsToRDFJS(variables),
      type: "query",
      where: this.#processGrpWrapper(
        this.sparnatural.BgWrapper.componentsList.rootGroupWrapper,
        false,
        false
      ),
      prefixes: {
        rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
        rdfs: "http://www.w3.org/2000/01/rdf-schema#",
        xsd: "http://www.w3.org/2001/XMLSchema#",
      },
      order: this.#orderToRDFJS(
        order,
        this.#varsToRDFJS(variables)[0] as VariableTerm
      ),
    };

    for (var key in this.additionnalPrefixes) {
      RdfJsQuery.prefixes[key] = this.additionnalPrefixes[key];
    }

    // if the RdfJsQuery contains keys with empty arrays, then the generator crashes.
    if(RdfJsQuery.where?.length === 0 ){
      // if the length is zero, then create beginning query
      //e.g ?sub ?pred ?obj
      RdfJsQuery.where = [{
        type: 'bgp',
        triples: [{
          subject: DataFactory.variable('sub'),
          predicate: DataFactory.variable('pred'),
          object: DataFactory.variable('obj'),
        }]
      }]
    }
    // post processing for defaultlabel property
    if(this.defaultLabelVars.length > 0) RdfJsQuery.variables = [...(RdfJsQuery.variables as Variable[]).filter((v:Variable)=> isVariable(v)),...this.defaultLabelVars]
    // if there are now variables defined just create the Wildcard e.g: *
    if(RdfJsQuery?.variables?.length === 0) RdfJsQuery.variables = [new Wildcard()];
    // don't set an order if there is no expression for it
    if(!RdfJsQuery?.order || !RdfJsQuery?.order[0]?.expression) delete RdfJsQuery.order
    
    return RdfJsQuery;
  }

  // this method traverses through the groupwrappers and retrieves the information from each widget.
  #processGrpWrapper(grpWrapper: GroupWrapper, isInOption: boolean, isChild: boolean) {

    // if it has whereChild
    const wherePtrn = grpWrapper.whereChild
      ? this.#processGrpWrapper(grpWrapper.whereChild, grpWrapper.optionState !== OptionTypes.NONE, true)
      : null;

    // if it hasandSiblings
    const andPtrn = grpWrapper.andSibling
      ? this.#processGrpWrapper(grpWrapper.andSibling, isInOption, true)
      : null;

    const widgetComponent:AbstractWidget | null | undefined = grpWrapper.CriteriaGroup.EndClassGroup?.editComponents?.widgetWrapper?.widgetComponent
    //get the infromation from the widget if there are widgetvalues selected
    let rdfPattern: Pattern[] = [];
    if (widgetComponent?.getwidgetValues()?.length > 0 ) rdfPattern = widgetComponent.getRdfJsPattern();

    let crtPtrns = this.#buildCrtGrpPtrns(grpWrapper.CriteriaGroup,widgetComponent,isChild);

    if(grpWrapper.optionState === OptionTypes.NONE || isInOption ){
      const ptrns: Pattern[] = [];
      // normal case, no OPTIONAL/NOTEXISTS, OR is a child of a OPTIONAL/NOTEXISTS
      if(crtPtrns.length > 0) ptrns.push(...crtPtrns);
      if(rdfPattern.length > 0) ptrns.push(...rdfPattern);
      if (wherePtrn) ptrns.push(...wherePtrn);
      if (andPtrn) ptrns.push(...andPtrn);
      return ptrns
    } else {
      // starting from this grpWrapper to all where descendants: OPTIONAL/NOTEXISTS is enabled
      // see spec: http://data.sparna.fr/ontologies/sparnatural-config-core/index-en.html#enableOptional
      const ptrns: Pattern[] = [];
      // if it is a where/and child, keep the first triple of ctrPtrns in the optional pattern
      if(crtPtrns.length > 0 && isChild === false) ptrns.push(crtPtrns.shift());
      if(crtPtrns.length > 0 && (crtPtrns[0].type == "optional")) ptrns.push(crtPtrns.shift()) // default label got created inside optional pattern
      const inOption = SparqlFactory.buildFilterTriples(crtPtrns,rdfPattern,wherePtrn)
      let optionPtrn 
      if(grpWrapper.optionState === OptionTypes.OPTIONAL) optionPtrn = SparqlFactory.buildOptionalPattern(inOption.patterns)
      if(grpWrapper.optionState === OptionTypes.NOTEXISTS) optionPtrn = SparqlFactory.buildNotExistsPattern(inOption)
      // ADD here OPTIONTYPE SERVICE keyword for federated queries
      ptrns.push(optionPtrn)
      if(andPtrn) ptrns.push(...andPtrn)
      return ptrns
    }
  }

  // Writes the patterns from the selected criterias 
  #buildCrtGrpPtrns(crtGrp: CriteriaGroup,widgetComponent:AbstractWidget,isChild: boolean) {

    const startClassTuple = this.#getStartClassTuple(crtGrp)
    const endClassTuple = this.#getEndClassTuple(crtGrp,widgetComponent)

    let connectingTripple:Triple
    if(!widgetComponent?.isBlockingObjectProp() && startClassTuple[0] && endClassTuple[0]){
      connectingTripple = SparqlFactory.buildIntersectionTriple(
        startClassTuple[0].subject as VariableTerm,
        crtGrp.ObjectPropertyGroup.getTypeSelected(),
        endClassTuple[0].subject as VariableTerm
      );
    }

    const critPatterns: Pattern[] = []
    const startPtrn = this.#buildStartClassPtrn(startClassTuple,isChild,widgetComponent)
    if(startPtrn.length > 0) critPatterns.push(...startPtrn)
    const endPtrn = this.#buildEndClassPtrn(endClassTuple,crtGrp)
    if(endPtrn.length > 0 ) critPatterns.push(...endPtrn)
    if(connectingTripple){
      const connPtrn = this.#buildConnectingPtrn(connectingTripple)
      if(connPtrn) critPatterns.push(connPtrn)
    }
    return critPatterns
  }

  #getStartClassTuple(crtGrp:CriteriaGroup): [Triple,Triple | OptionalPattern | null] {
    // startClassTuple: [startTriple, defaultLabel]
    let startClassTuple:[Triple, null |Triple | OptionalPattern] = [null,null]
    startClassTuple[0] = SparqlFactory.buildRdfTypeTriple(
      DataFactory.variable(crtGrp.StartClassGroup.getVarName()?.replace('?','')) ,
      DataFactory.namedNode(crtGrp.StartClassGroup.getTypeSelected()) 
    );

    if(crtGrp?.StartClassGroup?.inputTypeComponent?.selectViewVariableBtn?.selected){
      const lbl = this.#getDefaultLabel(startClassTuple[0],crtGrp.StartClassGroup)
      if(lbl) startClassTuple[1] = lbl
    } 
    return startClassTuple
  }

  #getEndClassTuple(crtGrp:CriteriaGroup,widgeComponent:AbstractWidget){
    // endClassTuple: [EndClassTriple,defaultLabel]
    let endClassTuple:[Triple,Triple | OptionalPattern | null] = [null,null]
    // generate only if EndClassGroup is present
    if(!widgeComponent?.isBlockingEnd() && crtGrp.EndClassGroup.getTypeSelected() != null){
      endClassTuple[0] = SparqlFactory.buildRdfTypeTriple(
        DataFactory.variable(crtGrp.EndClassGroup?.getVarName()?.replace('?','')) ,
        DataFactory.namedNode(crtGrp.EndClassGroup.getTypeSelected()) ,
      );

      // If it is a literal class then it doesn't have the endclass Tiple.
      // see: http://data.sparna.fr/ontologies/sparnatural-config-core/index-en.html#http://www.w3.org/2000/01/rdf-schema#Literal
      if(crtGrp?.EndClassGroup?.inputTypeComponent?.selectViewVariableBtn?.selected){
        const lbl = this.#getDefaultLabel(endClassTuple[0],crtGrp.EndClassGroup)
        if(lbl) endClassTuple[1] = lbl
      } 
    }
    return endClassTuple
  } 

  #buildStartClassPtrn(startTuple:[Triple, null | Triple | OptionalPattern],isChild:boolean,widgeComponent:AbstractWidget){
    const ptrns: Pattern[] = []
    if(isChild) return ptrns
    // if it is a child branch (WHERE or AND) then don't create startClass triple. It's already done in the parent
    if(!widgeComponent?.isBlockingStart() && startTuple[0]){
      if(isOptionalPattern(startTuple[1])) {
        // startClass + the defaultLabel inside OPTIONAL pattern
        // Don't put OPTIONAL inside BgpPattern It's not allowed
        ptrns.push(SparqlFactory.buildBgpPattern([startTuple[0]]))
        ptrns.push(startTuple[1])
      } else {
        if(startTuple[1]){
          // create startClass + defaultLabel in one bgp pattern
          ptrns.push(SparqlFactory.buildBgpPattern([startTuple[0],startTuple[1]]))
        } else {
          // no default label got created. only insert start tuple
          ptrns.push(SparqlFactory.buildBgpPattern([startTuple[0]]))
        }        
      }
    }
    return ptrns
  }

  #buildEndClassPtrn(endClassTuple:[Triple, null | Triple | OptionalPattern],crtGrp:CriteriaGroup){
    const ptrns: Pattern[] = []
    if((!this.specProvider.isLiteralClass(crtGrp.EndClassGroup?.getTypeSelected()) && endClassTuple[0])){
        
      if(isOptionalPattern(endClassTuple[1])){
        //create endClass + the defaultLabel inside OPTIONAL pattern
        // Don't put OPTIONAL inside BgpPattern. It's not allowed
        ptrns.push(SparqlFactory.buildBgpPattern([endClassTuple[0]]))
        ptrns.push(endClassTuple[1])
      } else {
        if(endClassTuple[1]){
          // create startClass + the defaultLabel both inside bgp pattern
          ptrns.push(SparqlFactory.buildBgpPattern([endClassTuple[0],endClassTuple[1]]))
        } else {
          ptrns.push(SparqlFactory.buildBgpPattern([endClassTuple[0]]))
        }
      }
    }
    return ptrns
  }

  #buildConnectingPtrn(connectingTripple:Triple){
    if(!connectingTripple) return
    return SparqlFactory.buildBgpPattern([connectingTripple])
  }

  // creating additional triples for classes with the defaultlabel property defined
  // see: https://docs.sparnatural.eu/OWL-based-configuration#classes-configuration-reference
  #getDefaultLabel(triple:Triple,ClassGrp:StartClassGroup | EndClassGroup):Triple | OptionalPattern |null{
    // the triple MUST be of type: ?var rdf:typ <namedNode>
    if((triple.subject?.termType === "Variable") && (isNamedNode(triple.predicate)) && (isNamedNode(triple.object))){
      const lbl = this.specProvider.getDefaultLabelProperty(triple.object.value)
      if(lbl){
        const lblTriple = SparqlFactory.buildTriple(
          DataFactory.variable(triple.subject.value.replace("?", "")),
          DataFactory.namedNode(ClassGrp.defaultLblVar.type),
          DataFactory.variable(`${ClassGrp.defaultLblVar.variable.replace("?", "")}`)
        )
        this.defaultLabelVars.push(DataFactory.variable(ClassGrp.defaultLblVar.variable.replace("?","")))
        if(this.specProvider.isEnablingOptional(lbl)){
          return SparqlFactory.buildOptionalPattern([SparqlFactory.buildBgpPattern([lblTriple])])
        }
        return lblTriple
      }
    }
    return null
  }

  #varsToRDFJS(variables: Array<string>): Variable[] {
    return variables.map((v) => {
      return DataFactory.variable(v.replace("?", ""));
    });
  }

  // It will be ordered by the Provided variable
  #orderToRDFJS(order: Order, variable: VariableTerm): Ordering[] {
    if(order == Order.DESC || order == Order.ASC) {
      return [
        {
          expression: variable,
          descending: order == Order.DESC ? true : false,
        },
      ];
    } else {
      // no order
      return null;
    }
  }
}
function isNamedNode(val:IriTerm | Variable | PropertyPath | Term): val is IriTerm{
  return val && "termType" in val && val.termType == "NamedNode"
}
function isVariable(val:Wildcard | Variable | any): val is Variable{
  return val && "termType" in val && val.termType == "Variable"
}
function isOptionalPattern(val: Triple | OptionalPattern): val is OptionalPattern {
  return val && "type" in val && val.type === "optional"
}