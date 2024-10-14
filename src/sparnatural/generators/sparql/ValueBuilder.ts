import { BgpPattern, BlankTerm, FilterPattern, FunctionCallExpression, IriTerm, LiteralTerm, Pattern, Triple, ValuePatternRow, ValuesPattern } from "sparqljs";
import { SelectedVal } from "../../components/SelectedVal";
import { RDFTerm, RdfTermValue, WidgetValue } from "../../components/widgets/AbstractWidget";
import SparqlFactory from "./SparqlFactory";
import { DataFactory, NamedNode } from "rdf-data-factory";
import { SelectAllValue } from "../../components/builder-section/groupwrapper/criteriagroup/edit-components/EditComponents";
import { BooleanWidgetValue } from "../../components/widgets/BooleanWidget";
import { NumberWidgetValue } from "../../components/widgets/NumberWidget";
import ISparnaturalSpecification from "../../spec-providers/ISparnaturalSpecification";
import { Config } from "../../ontologies/SparnaturalConfig";
import { SearchRegexWidgetValue } from "../../components/widgets/SearchRegexWidget";
import { DateTimePickerValue } from "../../components/widgets/timedatepickerwidget/TimeDatePickerWidget";
import { buildDateRangeOrExactDatePattern } from "../../components/widgets/timedatepickerwidget/TimeDatePattern";
import { MapValue } from "../../components/widgets/MapWidget";
import { LatLng } from "leaflet";


const factory = new DataFactory();

/**
 * A factory for creating ValueBuilders from the widgetType. This is the association between the widget type
 * and the corresponding ValueBuilder
 */
export class ValueBuilderFactory {

  buildValueBuilder(
    widgetType:string
  ):ValueBuilderIfc {

    switch (widgetType) {
      case Config.LITERAL_LIST_PROPERTY:
      case Config.LIST_PROPERTY:
      case Config.TREE_PROPERTY:
      case Config.AUTOCOMPLETE_PROPERTY:
        return new RdfTermValueBuilder();

      case Config.VIRTUOSO_SEARCH_PROPERTY:
      case Config.GRAPHDB_SEARCH_PROPERTY:
      case Config.STRING_EQUALS_PROPERTY:
      case Config.SEARCH_PROPERTY:
        return new SearchRegexValueBuilder();
      
      case Config.NON_SELECTABLE_PROPERTY:
        return new NonSelectableValueBuilder();
      
      case Config.BOOLEAN_PROPERTY:
        return new BooleanValueBuilder();
      
      case Config.MAP_PROPERTY:
        return new MapValueBuilder();
      
      case Config.NUMBER_PROPERTY:
        return new NumberValueBuilder();

      case Config.TIME_PROPERTY_YEAR:
      case Config.TIME_PROPERTY_DATE:
        return new DateTimePickerValueBuilder();

      case Config.TIME_PROPERTY_PERIOD:
        console.warn(Config.TIME_PROPERTY_PERIOD+" is not implement yet");
        break;

      default:
        throw new Error(`WidgetType ${widgetType} not recognized`);
    }
  }

}

/**
 * Builds a SPARQL pattern from a (list of) widget values
 */
export default interface ValueBuilderIfc {

    init(
        specProvider: ISparnaturalSpecification,
        startClassVal: SelectedVal,
        propertyVal: SelectedVal,
        endClassVal: SelectedVal,
        endClassVarSelected: boolean,
        values: Array<WidgetValue>
    ):void;

    /**
     * main method : builds the SPARQL pattern
     */
    build():Pattern[];

    /**
     * @returns true if the rdf:type criteria of the subject must not be generated
     */
    isBlockingStart(): boolean;
    
    /**
     * @returns true if the rdf:type criteria of the object variable must not be generated
     */
    isBlockingEnd(): boolean;

    /**
     * @returns true if the triple criteria between the subject and the object must not be generated
     */
    isBlockingObjectProp(): boolean;

}

export abstract class BaseValueBuilder implements ValueBuilderIfc {

    protected specProvider: ISparnaturalSpecification;
    protected startClassVal: SelectedVal;
    protected propertyVal: SelectedVal;
    protected endClassVal: SelectedVal;
    protected values: Array<WidgetValue>;
    protected endClassVarSelected: boolean;

