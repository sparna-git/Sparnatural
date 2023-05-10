import factory from "@rdfjs/data-model";
// import Streamify from 'streamify-string';
var Readable = require('stream').Readable
import rdfParser from "rdf-parse";
import { NamedNode, Quad, Store } from "n3";
import { storeStream } from "rdf-store-stream";
import { Config } from "../../ontologies/SparnaturalConfig";
import ISparnaturalSpecification from "../ISparnaturalSpecification";
import Datasources from "../../ontologies/SparnaturalConfigDatasources";
import {
  Parser,
  Generator,
  SparqlParser,
  SparqlGenerator
} from "sparqljs";
import { BaseRDFReader } from "../BaseRDFReader";
import ISpecificationEntity from "../ISpecificationEntity";
import { OWLSpecificationEntity } from "./OWLSpecificationEntity";
import ISpecificationProperty from "../ISpecificationProperty";
import { OWLSpecificationProperty } from "./OWLSpecificationProperty";

const RDF_NAMESPACE = "http://www.w3.org/1999/02/22-rdf-syntax-ns#";
export const RDF = {
  TYPE: factory.namedNode(RDF_NAMESPACE + "type") as NamedNode,
  FIRST: factory.namedNode(RDF_NAMESPACE + "first") as NamedNode,
  REST: factory.namedNode(RDF_NAMESPACE + "rest") as NamedNode,
  NIL: factory.namedNode(RDF_NAMESPACE + "nil") as NamedNode,
};

const RDFS_NAMESPACE = "http://www.w3.org/2000/01/rdf-schema#";
export const RDFS = {
  LABEL: factory.namedNode(RDFS_NAMESPACE + "label") as NamedNode,
  DOMAIN: factory.namedNode(RDFS_NAMESPACE + "domain") as NamedNode,
  RANGE: factory.namedNode(RDFS_NAMESPACE + "range") as NamedNode,
  SUBPROPERTY_OF: factory.namedNode(
    RDFS_NAMESPACE + "subPropertyOf"
  ) as NamedNode,
  SUBCLASS_OF: factory.namedNode(RDFS_NAMESPACE + "subClassOf") as NamedNode,
};

const GEOFUNCTIONS_NAMESPACE = 'http://www.opengis.net/def/function/geosparql/'

export const GEOF = {
  WITHIN: factory.namedNode(GEOFUNCTIONS_NAMESPACE + 'sfWithin') as NamedNode
}

const OWL_NAMESPACE = "http://www.w3.org/2002/07/owl#";
export const OWL = {
  EQUIVALENT_PROPERTY: factory.namedNode(
    OWL_NAMESPACE + "equivalentProperty"
  ) as NamedNode,
  EQUIVALENT_CLASS: factory.namedNode(
    OWL_NAMESPACE + "equivalentClass"
  ) as NamedNode,
  UNION_OF: factory.namedNode(OWL_NAMESPACE + "unionOf") as NamedNode,
};

export class OWLSpecificationProvider extends BaseRDFReader implements ISparnaturalSpecification {
  #parser: SparqlParser;
  #generator: SparqlGenerator;

  constructor(n3store: Store<Quad>, lang: string) {
    super(n3store, lang);

    // init SPARQL parser and generator once
    this.#parser = new Parser();
    this.#generator = new Generator();

    /*
    var sparql = `
    SELECT ?o2 WHERE {
        {
            SELECT ?x WHERE { ?x ?p ?o }
        }
        ?x ?p2 ?o2 .
    }
    `;

    var query = this.#parser.parse(sparql);
    console.log(query)
    */
  }

  getLanguages(): string[] {
    let languages = this.store
      .getQuads(null, RDFS.LABEL, null, null)
      .map((quad: { object: any }) => quad.object.language);
    // deduplicate the list of languages
    return [...new Set(languages)];
  }

  getEntity(entityUri: string): ISpecificationEntity {
    return new OWLSpecificationEntity(
      entityUri,
      this,
      this.store,
      this.lang
    );
  }

  getProperty(property: string): ISpecificationProperty {
    return new OWLSpecificationProperty(
      property,
      this,
      this.store,
      this.lang
    );
  }  

  getAllSparnaturalEntities() {
    var classes = this.getEntitiesInDomainOfAnyProperty();
    // copy initial array
    var result = classes.slice();
    // now look for all classes we can reach from this class list
    for (const aClass of classes) {
      var connectedClasses = this.getEntity(aClass).getConnectedEntities();
      for (const aConnectedClass of connectedClasses) {
        this._pushIfNotExist(aConnectedClass, result);
      }
    }
    return result;
  }

  getEntitiesInDomainOfAnyProperty() {
    const quadsArray = this.store.getQuads(
      null,
      RDFS.DOMAIN,
      null,
      null
    );

    var items: string | any[] = [];
    for (const quad of quadsArray) {
      // we are not looking at domains of _any_ property
      // the property we are looking at must be a Sparnatural property, with a known type
      var objectPropertyId = quad.subject.id;
      var typeClass = quad.object.termType;
      var classId = quad.object.id;

      if (this.getProperty(objectPropertyId).getPropertyType()) {
        // keep only Sparnatural classes in the list
        if (this.isSparnaturalClass(classId) || typeClass == "BlankNode") {
          // always exclude RemoteClasses from first list
          if (!this.getEntity(classId).isRemoteEntity()) {
            if (!this._isUnionClass(classId)) {
              this._pushIfNotExist(classId, items);
            } else {
              // read union content
              var classesInUnion = this._readUnionContent(classId);
              for (const aUnionClass of classesInUnion) {
                this._pushIfNotExist(aUnionClass, items);
              }
            }
          }
        }
      }
    }

    items = this._sort(items);

    console.log("Classes in domain of any property " + items);
    return items;
  }

