import GroupWrapper from "../components/builder-section/groupwrapper/GroupWrapper";
import { Language, Order } from "./ISparJson";
import { OptionTypes } from "../components/builder-section/groupwrapper/criteriagroup/optionsgroup/OptionsGroup";
import ISpecProvider from "../spec-providers/ISpecProviders";
import {
  GroupPattern,
  IriTerm,
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
import Sparnatural from "../components/Sparnatural";
import CriteriaGroup from "../components/builder-section/groupwrapper/criteriagroup/CriteriaGroup";
import * as DataFactory from "@rdfjs/data-model" ;
import { AbstractWidget } from "../components/builder-section/groupwrapper/criteriagroup/edit-components/widgets/AbstractWidget";
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
    if(RdfJsQuery.where.length === 0 ){
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
    const ptrns: Pattern[] = [];    
    //get the infromation from the widget if there are widgetvalues selected
    let rdfPattern: Pattern[] = [];
    const widgetComponent:AbstractWidget | null | undefined = grpWrapper.CriteriaGroup.EndClassGroup?.editComponents?.widgetWrapper?.widgetComponent

    let triples = this.#buildCrtGrpTriples(grpWrapper.CriteriaGroup,widgetComponent,isChild);

    if (widgetComponent?.getwidgetValues()?.length > 0 ) rdfPattern = widgetComponent.getRdfJsPattern();
    
    const hasOption =
      grpWrapper.optionState == OptionTypes.OPTIONAL ||
      grpWrapper.optionState == OptionTypes.NOTEXISTS
        ? true
        : false;
    // if it has whereChild
    const wherePtrn = grpWrapper.whereChild
      ? this.#processGrpWrapper(grpWrapper.whereChild, hasOption, true)
      : null;

    // if it hasandSiblings
    const andPtrn = grpWrapper.andSibling
      ? this.#processGrpWrapper(grpWrapper.andSibling, hasOption, true)
      : null;

    //if it is a child of a parent with either optional or notexists
    if (isInOption) {
      ptrns.push(SparqlFactory.buildBgpPattern(triples));
      ptrns.push(...rdfPattern);
      if (wherePtrn) ptrns.push(...wherePtrn);
      if (andPtrn) ptrns.push(...andPtrn);
      return ptrns;
    }

    // starting from this grpWrapper to all where descendants: Optional might be enabled
    // see spec: http://data.sparna.fr/ontologies/sparnatural-config-core/index-en.html#enableOptional
    if (grpWrapper.optionState == OptionTypes.OPTIONAL) {
      ptrns.push(SparqlFactory.buildBgpPattern([triples[0]])); // triples[0] = startclasstriple is excluded from optional
      let inOptional = this.#buildFilterTriples(triples,rdfPattern,wherePtrn) // everything in this array goes into OPTIONAL Brackets in SPARQL
      let optionalPtrn = SparqlFactory.buildOptionalPattern(inOptional.patterns);
      ptrns.push(optionalPtrn);
      return ptrns;
    }

    //Starting from this grpWrapper to all where descendants: not exists might be enabled
    // see spec: http://data.sparna.fr/ontologies/sparnatural-config-core/index-en.html#enableNegation
    if (grpWrapper.optionState == OptionTypes.NOTEXISTS) {
      ptrns.push(SparqlFactory.buildBgpPattern([triples[0]])); // triples[0] = startclasstriple
      let inNotExists = this.#buildFilterTriples(triples,rdfPattern,wherePtrn) // everything in this array goes into FILTER NOT EXISTS bracket in SPARQL
      let notExistPtrn = SparqlFactory.buildNotExistsPattern(inNotExists);
      ptrns.push(notExistPtrn);
      return ptrns;
    }

    // normal case, no OPTIONAL or NOTEXISTS
    if(triples.length > 0) ptrns.push(SparqlFactory.buildBgpPattern(triples));
    if(rdfPattern.length > 0) ptrns.push(...rdfPattern);
    if (wherePtrn) ptrns.push(...wherePtrn);
    if (andPtrn) ptrns.push(...andPtrn);
    return ptrns;
  }

  // Builds the 'filter' triples for OPTIONAL or NOTEXISTS
  #buildFilterTriples(triples:Triple[],rdfPattern:Pattern[],wherePtrn:Pattern[]):GroupPattern{
    const ptrn:Array<Pattern> = []
    if(triples.length > 2){
      ptrn.push(SparqlFactory.buildBgpPattern([triples[1],triples[2]]))
    } else {
      // In a where child we don't have three triples. see: #buildCrtGrpTriples
      // the rdf:type triple of the start triple was then already defined by the parent
      ptrn.push(SparqlFactory.buildBgpPattern([triples[1]]))
    }
    if (rdfPattern) ptrn.push(...rdfPattern);
    if (wherePtrn) ptrn.push(...wherePtrn);
    return {
      type: 'group',
      patterns: ptrn
    }
  }

  // Writes The default triples 
  #buildCrtGrpTriples(crtGrp: CriteriaGroup,widgeComponent:AbstractWidget,isChild: boolean): Triple[] {
    let triples: Triple[] = [];

    // startClassTriple
    let startClass:Triple
    if(!widgeComponent?.isBlockingStart()){
      startClass = SparqlFactory.buildRdfTypeTriple(
        DataFactory.variable(crtGrp.StartClassGroup.getVarName().replace('?','')) ,
        DataFactory.namedNode(crtGrp.StartClassGroup.getTypeSelected()) 
      );

      if(!isChild && startClass){
        // if it is a child branch (WHERE or AND) then don't create startClass triple. It's already done in the parent
        triples.push(startClass)
        if(crtGrp?.StartClassGroup?.inputTypeComponent?.selectViewVariableBtn?.selected){
          const lbl = this.#getDefaultLabel(startClass,crtGrp.StartClassGroup)
          if(lbl) triples.push(lbl)
        } 
      } 
    }

    // endClassTriple
    let endClassTriple:Triple
    if(widgeComponent && !widgeComponent?.isBlockingEnd()){
      endClassTriple = SparqlFactory.buildRdfTypeTriple(
        DataFactory.variable(crtGrp.EndClassGroup?.getVarName()?.replace('?','')) ,
        DataFactory.namedNode(crtGrp.EndClassGroup.getTypeSelected()) ,
      );

      if(!this.specProvider.isLiteralClass(crtGrp.EndClassGroup?.getTypeSelected()) && endClassTriple){
        // If it is a literal class then it doesn't have the endclass Tiple.
        // see: http://data.sparna.fr/ontologies/sparnatural-config-core/index-en.html#http://www.w3.org/2000/01/rdf-schema#Literal
        triples.push(endClassTriple)
        if(crtGrp?.EndClassGroup?.inputTypeComponent?.selectViewVariableBtn?.selected){
          const lbl = this.#getDefaultLabel(endClassTriple,crtGrp.EndClassGroup)
          if(lbl) triples.push(lbl)
        } 
      }
    }

    let connectingTripple:Triple
    if(!widgeComponent?.isBlockingObjectProp()){
      connectingTripple = SparqlFactory.buildIntersectionTriple(
        startClass?.subject as VariableTerm,
        crtGrp.ObjectPropertyGroup.getTypeSelected(),
        endClassTriple?.subject as VariableTerm
      );
      if(connectingTripple) triples.push(connectingTripple)
    }

    return triples;
  }

  // creating additional triples for classes with the defaultlabel property defined
  // see: https://docs.sparnatural.eu/OWL-based-configuration#classes-configuration-reference
  #getDefaultLabel(triple:Triple,ClassGrp:StartClassGroup | EndClassGroup):Triple | null{
    // the triple MUST be of type: ?var rdf:typ <namedNode>
    if((triple.subject?.termType === "Variable") && (isNamedNode(triple.predicate)) && (isNamedNode(triple.object))){
      const lbl = this.specProvider.getDefaultLabelProperty(triple.object.value)
      if(lbl){
        const trpl = {
          subject: DataFactory.variable(triple.subject.value.replace("?", "")),
          predicate: DataFactory.namedNode(ClassGrp.defaultLblVar.type),
          object:DataFactory.variable(`${ClassGrp.defaultLblVar.variable.replace("?", "")}`)
        } as Triple
        return trpl
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
  return "termType" in val && val.termType == "NamedNode"
}
function isVariable(val:Wildcard | Variable): val is Variable{
  return "termType" in val && val.termType == "Variable"
}
