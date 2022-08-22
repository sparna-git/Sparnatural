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
} from "sparqljs";
import Sparnatural from "../components/Sparnatural";
import CriteriaGroup from "../components/builder-section/groupwrapper/criteriagroup/CriteriaGroup";
import { DataFactory } from "n3";
import { RDF } from "../spec-providers/RDFSpecificationProvider";
import { Config } from "../../configs/fixed-configs/SparnaturalConfig";
/*
  Reads out the UI and creates the internal JSON structure described here:
  https://docs.sparnatural.eu/Query-JSON-format
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
    console.log(RdfJsQuery);

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
    // recursive whereChild
    let wherePtrn = grpWrapper.whereChild
      ? this.#processGrpWrapper(grpWrapper.whereChild, hasOption, true)
      : null;

    //recursive andSiblings
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

    // starting from this grpWrapper Optional might be enabled
    // see spec: http://data.sparna.fr/ontologies/sparnatural-config-core/index-en.html#enableOptional
    if (grpWrapper.optionState == OptionTypes.OPTIONAL) {
      ptrns.push(this.#buildBGP([triples[0]])); // triples[0] = startclasstriple
      let inOptional = []; // everything in this array goes into OPTIONAL Brackets in SPARQL
      inOptional.push(this.#buildBGP([triples[1],triples[2]]))
      if (rdfPattern) inOptional.push(...rdfPattern);
      if (wherePtrn) inOptional.push(...wherePtrn);
      let optionalPtrn = this.#buildOptionalPattern(inOptional);
      ptrns.push(optionalPtrn);
      return ptrns;
    }

    //Starting from this grpWrapper not exists might be enabled
    // see spec: http://data.sparna.fr/ontologies/sparnatural-config-core/index-en.html#enableNegation
    if (grpWrapper.optionState == OptionTypes.NOTEXISTS) {
      ptrns.push(this.#buildBGP([triples[0]])); // triples[0] = startclasstriple
      let inNotExists = []; // everything in this array goes into FILTER NOT EXISTS bracket in SPARQL
      inNotExists.push(this.#buildBGP([triples[1],triples[2]]))
      if (rdfPattern) inNotExists.push(...rdfPattern);
      if (wherePtrn) inNotExists.push(...wherePtrn);
      let notExistPtrn = this.#buildNotExistsPattern(inNotExists);
      ptrns.push(notExistPtrn);
      return ptrns;
    }

    // normal case, no OPTIONAL or NOTEXISTS
    ptrns.push(this.#buildBGP(triples));
    ptrns.push(...rdfPattern);
    if (wherePtrn) ptrns.push(...wherePtrn);
    if (andPtrn) ptrns.push(...andPtrn);
    return ptrns;
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
      startClass.subject as Variable,
      crtGrp.ObjectPropertyGroup.getTypeSelected(),
      endClass.subject as Variable
    );

    if(!isChild){
      // if it is a child branch (WHERE or AND) then don't create startClass triple. It's already done in the parent
      triples.push(startClass)
    }

    if(!this.specProvider.isLiteralClass(crtGrp.EndClassGroup.getTypeSelected())){
      // If it is a literal class then it doesn't have the endclass Tiple.
      // see: http://data.sparna.fr/ontologies/sparnatural-config-core/index-en.html#http://www.w3.org/2000/01/rdf-schema#Literal
      triples.push(endClass)
    }

    triples.push(connectingTripple) // gets pushed in any case

    return triples;
  }

  

  #buildBGP(triples: Triple[]): BgpPattern {
    return {
      type: "bgp",
      triples: triples,
    };
  }

  #buildTypeTripple(subj: string, pred: string, obj: string): Triple {
    return {
      subject: DataFactory.variable(subj.replace("?", "")),
      predicate: DataFactory.namedNode(pred),
      object: DataFactory.namedNode(obj),
    };
  }

  #buildIntersectionTriple(
    subj: Variable,
    pred: string,
    obj: Variable
  ): Triple {
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
    if(order == Order.DESC || order == Order.ASC) {
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