  isSparnaturalClass(classUri: string) {
    return (
      this.store.getQuads(
        factory.namedNode(classUri),
        RDFS.SUBCLASS_OF,
        factory.namedNode(Config.SPARNATURAL_CLASS),
        null
      ).length > 0 ||
      this.store.getQuads(
        factory.namedNode(classUri),
        RDFS.SUBCLASS_OF,
        factory.namedNode(Config.NOT_INSTANTIATED_CLASS),
        null
      ).length > 0 ||
      this.store.getQuads(
        factory.namedNode(classUri),
        RDFS.SUBCLASS_OF,
        factory.namedNode(Config.RDFS_LITERAL),
        null
      ).length > 0
    );
  }

  expandSparql(sparql: string, prefixes:{ [key: string]: string }) {
    // for each owl:equivalentProperty ...
    var equivalentPropertiesPerProperty: any = {};
    this.store
      .getQuads(null, OWL.EQUIVALENT_PROPERTY, null, null)
      .forEach(
        (quad: { subject: { id: string | number }; object: { id: any } }) => {
          // store it if multiple equivalences are declared
          if (!equivalentPropertiesPerProperty[quad.subject.id]) {
            equivalentPropertiesPerProperty[quad.subject.id] = [];
          }
          equivalentPropertiesPerProperty[quad.subject.id].push(quad.object.id);
        }
      );
    // join the equivalences with a |
    for (let [property, equivalents] of Object.entries(
      equivalentPropertiesPerProperty
    )) {
      var re = new RegExp("<" + property + ">", "g");
      sparql = sparql.replace(
        re,
        "<" + (equivalents as Array<any>).join(">|<") + ">"
      );
    }

    // for each owl:equivalentClass ...
    var equivalentClassesPerClass: any = {};
    this.store
      .getQuads(null, OWL.EQUIVALENT_CLASS, null, null)
      .forEach(
        (quad: { subject: { id: string | number }; object: { id: any } }) => {
          // store it if multiple equivalences are declared
          if (!equivalentClassesPerClass[quad.subject.id]) {
            equivalentClassesPerClass[quad.subject.id] = [];
          }
          equivalentClassesPerClass[quad.subject.id].push(quad.object.id);
        }
      );
    // use a VALUES if needed
    var i = 0;
    for (let [aClass, equivalents] of Object.entries(
      equivalentClassesPerClass
    )) {
      var re = new RegExp("<" + aClass + ">", "g");
      if ((equivalents as Array<any>).length == 1) {
        sparql = sparql.replace(re, "<" + (equivalents as Array<any>)[0] + ">");
      } else {
        sparql = sparql.replace(
          re,
          "?class" +
            i +
            " . VALUES ?class" +
            i +
            " { <" +
            (equivalents as Array<any>).join("> <") +
            "> } "
        );
      }
      i++;
    }

    // for each sparqlString
    this.store
      .getQuads(null, Config.SPARQL_STRING, null, null)
      .forEach((quad: { subject: { id: string }; object: { value: any } }) => {
        // find it with the full URI
        var re = new RegExp("<" + quad.subject.id + ">", "g");
        sparql = sparql.replace(re, quad.object.value);
      });

    // reparse the query, apply prefixes, and reserialize the query
    console.log(sparql)
    var query = this.#parser.parse(sparql);
    for (var key in prefixes) {
      query.prefixes[key] = prefixes[key];
    }
    return this.#generator.stringify(query);

    // return sparql;
  }

  _sort(items: any[]) {
    var me = this;
    const compareFunction = function (item1: any, item2: any) {
      // return me.getLabel(item1).localeCompare(me.getLabel(item2));

      var order1 = me._readOrder(item1);
      var order2 = me._readOrder(item2);

      if (order1) {
        if (order2) {
          if (order1 == order2) {
            return me.getEntity(item1).getLabel().localeCompare(me.getEntity(item2).getLabel());
          } else {
            // if the order is actually a number, convert it to number and use a number conversion
            if(!isNaN(Number(order1)) && !isNaN(Number(order2))) {
              return Number(order1) - Number(order2);
            } else {
              return (order1 > order2) ? 1 : -1;
            }
          }
        } else {
          return -1;
        }
      } else {
        if (order2) {
          return 1;
        } else {
          return me.getEntity(item1).getLabel().localeCompare(me.getEntity(item2).getLabel());
        }
      }
    };

    // sort according to order or label
    items.sort(compareFunction);
    return items;
  }

  /**
   * Reads config:order of an entity and returns it, or null if not set
   **/
  _readOrder(uri: any) {
    return this._readAsSingleLiteral(uri, Config.ORDER);
  }



  /*** Handling of UNION classes ***/

  _readUnionContent(classUri: any) {
    var lists = this._readAsRdfNode(factory.namedNode(classUri), OWL.UNION_OF);
    if (lists.length > 0) {
      return this._readList_rec(lists[0]);
    }
  }

  _isUnionClass(classUri: any) {
    return this._hasProperty(factory.namedNode(classUri), OWL.UNION_OF);
  }

  /*** / Handling of UNION classes ***/


}