    init(
        specProvider: ISparnaturalSpecification,
        startClassVal: SelectedVal,
        propertyVal: SelectedVal,
        endClassVal: SelectedVal,
        endClassVarSelected: boolean,
        values: Array<WidgetValue>
    ): void {
        this.specProvider = specProvider;
        this.startClassVal = startClassVal;
        this.propertyVal = propertyVal;
        this.endClassVal = endClassVal;
        this.endClassVarSelected = endClassVarSelected;
        this.values = values;
    }

    abstract build():Pattern[];

    isBlockingStart(): boolean {
      return false;
    }

    isBlockingEnd(): boolean {
        return false;
    }

    isBlockingObjectProp(): boolean {
        return false
    }

}

/**
 * A ValueBuilder that can work from an RdfTermValue and tests the equality either
 * by inserting the sole unique value as the object of the triple or by using a VALUES clause
 */
export class RdfTermValueBuilder extends BaseValueBuilder implements ValueBuilderIfc {

    build(): Pattern[] {

        let widgetValues = this.values as RdfTermValue[];

        if(this.isBlockingObjectProp()) {
            let singleTriple: Triple = SparqlFactory.buildTriple(
                factory.variable(this.startClassVal.variable),
                factory.namedNode(this.propertyVal.type),
                this.#rdfTermToSparqlQuery(widgetValues[0].value.rdfTerm)
            );
        
            let ptrn: BgpPattern = {
                type: "bgp",
                triples: [singleTriple],
            };        
        
            return [ptrn];
        } else {
            let vals = widgetValues.map((v) => {
                let vl: ValuePatternRow = {};
                vl["?"+this.endClassVal.variable] = this.#rdfTermToSparqlQuery(v.value.rdfTerm);
                return vl;
            });
            let valuePattern: ValuesPattern = {
                type: "values",
                values: vals,
            };
            return [valuePattern];
        }
    }

  /**
   * Translates an IRI, Literal or BNode into the corresponding SPARQL query term
   * to be inserted in a SPARQL query.
   * @returns 
   */
    #rdfTermToSparqlQuery(rdfTerm:RDFTerm): IriTerm | BlankTerm | LiteralTerm {
        if(rdfTerm.type == "uri") {
            return factory.namedNode(rdfTerm.value);
        } else if(rdfTerm.type == "literal") {
            if(rdfTerm["xml:lang"]) {
            return factory.literal(rdfTerm.value, rdfTerm["xml:lang"]);
            } else if(rdfTerm.datatype) {
            // if the second parameter is a NamedNode, then it is considered a datatype, otherwise it is
            // considered like a language
            // so we make the datatype a NamedNode
            let namedNodeDatatype = factory.namedNode(rdfTerm.datatype);
            return factory.literal(rdfTerm.value, namedNodeDatatype);
            } else {
            return factory.literal(rdfTerm.value);
            }
        } else if(rdfTerm.type == "bnode") {
            // we don't know what to do with this, but don't trigger an error
            return factory.blankNode(rdfTerm.value);
        } else {
            throw new Error("Unexpected rdfTerm type "+rdfTerm.type)
        }
    }

    /**
     * @returns true if there is at least one value, because in that case the rdf:type criteria is redundant
     */
    isBlockingEnd(): boolean {
        return (
            this.values?.length > 0
        );
    }

    /**
     * @returns true if there is a single value and the end class is not selected (in which case we need the variable
     * to put it in the SELECT clause)
     */
    isBlockingObjectProp(): boolean {
        return (
            this.values?.length == 1
            &&
            !(this.endClassVarSelected)
          );
    }   

}

export class BooleanValueBuilder extends BaseValueBuilder implements ValueBuilderIfc {

    build(): Pattern[] {
        let widgetValues = this.values as BooleanWidgetValue[];

        // if we are blocking the object prop, we create it directly here with the value as the object
        if(this.isBlockingObjectProp()) {
            let ptrn: BgpPattern = {
            type: "bgp",
            triples: [
                {
                    subject: factory.variable(this.startClassVal.variable),
                    predicate: factory.namedNode(this.propertyVal.type),
                    object: factory.literal(
                        widgetValues[0].value.boolean.toString(),
                        factory.namedNode("http://www.w3.org/2001/XMLSchema#boolean")
                    ),
                },
            ],
            };
            return [ptrn];
        } else {
            // otherwise the object prop is created and we create a VALUES clause with the actual boolean
            let vals = (this.values as BooleanWidgetValue[]).map((v) => {
                let vl: ValuePatternRow = {};
                vl["?"+this.endClassVal.variable] = factory.literal(
                    widgetValues[0].value.boolean.toString(),
                    factory.namedNode("http://www.w3.org/2001/XMLSchema#boolean")
                );
                return vl;
            });
            let valuePattern: ValuesPattern = {
                type: "values",
                values: vals,
            };
            return [valuePattern];
        }
    }

