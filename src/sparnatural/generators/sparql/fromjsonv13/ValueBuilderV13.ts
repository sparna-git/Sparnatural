import {
  AstFactory,
  PatternBgp,
  PatternFilter,
  Pattern,
  PatternValues,
  TermBlank,
  TermIriFull,
  TermLiteral,
  TripleNesting,
  ValuePatternRow,
} from "@traqula/rules-sparql-1-1";
import { TermIri, TermTypedVariable } from "../../../SparnaturalQueryIfc-v13";
import SparqlFactoryV13 from "./SparqlFactoryV13";
import { ISparnaturalSpecification } from "../../../spec-providers/ISparnaturalSpecification";
import { Config } from "../../../ontologies/SparnaturalConfig";
import ISpecificationProperty from "../../../spec-providers/ISpecificationProperty";
import { SHACLSpecificationEntity } from "../../../spec-providers/shacl/SHACLSpecificationEntity";
import { DateCriteria, RDFTerm, RdfTermCriteria, Criteria, BooleanCriteria, NumberCriteria, SearchCriteria, MapCriteria } from "../../../SparnaturalQueryIfc";
import { GEOFUNCTIONS, GEOSPARQL } from "rdf-shacl-commons";

const F = new AstFactory();

/**
 * A factory for creating ValueBuilders from the widgetType. This is the association between the widget type
 * and the corresponding ValueBuilder
 */
export class ValueBuilderFactoryV13 {
  buildValueBuilder(widgetType: string): ValueBuilderIfcV13 {
    switch (widgetType) {
      case Config.LITERAL_LIST_PROPERTY:
      case Config.LIST_PROPERTY:
      case Config.TREE_PROPERTY:
      case Config.AUTOCOMPLETE_PROPERTY:
        return new RdfTermValueBuilderV13();

      case Config.VIRTUOSO_SEARCH_PROPERTY:
      case Config.GRAPHDB_SEARCH_PROPERTY:
      case Config.STRING_EQUALS_PROPERTY:
      case Config.SEARCH_PROPERTY:
        return new SearchRegexValueBuilderV13();

      case Config.NON_SELECTABLE_PROPERTY:
        return new NonSelectableValueBuilderV13();

      case Config.BOOLEAN_PROPERTY:
        return new BooleanValueBuilderV13();

      case Config.MAP_PROPERTY:
        return new MapValueBuilderV13();

      case Config.NUMBER_PROPERTY:
        return new NumberValueBuilderV13();

      case Config.TIME_PROPERTY_YEAR:
      case Config.TIME_PROPERTY_DATE:
        return new DateTimePickerValueBuilderV13();

      case Config.TIME_PROPERTY_PERIOD:
        console.warn(Config.TIME_PROPERTY_PERIOD + " is not implement yet");
        break;

      default:
        throw new Error(`WidgetType ${widgetType} not recognized`);
    }
  }
}

/**
 * Builds a SPARQL pattern from a (list of) widget values
 */
export default interface ValueBuilderIfcV13 {
  init(
    specProvider: ISparnaturalSpecification,
    startClassVal: TermTypedVariable,
    propertyVal: TermIri,
    endClassVal: TermTypedVariable,
    endClassVarSelected: boolean,
    criteriaHasChildren: boolean,
    values: Array<Criteria>
  ): void;

  /**
   * main method : builds the SPARQL pattern
   */
  build(): Pattern[];

  /**
   * @returns true if the rdf:type criteria of the subject must not be generated
   */
  isBlockingStart(): boolean;

  /**
   * @returns true if the rdf:type criteria of the object variable must not be generated
   */
  isBlockingEnd(): boolean;

  /**
   * @returns true if the triple criteria between the subject and the object must not be generated, in which case
   * the ValueBuilder itself is responsible for generating the triple if necessary
   * (e.g. in case of a single value for an object property, we can directly generate the triple with the value as an object)
   */
  isBlockingObjectProp(): boolean;
}

export abstract class BaseValueBuilderV13 implements ValueBuilderIfcV13 {
  protected specProvider!: ISparnaturalSpecification;
  protected startClassVal!: TermTypedVariable;
  protected propertyVal!: TermIri;
  protected endClassVal!: TermTypedVariable;
  protected values!: Array<Criteria>;
  protected endClassVarSelected!: boolean;
  protected criteriaHasChildren!: boolean;

