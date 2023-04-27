import { BaseRDFReader } from "../BaseRDFReader";
import ISpecificationEntity from "../ISpecificationEntity";
import { Quad, Store } from "n3";
import { OWLSpecificationEntry } from "./OWLSpecificationEntry";
import { OWL, OWLSpecificationProvider, RDF, RDFS } from "./OWLSpecificationProvider";
import factory from "@rdfjs/data-model";
import { Config } from "../../ontologies/SparnaturalConfig";
import ISpecificationProperty from "../ISpecificationProperty";

export class OWLSpecificationProperty extends OWLSpecificationEntry implements ISpecificationProperty {

  constructor(uri:string, provider: OWLSpecificationProvider, n3store: Store<Quad>, lang: string) {
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
      if (!this._isUnionClass(aQuad.object.id)) {
        this._pushIfNotExist(aQuad.object.id, classes);
      } else {
        // read union content
        var classesInUnion = this._readUnionContent(aQuad.object.id);
        if(classesInUnion) {
            for (const aUnionClass of classesInUnion) {
            this._pushIfNotExist(aUnionClass, classes);
            }
        }
      }
    }

    return classes;
  }


  getPropertyType():string|undefined {
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

  isMultilingual(): boolean {
    return (
      this._readAsSingleLiteral(this.uri, Config.IS_MULTILINGUAL) == "true"
    );
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

  _readUnionContent(classUri: any) {
    var lists = this._readAsRdfNode(factory.namedNode(classUri), OWL.UNION_OF);
    if (lists.length > 0) {
      return this._readList_rec(lists[0]);
    }
  }

    
}