   /**
    * Blocks if a value is selected and this is not the "all" special value
    * @returns true
    */
   isBlockingObjectProp() {
    return (
      this.values?.length == 1
      &&
      !(this.values[0] instanceof SelectAllValue)
      &&
      !(this.endClassVarSelected)
    );
   }

}

export class NumberValueBuilder extends BaseValueBuilder implements ValueBuilderIfc {

    build(): Pattern[] {
        
        let widgetValues = this.values as NumberWidgetValue[];
        
        return [
            SparqlFactory.buildFilterRangeDateOrNumber(
              (widgetValues[0].value.min != undefined)?factory.literal(
                widgetValues[0].value.min.toString(),
                factory.namedNode("http://www.w3.org/2001/XMLSchema#decimal")
              ):null,
              (widgetValues[0].value.max != undefined)?factory.literal(
                widgetValues[0].value.max.toString(),
                factory.namedNode("http://www.w3.org/2001/XMLSchema#decimal")
              ):null,
              factory.variable(this.endClassVal.variable)
            )
          ];   
    }

}

export class NonSelectableValueBuilder extends BaseValueBuilder implements ValueBuilderIfc {
  build(): Pattern[] {
      return [];   
  }

}

export class SearchRegexValueBuilder extends BaseValueBuilder implements ValueBuilderIfc {