  init(
    specProvider: ISparnaturalSpecification,
    startClassVal: TermTypedVariable,
    propertyVal: TermIri,
    endClassVal: TermTypedVariable,
    endClassVarSelected: boolean,
    criteriaHasChildren: boolean,
    values: Array<Criteria>
  ): void {
    this.specProvider = specProvider;
    this.startClassVal = startClassVal;
    this.propertyVal = propertyVal;
    this.endClassVal = endClassVal;
    this.endClassVarSelected = endClassVarSelected;
    this.criteriaHasChildren = criteriaHasChildren;
    this.values = values;
  }

  abstract build(): Pattern[];

  isBlockingStart(): boolean {
    return false;
  }

  isBlockingEnd(): boolean {
    return false;
  }

  isBlockingObjectProp(): boolean {
    return false;
  }
}

/**
 * A ValueBuilder that can work from an RdfTermValue and tests the equality either
 * by inserting the sole unique value as the object of the triple or by using a VALUES clause
 */
export class RdfTermValueBuilderV13
  extends BaseValueBuilderV13
  implements ValueBuilderIfcV13
{
  build(): Pattern[] {
    let widgetValues = this.values as RdfTermCriteria[];

    if (this.isBlockingObjectProp()) {
      let singleTriple: TripleNesting = SparqlFactoryV13.buildTriple(
        SparqlFactoryV13.buildVariable(this.startClassVal.value),
        SparqlFactoryV13.buildNamedNode(this.propertyVal.value),
        this.#rdfTermToSparqlQuery(widgetValues[0].rdfTerm)
      );

      let ptrn: PatternBgp = SparqlFactoryV13.buildBgpPattern([singleTriple]);

      return [ptrn];
    } else {
      let vals = widgetValues.map((v) => {
        let vl: ValuePatternRow = {};
        // SPARQL does not allow blank nodes in a VALUES clause, only IRIs and literals are expected here
        vl[this.endClassVal.value] = this.#rdfTermToSparqlQuery(
          v.rdfTerm
        ) as TermIriFull | TermLiteral;
        return vl;
      });
      let valuePattern: PatternValues = F.patternValues(
        [SparqlFactoryV13.buildVariable(this.endClassVal.value)],
        vals,
        F.gen()
      );
      return [valuePattern];
    }
  }

  /**
   * Translates an IRI, Literal or BNode into the corresponding SPARQL query term
   * to be inserted in a SPARQL query.
   * @returns
   */
  #rdfTermToSparqlQuery(rdfTerm: RDFTerm): TermIriFull | TermBlank | TermLiteral {
    if (rdfTerm.type == "uri") {
      return SparqlFactoryV13.buildNamedNode(rdfTerm.value);
    } else if (rdfTerm.type == "literal") {
      if (rdfTerm["xml:lang"]) {
        return SparqlFactoryV13.buildLiteral(rdfTerm.value, rdfTerm["xml:lang"]);
      } else if (rdfTerm.datatype) {
        // if the second parameter is a NamedNode, then it is considered a datatype, otherwise it is
        // considered like a language
        // so we make the datatype a NamedNode
        let namedNodeDatatype = SparqlFactoryV13.buildNamedNode(rdfTerm.datatype);
        return SparqlFactoryV13.buildLiteral(rdfTerm.value, namedNodeDatatype);
      } else {
        return SparqlFactoryV13.buildLiteral(rdfTerm.value);
      }
    } else if (rdfTerm.type == "bnode") {
      // we don't know what to do with this, but don't trigger an error
      return SparqlFactoryV13.buildBlankNode(rdfTerm.value);
    } else {
      throw new Error("Unexpected rdfTerm type " + rdfTerm.type);
    }
  }

  /**
   * @returns true if there is at least one value, because in that case the rdf:type criteria is redundant
   */
  isBlockingEnd(): boolean {
    return this.values?.length > 0;
  }

  /**
   * @returns true if 
   *   - there is a single value
   *   - and the end class is not selected (in which case we need the variable to put it in the SELECT clause)
   *   - and the target entity is not associated to a SPARQL query, in which case the variable must not disappear from the query
   *   - and the criteriain which the variable appears does not have any children
   */
  isBlockingObjectProp(): boolean {
    return (
      this.values?.length == 1 
      && 
      !this.endClassVarSelected
      &&
      !(
        this.specProvider.getEntity(this.endClassVal.rdfType) instanceof SHACLSpecificationEntity
        &&
        (this.specProvider.getEntity(this.endClassVal.rdfType) as SHACLSpecificationEntity).hasShTarget()
      )
      &&
      !this.criteriaHasChildren
    );
  }
}

