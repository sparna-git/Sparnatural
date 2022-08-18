import GroupWrapper from "../components/builder-section/groupwrapper/GroupWrapper";
import { Language, Order } from "./ISparJson";
import { OptionTypes } from "../components/builder-section/groupwrapper/criteriagroup/optionsgroup/OptionsGroup";
import ISpecProvider from "../spec-providers/ISpecProviders";
import {
  BgpPattern,
  FilterPattern,
  Generator,
  OptionalPattern,
  Ordering,
  Pattern,
  SelectQuery,
  Triple,
  Variable,
  VariableTerm,
  Wildcard,
} from "sparqljs";
import Sparnatural from "../components/Sparnatural";
import CriteriaGroup from "../components/builder-section/groupwrapper/criteriagroup/CriteriaGroup";
import { DataFactory } from "n3";
import { RDF } from "../spec-providers/RDFSpecificationProvider";
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
  ) {
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
    // if there are now variables defined just create the Wildcard e.g: *
    if(RdfJsQuery?.variables?.length === 0) RdfJsQuery.variables = [new Wildcard()];
    // don't set an order if there is no expression for it
    if(!RdfJsQuery?.order[0]?.expression) delete RdfJsQuery.order
    var generator = new Generator();
    var generatedQuery = generator.stringify(RdfJsQuery);

    return generatedQuery;
  }

  // this method traverses through the groupwrappers and retrieves the information from each widget.
  #processGrpWrapper(grpWrapper: GroupWrapper, isInOption: boolean, isChild: boolean) {
    let ptrns: Pattern[] = [];

    let triples = this.#buildCrtGrpTriples(grpWrapper.CriteriaGroup,isChild);
    //get the infromation from the widget if there are widgetvalues selected
    let rdfPattern: Pattern[] = [];
    if (
      grpWrapper.CriteriaGroup.EndClassGroup.editComponents?.widgetWrapper?.widgetComponent?.getwidgetValues()
        ?.length > 0
    ) {
      rdfPattern =
        grpWrapper.CriteriaGroup.EndClassGroup.editComponents.widgetWrapper.widgetComponent.getRdfJsPattern();
    }
    let hasOption =
      grpWrapper.optionState == OptionTypes.OPTIONAL ||
      grpWrapper.optionState == OptionTypes.NOTEXISTS
        ? true
        : false;
    // if it has whereChild
    let wherePtrn = grpWrapper.whereChild
      ? this.#processGrpWrapper(grpWrapper.whereChild, hasOption, true)
      : null;

    // if it hasandSiblings
    let andPtrn = grpWrapper.andSibling
      ? this.#processGrpWrapper(grpWrapper.andSibling, hasOption, true)
      : null;

    //if it is a child of a parent with either optional or notexists
    if (isInOption) {
      ptrns.push(this.#buildBGP(triples));
      ptrns.push(...rdfPattern);
      if (wherePtrn) ptrns.push(...wherePtrn);
      if (andPtrn) ptrns.push(...andPtrn);
      return ptrns;
    }

    // starting from this grpWrapper to all where descendants: Optional might be enabled
    // see spec: http://data.sparna.fr/ontologies/sparnatural-config-core/index-en.html#enableOptional
    if (grpWrapper.optionState == OptionTypes.OPTIONAL) {
      ptrns.push(this.#buildBGP([triples[0]])); // triples[0] = startclasstriple is excluded from optional
      let inOptional = this.#buildFilterTriples(triples,rdfPattern,wherePtrn) // everything in this array goes into OPTIONAL Brackets in SPARQL
      let optionalPtrn = this.#buildOptionalPattern(inOptional);
      ptrns.push(optionalPtrn);
      return ptrns;
    }

    //Starting from this grpWrapper to all where descendants: not exists might be enabled
    // see spec: http://data.sparna.fr/ontologies/sparnatural-config-core/index-en.html#enableNegation
    if (grpWrapper.optionState == OptionTypes.NOTEXISTS) {
      ptrns.push(this.#buildBGP([triples[0]])); // triples[0] = startclasstriple
      let inNotExists = this.#buildFilterTriples(triples,rdfPattern,wherePtrn) // everything in this array goes into FILTER NOT EXISTS bracket in SPARQL
      let notExistPtrn = this.#buildNotExistsPattern(inNotExists);
      ptrns.push(notExistPtrn);
      return ptrns;
    }

    // normal case, no OPTIONAL or NOTEXISTS
    if(triples.length > 0) ptrns.push(this.#buildBGP(triples));
    if(rdfPattern.length > 0) ptrns.push(...rdfPattern);
    if (wherePtrn) ptrns.push(...wherePtrn);
    if (andPtrn) ptrns.push(...andPtrn);
    return ptrns;
  }

  // Builds the 'filter' triples for OPTIONAL or NOTEXISTS
  #buildFilterTriples(triples:Triple[],rdfPattern:Pattern[],wherePtrn:Pattern[]):Pattern[]{
    const ptrn:Array<Pattern> = []
    if(triples.length > 2){
      ptrn.push(this.#buildBGP([triples[1],triples[2]]))
    } else {
      // In a where child we don't have three triples. see: #buildCrtGrpTriples
      // the rdf:type triple of the start triple was then already defined by the parent
      ptrn.push(this.#buildBGP([triples[1]]))
    }
    if (rdfPattern) ptrn.push(...rdfPattern);
    if (wherePtrn) ptrn.push(...wherePtrn);
    return ptrn
  }

  #buildCrtGrpTriples(crtGrp: CriteriaGroup,isChild: boolean): Triple[] {
    let triples: Triple[] = [];
    let startClass = this.#buildTypeTripple(
      crtGrp.StartClassGroup.getVarName(),
      RDF.TYPE.value,
      crtGrp.StartClassGroup.getTypeSelected()
    );
   
      let endClass = this.#buildTypeTripple(
        crtGrp.EndClassGroup.getVarName(),
        RDF.TYPE.value,
        crtGrp.EndClassGroup.getTypeSelected()
      );
    
    let connectingTripple = this.#buildIntersectionTriple(
      startClass?.subject as Variable,
      crtGrp.ObjectPropertyGroup.getTypeSelected(),
      endClass?.subject as Variable
    );

      // always 

    if(!isChild && startClass){
      // if it is a child branch (WHERE or AND) then don't create startClass triple. It's already done in the parent
      triples.push(startClass)
    }

    if(!this.specProvider.isLiteralClass(crtGrp.EndClassGroup.getTypeSelected()) && endClass){
      // If it is a literal class then it doesn't have the endclass Tiple.
      // see: http://data.sparna.fr/ontologies/sparnatural-config-core/index-en.html#http://www.w3.org/2000/01/rdf-schema#Literal
      triples.push(endClass)
    }

    if(connectingTripple) triples.push(connectingTripple)
   

    return triples;
  }

  #buildBGP(triples: Triple[]): BgpPattern {
    return {
      type: "bgp",
      triples: triples,
    };
  }

  // example: ?person rdf:type dpedia:Person
  #buildTypeTripple(subj: string, pred: string, obj: string): Triple | null {
    if(!subj || !pred || !obj) return null
    return {
      subject: DataFactory.variable(subj?.replace("?", "")),
      predicate: DataFactory.namedNode(pred),
      object: DataFactory.namedNode(obj),
    };
  }
  // It is the intersection between the startclass and endclass chosen.
  // example: ?person dpedia:birthplace ?country
  #buildIntersectionTriple(
    subj: Variable,
    pred: string,
    obj: Variable
  ): Triple | null{
    if(!subj || !pred || !obj) return null
    return {
      subject: subj as VariableTerm,
      predicate: DataFactory.namedNode(pred),
      object: obj as VariableTerm,
    };
  }

  #buildNotExistsPattern(patterns: Pattern[]): FilterPattern {
    return {
      type: "filter",
      expression: {
        type: "operation",
        operator: "notexists",
        args: [
          {
            type: "group",
            patterns: patterns,
          },
        ],
      },
    };
  }

  #buildOptionalPattern(patterns: Pattern[]): OptionalPattern {
    return {
      type: "optional",
      patterns: patterns,
    };
  }

  #varsToRDFJS(variables: Array<string>): Variable[] {
    return variables.map((v) => {
      return DataFactory.variable(v.replace("?", ""));
    });
  }

  // It will be ordered by the Provided variable
  #orderToRDFJS(order: Order, variable: VariableTerm): Ordering[] {
    return [
      {
        expression: variable,
        descending: order == Order.DESC ? true : false,
      },
    ];
  }
}
