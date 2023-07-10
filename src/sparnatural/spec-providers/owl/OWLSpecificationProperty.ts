import { RDFS } from "../BaseRDFReader";
import { OWLSpecificationEntry } from "./OWLSpecificationEntry";
import { OWL, OWLSpecificationProvider } from "./OWLSpecificationProvider";
import { DataFactory } from 'rdf-data-factory';
import { Config } from "../../ontologies/SparnaturalConfig";
import ISpecificationProperty from "../ISpecificationProperty";
import Datasources from "../../ontologies/SparnaturalConfigDatasources";
import { RdfStore } from "rdf-stores";

const factory = new DataFactory();

export class OWLSpecificationProperty extends OWLSpecificationEntry implements ISpecificationProperty {

  constructor(uri:string, provider: OWLSpecificationProvider, n3store: RdfStore, lang: string) {
    super(uri, provider, n3store, lang);
  }


  getRange(): string[] {
    var classes: any[] = [];

    const propertyQuads = this.store.getQuads(
      factory.namedNode(this.uri),
      RDFS.RANGE,
      null,
      null
    );

    for (const aQuad of propertyQuads) {
      if (!this._isUnionClass(aQuad.object.value)) {
        this._pushIfNotExist(aQuad.object.value, classes);
      } else {
        // read union content
        var classesInUnion = this._readAsList(aQuad.object, OWL.UNION_OF).map(o => o.id)
        if(classesInUnion) {
            for (const aUnionClass of classesInUnion) {
            this._pushIfNotExist(aUnionClass, classes);
            }
        }
      }
    }

    return classes;
  }


  getPropertyType(range:string):string|undefined {
    var superProperties = this._readAsResource(
      this.uri,
      RDFS.SUBPROPERTY_OF
    );

    var KNOWN_PROPERTY_TYPES = [
      Config.LIST_PROPERTY,
      Config.LITERAL_LIST_PROPERTY,
      Config.TIME_PROPERTY_PERIOD,
      Config.TIME_PROPERTY_YEAR,
      Config.TIME_PROPERTY_DATE,
      Config.AUTOCOMPLETE_PROPERTY,
      Config.SEARCH_PROPERTY,
      Config.STRING_EQUALS_PROPERTY,
      Config.GRAPHDB_SEARCH_PROPERTY,
      Config.VIRTUOSO_SEARCH_PROPERTY,
      Config.NON_SELECTABLE_PROPERTY,
      Config.BOOLEAN_PROPERTY,
      Config.TREE_PROPERTY,
      Config.MAP_PROPERTY,
    ];

    // only return the type if it is a known type
    for (const aSuperProperty of superProperties) {
      if (KNOWN_PROPERTY_TYPES.includes(aSuperProperty)) {
        return aSuperProperty;
      }
    }

    return undefined;
  }

  getDatasource() {
    return this._readDatasourceAnnotationProperty(
        this.uri,
        Datasources.DATASOURCE
    );
  }

  getTreeChildrenDatasource() {
      return this._readDatasourceAnnotationProperty(
          this.uri,
          Datasources.TREE_CHILDREN_DATASOURCE
        );
  }

  getTreeRootsDatasource() {
      return this._readDatasourceAnnotationProperty(
          this.uri,
          Datasources.TREE_ROOTS_DATASOURCE
      );
  }

  isMultilingual(): boolean {
    return (
      this._readAsSingleLiteral(this.uri, Config.IS_MULTILINGUAL) == "true"
    );
  }

  omitClassCriteria(): boolean {
    return false;
  }

  getBeginDateProperty(): string | null {
    return this._readAsSingleResource(this.uri, Config.BEGIN_DATE_PROPERTY);
  }

  getEndDateProperty(): string | null {
    return this._readAsSingleResource(this.uri, Config.END_DATE_PROPERTY);
  }

  getExactDateProperty(): string | null {
    return this._readAsSingleResource(this.uri, Config.EXACT_DATE_PROPERTY);
  }

  isEnablingNegation(): boolean {
    return (
      this._readAsSingleLiteral(this.uri, Config.ENABLE_NEGATION) == "true"
    );
  }

  isEnablingOptional(): boolean {
    return (
      this._readAsSingleLiteral(this.uri, Config.ENABLE_OPTIONAL) == "true"
    );
  }

  getServiceEndpoint(): string | null {
    const service = this._readAsSingleResource(this.uri,Config.SPARQL_SERVICE);
    if(service) {
      const endpoint = this._readAsSingleResource(service,Config.ENDPOINT);
      if (endpoint) {
        return endpoint;
      } 
    }    
    return null;
  }

  isLogicallyExecutedAfter(): boolean {
    var executedAfter = this._readAsSingleLiteral(this.uri, Config.SPARNATURAL_CONFIG_CORE+"executedAfter");
    return executedAfter;
  }

  _isUnionClass(classUri: any) {
    return this._hasProperty(factory.namedNode(classUri), OWL.UNION_OF);
  }

    
}