export class BooleanValueBuilderV13
  extends BaseValueBuilderV13
  implements ValueBuilderIfcV13
{
  build(): Pattern[] {
    let widgetValues = this.values as BooleanCriteria[];

    let isLiteral = 
      this.specProvider.getEntity(this.endClassVal.rdfType).isLiteralEntity();

    if(!isLiteral) {
      // not a literal, we turn the criteria into FILTER EXISTS or FILTER NOT EXISTS
      let ptrn: PatternBgp = SparqlFactoryV13.buildBgpPattern([
        SparqlFactoryV13.buildTriple(
          SparqlFactoryV13.buildVariable(this.startClassVal.value),
          SparqlFactoryV13.buildNamedNode(this.propertyVal.value),
          SparqlFactoryV13.buildVariable(this.endClassVal.value),
        ),
      ]);

      let groupPattern = SparqlFactoryV13.buildGroupPattern([ptrn]);
      let filterPtrn: PatternFilter = widgetValues[0].boolean 
          ? SparqlFactoryV13.buildExistsPattern(groupPattern)
          : SparqlFactoryV13.buildNotExistsPattern(groupPattern)
      ;

      return [filterPtrn];

    } else {
      // if we are blocking the object prop, we create it directly here with the value as the object
      if (this.isBlockingObjectProp()) {
        let ptrn: PatternBgp = SparqlFactoryV13.buildBgpPattern([
          SparqlFactoryV13.buildTriple(
            SparqlFactoryV13.buildVariable(this.startClassVal.value),
            SparqlFactoryV13.buildNamedNode(this.propertyVal.value),
            SparqlFactoryV13.buildLiteral(
              widgetValues[0].boolean.toString(),
              SparqlFactoryV13.buildNamedNode("http://www.w3.org/2001/XMLSchema#boolean")
            ),
          ),
        ]);
        return [ptrn];
      } else {
        // otherwise the object prop is created and we create a VALUES clause with the actual boolean
        let vals = (this.values as BooleanCriteria[]).map((v) => {
          let vl: ValuePatternRow = {};
          vl[this.endClassVal.value] = SparqlFactoryV13.buildLiteral(
            widgetValues[0].boolean.toString(),
            SparqlFactoryV13.buildNamedNode("http://www.w3.org/2001/XMLSchema#boolean")
          );
          return vl;
        });
        let valuePattern: PatternValues = F.patternValues(
          [SparqlFactoryV13.buildVariable(this.endClassVal.value)],
          vals,
          F.gen()
        );
        return [valuePattern];
      }
    }

  }

  /**
   * @returns true if a value is selected but the variable is not selected and criteria has no children
   */
  isBlockingObjectProp() {
    return (
      this.values?.length == 1 
      &&
      !this.endClassVarSelected
      &&
      !this.criteriaHasChildren
    );
  }

  /**
   * @returns true if the range is not a literal, indicating we will generate a FILTER NOT EXISTS
   */
  isBlockingEnd(): boolean {
      let isLiteral = this.specProvider.getEntity(this.endClassVal.rdfType).isLiteralEntity();
      return !isLiteral;
  }
}

export class NumberValueBuilderV13
  extends BaseValueBuilderV13
  implements ValueBuilderIfcV13
{
  build(): Pattern[] {
    let widgetValues = this.values as NumberCriteria[];

    return [
      SparqlFactoryV13.buildFilterRangeDateOrNumber(
        widgetValues[0].min != undefined
          ? SparqlFactoryV13.buildLiteral(
              widgetValues[0].min.toString(),
              SparqlFactoryV13.buildNamedNode("http://www.w3.org/2001/XMLSchema#decimal")
            )
          : null,
        widgetValues[0].max != undefined
          ? SparqlFactoryV13.buildLiteral(
              widgetValues[0].max.toString(),
              SparqlFactoryV13.buildNamedNode("http://www.w3.org/2001/XMLSchema#decimal")
            )
          : null,
        SparqlFactoryV13.buildVariable(this.endClassVal.value)
      ),
    ];
  }
}

export class NonSelectableValueBuilderV13
  extends BaseValueBuilderV13
  implements ValueBuilderIfcV13
{
  build(): Pattern[] {
    return [];
  }
}