    build(): Pattern[] {
 
        let widgetType = this.specProvider.getProperty(this.propertyVal.type).getPropertyType(this.endClassVal.type)
        let widgetValues = this.values as SearchRegexWidgetValue[];

        switch(widgetType) {
            case Config.STRING_EQUALS_PROPERTY: {
              // builds a FILTER(lcase(...) = lcase(...))
              return [SparqlFactory.buildFilterStringEquals(
                factory.literal(
                  `${widgetValues[0].value.regex}`
                ),
                factory.variable(this.endClassVal.variable)
              )];
            }
            case Config.SEARCH_PROPERTY: {
              // builds a FILTER(regex(...,...,"i"))
              return [SparqlFactory.buildFilterRegex(
                factory.literal(
                  `${widgetValues[0].value.regex}`
                ),
                factory.variable(this.endClassVal.variable)
              )];
            }
            case Config.GRAPHDB_SEARCH_PROPERTY: {
              // builds a GraphDB-specific search pattern
              let ptrn: BgpPattern = {
                type: "bgp",
                triples: [
                  {
                    subject: factory.variable(this.startClassVal.variable),
                    predicate: factory.namedNode(
                      "http://www.ontotext.com/connectors/lucene#query"
                    ),
                    object: factory.literal(
                      `text:${widgetValues[0].value.regex}`
                    ),
                  },
                  {
                    subject: factory.variable(this.startClassVal.variable),
                    predicate: factory.namedNode(
                      "http://www.ontotext.com/connectors/lucene#entities"
                    ),
                    object: factory.variable(this.endClassVal.variable),
                  },
                ],
              };
              return [ptrn];
            }
            case Config.VIRTUOSO_SEARCH_PROPERTY: {
              let bif_query = widgetValues[0].value.label
                .replace(/[\"']/g, " ")
                .split(" ")
                .map((e) => `'${e}'`)
                .join(" and ");
              console.log(bif_query);
              let ptrn: BgpPattern = {
                type: "bgp",
                triples: [
                  {
                    subject: factory.variable(this.endClassVal.variable),
                    predicate: factory.namedNode(
                      "http://www.openlinksw.com/schemas/bif#contains"
                    ),
                    object: factory.literal(`${bif_query}`),
                  },
                ],
              };
              return [ptrn];
            }
            case Config.JENA_SEARCH_PROPERTY: {
              throw new Error("Not implemented yet")
            }
          }

    }

}

export class DateTimePickerValueBuilder extends BaseValueBuilder implements ValueBuilderIfc {

    build(): Pattern[] {
        
        let widgetValues = this.values as DateTimePickerValue[];
        
        let beginDateProp = this.specProvider.getProperty(this.propertyVal.type).getBeginDateProperty();
        let endDateProp = this.specProvider.getProperty(this.propertyVal.type).getEndDateProperty();
    
        if(beginDateProp != null && endDateProp != null) {
          let exactDateProp = this.specProvider.getProperty(this.propertyVal.type).getExactDateProperty();
    
          return [
            buildDateRangeOrExactDatePattern(
              widgetValues[0].value.start?factory.literal(
                this.#formatSparqlDate(widgetValues[0].value.start),
                factory.namedNode("http://www.w3.org/2001/XMLSchema#dateTime")
              ):null,
              widgetValues[0].value.stop?factory.literal(
                this.#formatSparqlDate(widgetValues[0].value.stop),
                factory.namedNode("http://www.w3.org/2001/XMLSchema#dateTime")
              ):null,
              factory.variable(this.startClassVal.variable),
              factory.namedNode(beginDateProp),
              factory.namedNode(endDateProp),
              exactDateProp != null?factory.namedNode(exactDateProp):null,
              factory.variable(this.endClassVal.variable)
            )
          ];
        } else {
          return [
            SparqlFactory.buildFilterRangeDateOrNumber(
              widgetValues[0].value.start?factory.literal(
                this.#formatSparqlDate(widgetValues[0].value.start),
                factory.namedNode("http://www.w3.org/2001/XMLSchema#dateTime")
              ):null,
              widgetValues[0].value.stop?factory.literal(
                this.#formatSparqlDate(widgetValues[0].value.stop),
                factory.namedNode("http://www.w3.org/2001/XMLSchema#dateTime")
              ):null,
              factory.variable(this.endClassVal.variable)
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
        let beginDateProp = this.specProvider.getProperty(this.propertyVal.type).getBeginDateProperty();
        let endDateProp = this.specProvider.getProperty(this.propertyVal.type).getEndDateProperty();

        return (beginDateProp != null && endDateProp != null);
    }

    /**
     * 
     * @param date Formats the date to insert in the SPARQL query. We cannot rely on toISOString() method
     * since it does not properly handle negative year and generates "-000600-12-31" while we want "-0600-12-31"
     * @returns 
     */
    #formatSparqlDate(date:Date) {
        if(date == null) return null;

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

const GEOFUNCTIONS_NAMESPACE = 'http://www.opengis.net/def/function/geosparql/'
export const GEOFUNCTIONS = {
  WITHIN: factory.namedNode(GEOFUNCTIONS_NAMESPACE + 'sfWithin') as NamedNode
}

const GEOSPARQL_NAMESPACE = "http://www.opengis.net/ont/geosparql#"
export const GEOSPARQL = {
  WKT_LITERAL: factory.namedNode(GEOSPARQL_NAMESPACE + 'wktLiteral') as NamedNode
}

export class MapValueBuilder extends BaseValueBuilder implements ValueBuilderIfc {

    // reference: https://graphdb.ontotext.com/documentation/standard/geosparql-support.html
    build(): Pattern[] {
        let widgetValues = this.values as MapValue[];

        // the property between the subject and its position expressed as wkt value, e.g. http://www.w3.org/2003/01/geo/wgs84_pos#geometry

        let filterPtrn: FilterPattern = {
            type: "filter",
            expression: <FunctionCallExpression><unknown>{
                type: "functionCall",
                function: GEOFUNCTIONS.WITHIN,
                args: [
                factory.variable(this.endClassVal.variable),
                this.#buildPolygon(widgetValues[0].value.coordinates[0])
                ],
            },
        };
      
        return [filterPtrn];
 
    }

    #buildPolygon(coordinates: LatLng[]) {
        let polygon = "";
        coordinates.forEach((coordinat) => {
          polygon = `${polygon}${coordinat.lng} ${coordinat.lat}, `;
        });
        // polygon must be closed with the starting point
        let startPt = coordinates[0]
        let literal: LiteralTerm = factory.literal(
          `Polygon((${polygon}${startPt.lng} ${startPt.lat}))`,
          GEOSPARQL.WKT_LITERAL
        )
    
        return literal;
    }     
    
}