export class SearchRegexValueBuilderV13
  extends BaseValueBuilderV13
  implements ValueBuilderIfcV13
{
  build(): Pattern[] {

    let widgetType = this.specProvider
      .getProperty(this.propertyVal.value)
      .getPropertyType(this.endClassVal.rdfType);
    
    let widgetValues = this.values as SearchCriteria[];

    switch (widgetType) {
      case Config.STRING_EQUALS_PROPERTY: {
        // builds a FILTER(lcase(...) = lcase(...))
        return [ SparqlFactoryV13.buildFilterOr(
          widgetValues.map((v) => {
            return SparqlFactoryV13.buildOperationLcaseEquals(
              SparqlFactoryV13.buildLiteral(`${v.search}`),
              SparqlFactoryV13.buildVariable(this.endClassVal.value)
            );
          })
        ) ];
      }
      case Config.SEARCH_PROPERTY: {
        // builds a FILTER(regex(...,...,"i"))
       return [ SparqlFactoryV13.buildFilterOr(
        widgetValues.map((v) => {
          return SparqlFactoryV13.buildRegexOperation(
            SparqlFactoryV13.buildLiteral(`${v.search}`),
            SparqlFactoryV13.buildVariable(this.endClassVal.value)
          );
        })
       ) ];
      }
      case Config.GRAPHDB_SEARCH_PROPERTY: {
        // builds a GraphDB-specific search pattern
        let ptrn: PatternBgp = SparqlFactoryV13.buildBgpPattern([
          SparqlFactoryV13.buildTriple(
            SparqlFactoryV13.buildVariable(this.startClassVal.value),
            SparqlFactoryV13.buildNamedNode(
              "http://www.ontotext.com/connectors/lucene#query"
            ),
            SparqlFactoryV13.buildLiteral(`text:${widgetValues[0].search}`),
          ),
          SparqlFactoryV13.buildTriple(
            SparqlFactoryV13.buildVariable(this.startClassVal.value),
            SparqlFactoryV13.buildNamedNode(
              "http://www.ontotext.com/connectors/lucene#entities"
            ),
            SparqlFactoryV13.buildVariable(this.endClassVal.value),
          ),
        ]);
        return [ptrn];
      }
      case Config.VIRTUOSO_SEARCH_PROPERTY: {
        let bif_query = widgetValues[0].search
          .replace(/[\"']/g, " ")
          .split(" ")
          .map((e) => `'${e}'`)
          .join(" and ");

        let ptrn: PatternBgp = SparqlFactoryV13.buildBgpPattern([
          SparqlFactoryV13.buildTriple(
            SparqlFactoryV13.buildVariable(this.endClassVal.value),
            SparqlFactoryV13.buildNamedNode(
              "http://www.openlinksw.com/schemas/bif#contains"
            ),
            SparqlFactoryV13.buildLiteral(`${bif_query}`),
          ),
        ]);
        return [ptrn];
      }
      case Config.JENA_SEARCH_PROPERTY: {
        throw new Error("Not implemented yet");
      }
      default: {
        throw new Error(`WidgetType ${widgetType} not recognized`);
      }
    }
  }
}

export class DateTimePickerValueBuilderV13 extends BaseValueBuilderV13 implements ValueBuilderIfcV13 {

  build(): Pattern[] {
      
      let widgetValues = this.values as DateCriteria[];
      
      let specProperty:ISpecificationProperty = this.specProvider.getProperty(this.propertyVal.value);
      let beginDateProp = specProperty.getBeginDateProperty();
      let endDateProp = specProperty.getEndDateProperty();
  
      if(beginDateProp && endDateProp) {
        // special config with a begin and end date
        let exactDateProp = specProperty.getExactDateProperty();

        // we have some values, generate the filters 
        return [
          
          SparqlFactoryV13.buildDateRangeOrExactDatePattern(
            widgetValues[0].start?SparqlFactoryV13.buildLiteral(
              this.#formatSparqlDate(widgetValues[0].start),
              SparqlFactoryV13.buildNamedNode("http://www.w3.org/2001/XMLSchema#dateTime")
            ):null,
            widgetValues[0].stop?SparqlFactoryV13.buildLiteral(
              this.#formatSparqlDate(widgetValues[0].stop),
              SparqlFactoryV13.buildNamedNode("http://www.w3.org/2001/XMLSchema#dateTime")
            ):null,
            SparqlFactoryV13.buildVariable(this.startClassVal.value),
            SparqlFactoryV13.buildNamedNode(beginDateProp),
            SparqlFactoryV13.buildNamedNode(endDateProp),
            exactDateProp != null?SparqlFactoryV13.buildNamedNode(exactDateProp):null,
            SparqlFactoryV13.buildVariable(this.endClassVal.value)
          )
        ];
        

      } else {
        // normal case, standard config
        return [
          SparqlFactoryV13.buildFilterRangeDateOrNumber(
            widgetValues[0].start?SparqlFactoryV13.buildLiteral(
              this.#formatSparqlDate(widgetValues[0].start),
              SparqlFactoryV13.buildNamedNode("http://www.w3.org/2001/XMLSchema#dateTime")
            ):null,
            widgetValues[0].stop?SparqlFactoryV13.buildLiteral(
              this.#formatSparqlDate(widgetValues[0].stop),
              SparqlFactoryV13.buildNamedNode("http://www.w3.org/2001/XMLSchema#dateTime")
            ):null,
            SparqlFactoryV13.buildVariable(this.endClassVal.value)
          )
        ];
      } 
 
  }

  /**
   * We are blocking the generation of the predicate between start and end class
   * if the property is configured with a begin and end date (because the triples will then be generated by this class)
   * @returns true if the property has been configured with a begin and an end date property
   */
  isBlockingObjectProp() {
      let specProperty = this.specProvider.getProperty(this.propertyVal.value);
      if (!specProperty) return false;

      let beginDateProp = specProperty.getBeginDateProperty();
      let endDateProp = specProperty.getEndDateProperty();

      return (
        this.values?.length == 1
        &&
        beginDateProp != null
        &&
        endDateProp != null
      );
  }

  /**
   * 
   * @param date Formats the date to insert in the SPARQL query. We cannot rely on toISOString() method
   * since it does not properly handle negative year and generates "-000600-12-31" while we want "-0600-12-31"
   * @returns 
   */
  #formatSparqlDate(dateString:string|null):string|null {
      if(dateString == null) return null;

      let date = new Date(dateString);

      return this.#padYear(date.getUTCFullYear()) +
      '-' + this.#pad(date.getUTCMonth() + 1) +
      '-' + this.#pad(date.getUTCDate()) +
      'T' + this.#pad(date.getUTCHours()) +
      ':' + this.#pad(date.getUTCMinutes()) +
      ':' + this.#pad(date.getUTCSeconds()) +
      'Z';
  }

  #pad(number:number) {
      if (number < 10) {
      return '0' + number;
      }
      return number;
  }

  #padYear(number:number) {
      let absoluteValue = (number < 0)?-number:number;
      let absoluteString = (absoluteValue < 1000)?absoluteValue.toString().padStart(4,'0'):absoluteValue.toString();
      let finalString = (number < 0)?"-"+absoluteString:absoluteString;
      return finalString;
  }

}


export class MapValueBuilderV13
  extends BaseValueBuilderV13
  implements ValueBuilderIfcV13
{
  // reference: https://graphdb.ontotext.com/documentation/standard/geosparql-support.html
  build(): Pattern[] {
    let widgetValues = this.values as MapCriteria[];

    // the property between the subject and its position expressed as wkt value, e.g. http://www.w3.org/2003/01/geo/wgs84_pos#geometry

    let filterPtrn: PatternFilter = SparqlFactoryV13.buildFilterFunctionCall(
      GEOFUNCTIONS.WITHIN.value,
      [
        SparqlFactoryV13.buildVariable(this.endClassVal.value),
        this.#buildPolygon(widgetValues[0].coordinates[0]),
      ]
    );

    return [filterPtrn];
  }

  #buildPolygon(coordinates: {lat: number; lng: number;}[]) {
    let polygon = "";
    coordinates.forEach((coordinat) => {
      polygon = `${polygon}${coordinat.lng} ${coordinat.lat}, `;
    });
    // polygon must be closed with the starting point
    let startPt = coordinates[0];
    let literal: TermLiteral = SparqlFactoryV13.buildLiteral(
      `Polygon((${polygon}${startPt.lng} ${startPt.lat}))`,
      SparqlFactoryV13.buildNamedNode(GEOSPARQL.WKT_LITERAL.value)
    );

    return literal;
  }
}
