import factory from "@rdfjs/data-model";
// import Streamify from 'streamify-string';
var Readable = require('stream').Readable
import rdfParser from "rdf-parse";
import { NamedNode, Quad, Store } from "n3";
import { storeStream } from "rdf-store-stream";
import { Config } from "../ontologies/SparnaturalConfig";
import ISpecProvider from "./ISpecProvider";
import Datasources from "../ontologies/SparnaturalConfigDatasources";
import {
  Parser,
  Generator,
  SparqlParser,
  SparqlGenerator
} from "sparqljs";

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

export class RDFSpecificationProvider implements ISpecProvider {
  lang: string;
  store: Store<Quad>;
  #parser: SparqlParser;
  #generator: SparqlGenerator;

  constructor(n3store: Store<Quad>, lang: string) {
    // init memory store
    this.store = n3store;
    this.lang = lang;

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

  static build(specs: any, filePath: string, lang: any, callback: any) {
    console.log("Building RDFSpecificationProvider from " + filePath);

    // turn input string into a stream
    var textStream = new Readable();
    textStream.push(specs)    // the string you want
    textStream.push(null)     // indicates end-of-file basically - the end of the stream

    var quadStream;
    try {
      // attempt to parse based on path
      console.log("Attempt to parse determining format from path " + filePath+"...");
      quadStream = rdfParser.parse(textStream, { path: filePath });
    } catch (exception) {
      try {
        console.log("Attempt to parse in Turtle...");
        // attempt to parse in turtle
        quadStream = rdfParser.parse(textStream, {
          contentType: "text/turtle",
        });
      } catch (exception) {
        console.log("Attempt to parse in RDF/XML...");
        // attempt to parse in RDF/XML
        quadStream = rdfParser.parse(textStream, {
          contentType: "application/rdf+xml",
        });
      }
    }

    // import into store
    storeStream(quadStream).then((theStore:Store<Quad>) => {
      console.log(
        "Specification store populated with " +
          theStore.countQuads(
            undefined,
            undefined,
            undefined,
            undefined
          ) +
          " triples."
      );
      var provider = new RDFSpecificationProvider(
        theStore,
        lang
      );
      callback(provider);
    });
  }

  getAllSparnaturalClasses() {
    var classes = this.getClassesInDomainOfAnyProperty();
    // copy initial array
    var result = classes.slice();
    // now look for all classes we can reach from this class list
    for (const aClass of classes) {
      var connectedClasses = this.getConnectedClasses(aClass);
      for (const aConnectedClass of connectedClasses) {
        this._pushIfNotExist(aConnectedClass, result);
      }
    }
    return result;
  }

  getServiceEndpoint(propertyId:string){
    if(propertyId == null) return null;

    const service = this._readAsSingleResource(propertyId,Config.SPARQL_SERVICE);
    if(service) {
      const endpoint = this._readAsSingleResource(service,Config.ENDPOINT);
      if (endpoint) {
        return endpoint;
      } 
    }    
    return null;
  }

  isLogicallyExecutedAfter(propertyId:string):boolean {
    var executedAfter = this._readAsSingleLiteral(propertyId, Config.SPARNATURAL_CONFIG_CORE+"executedAfter");
    return executedAfter;
  }

  getClassesInDomainOfAnyProperty() {
    const quadsArray = this.store.getQuads(
      undefined,
      RDFS.DOMAIN,
      undefined,
      undefined
    );

    var items: string | any[] = [];
    for (const quad of quadsArray) {
      // we are not looking at domains of _any_ property
      // the property we are looking at must be a Sparnatural property, with a known type
      var objectPropertyId = quad.subject.id;
      var typeClass = quad.object.termType;
      var classId = quad.object.id;

      if (this.getObjectPropertyType(objectPropertyId)) {
        // keep only Sparnatural classes in the list
        if (this.isSparnaturalClass(classId) || typeClass == "BlankNode") {
          // always exclude RemoteClasses from first list
          if (!this.isRemoteClass(classId)) {
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

  getLabel(entityId: any) {
    return this._readAsLiteralWithLang(entityId, RDFS.LABEL, this.lang);
  }

  getTooltip(entityId: any) {
    return this._readAsLiteralWithLang(entityId, Config.TOOLTIP, this.lang);
  }

  getIcon(classId: string) {
    var faIcon = this._readAsLiteral(
      classId,
      factory.namedNode(Config.FA_ICON)
    );
    if (faIcon.length > 0) {
      // use of fa-fw for fixed-width icons
      return (
        "<span style='font-size: 170%;' >&nbsp;<i class='" +
        faIcon +
        " fa-fw'></i></span>"
      );
    } else {
      var icon = this._readAsLiteral(classId, factory.namedNode(Config.ICON));
      if (icon.length > 0) {
        return icon;
      } else {
        // this is ugly, just so it aligns with other entries having an icon
        return "<span style='font-size: 175%;' >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>";
      }
    }
  }

  getHighlightedIcon(classId: string) {
    return this._readAsLiteral(
      classId,
      factory.namedNode(Config.HIGHLIGHTED_ICON)
    );
  }

  getConnectedClasses(classId: string) {
    var items: any[] = [];

    const properties = this._readPropertiesWithDomain(classId);

    // now read their ranges
    for (const aProperty of properties) {
      var classesInRange = this._readClassesInRangeOfProperty(aProperty);

      for (const aClass of classesInRange) {
        // if it is not a Sparnatural Class, read all its subClasses that are Sparnatural classes
        if (!this.isSparnaturalClass(aClass)) {
          // TODO : recursivity
          var subClasses = this._readImmediateSubClasses(aClass);
          for (const aSubClass of subClasses) {
            if (this.isSparnaturalClass(aSubClass)) {
              this._pushIfNotExist(aSubClass, items);
            }
          }
        } else {
          this._pushIfNotExist(aClass, items);
        }
      }
    }

    items = this._sort(items);

    return items;
  }

  hasConnectedClasses(classId: any) {
    return this.getConnectedClasses(classId).length > 0;
  }

  getConnectingProperties(domainClassId: any, rangeClassId: any) {
    var items: any[] = [];

    const properties = this._readPropertiesWithDomain(domainClassId);

    for (const aProperty of properties) {
      var classesInRange = this._readClassesInRangeOfProperty(aProperty);

      if (classesInRange.indexOf(rangeClassId) > -1) {
        this._pushIfNotExist(aProperty, items);
      } else {
        // potentially the select rangeClassId is a subClass, let's look up
        for (const aClass of classesInRange) {
          // TODO : recursivity
          var subClasses = this._readImmediateSubClasses(aClass);
          if (subClasses.indexOf(rangeClassId) > -1) {
            this._pushIfNotExist(aProperty, items);
          }
        }
      }
    }

    items = this._sort(items);

    return items;
  }

  getObjectPropertyType(objectPropertyId: any) {
    var superProperties = this._readAsResource(
      objectPropertyId,
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
    ];

    // only return the type if it is a known type
    for (const aSuperProperty of superProperties) {
      if (KNOWN_PROPERTY_TYPES.includes(aSuperProperty)) {
        return aSuperProperty;
      }
    }

    return undefined;
  }

  isRemoteClass(classUri: string) {
    return (
      this.store.getQuads(
        factory.namedNode(classUri),
        RDFS.SUBCLASS_OF,
        factory.namedNode(Config.NOT_INSTANTIATED_CLASS),
        undefined
      ).length > 0
    );
  }

  isLiteralClass(classUri: string) {
    return (
      this.store.getQuads(
        factory.namedNode(classUri),
        RDFS.SUBCLASS_OF,
        factory.namedNode(Config.RDFS_LITERAL),
        undefined
      ).length > 0
    );
  }

  isSparnaturalClass(classUri: string) {
    return (
      this.store.getQuads(
        factory.namedNode(classUri),
        RDFS.SUBCLASS_OF,
        factory.namedNode(Config.SPARNATURAL_CLASS),
        undefined
      ).length > 0 ||
      this.store.getQuads(
        factory.namedNode(classUri),
        RDFS.SUBCLASS_OF,
        factory.namedNode(Config.NOT_INSTANTIATED_CLASS),
        undefined
      ).length > 0 ||
      this.store.getQuads(
        factory.namedNode(classUri),
        RDFS.SUBCLASS_OF,
        factory.namedNode(Config.RDFS_LITERAL),
        undefined
      ).length > 0
    );
  }

  expandSparql(sparql: string, prefixes:{ [key: string]: string }) {
    // for each owl:equivalentProperty ...
    var equivalentPropertiesPerProperty: any = {};
    this.store
      .getQuads(undefined, OWL.EQUIVALENT_PROPERTY, undefined, undefined)
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
      .getQuads(undefined, OWL.EQUIVALENT_CLASS, undefined, undefined)
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
      .getQuads(undefined, Config.SPARQL_STRING, undefined, undefined)
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

  getDefaultLabelProperty(classId: any) {
    return this._readAsSingleResource(classId, Config.DEFAULT_LABEL_PROPERTY);
  }

  getBeginDateProperty(propertyId: any) {
    return this._readAsSingleResource(propertyId, Config.BEGIN_DATE_PROPERTY);
  }

  getEndDateProperty(propertyId: any) {
    return this._readAsSingleResource(propertyId, Config.END_DATE_PROPERTY);
  }

  getExactDateProperty(propertyId: any) {
    return this._readAsSingleResource(propertyId, Config.EXACT_DATE_PROPERTY);
  }

  getDatasource(propertyOrClassId: any) {
    return this._readDatasourceAnnotationProperty(
      propertyOrClassId,
      Datasources.DATASOURCE
    );
  }

  getTreeRootsDatasource(propertyOrClassId: any) {
    return this._readDatasourceAnnotationProperty(
      propertyOrClassId,
      Datasources.TREE_ROOTS_DATASOURCE
    );
  }

  getTreeChildrenDatasource(propertyOrClassId: any) {
    return this._readDatasourceAnnotationProperty(
      propertyOrClassId,
      Datasources.TREE_CHILDREN_DATASOURCE
    );
  }

  isEnablingOptional(propertyId: any) {
    return (
      this._readAsSingleLiteral(propertyId, Config.ENABLE_OPTIONAL) == "true"
    );
  }

  isEnablingNegation(propertyId: any) {
    return (
      this._readAsSingleLiteral(propertyId, Config.ENABLE_NEGATION) == "true"
    );
  }

  isMultilingual(propertyId: any) {
    return (
      this._readAsSingleLiteral(propertyId, Config.IS_MULTILINGUAL) == "true"
    );
  }

  readRange(propertyId: any) {
    return this._readClassesInRangeOfProperty(propertyId);
  }

  _readDatasourceAnnotationProperty(
    propertyOrClassId: any,
    datasourceAnnotationProperty: any
  ) {
    // read predicate datasource
    const datasourceQuads = this.store.getQuads(
      factory.namedNode(propertyOrClassId),
      datasourceAnnotationProperty,
      undefined,
      undefined
    );

    if (datasourceQuads.length == 0) {
      return null;
    }

    for (const datasourceQuad of datasourceQuads) {
      const datasourceUri = datasourceQuad.object.id;
      var knownDatasource = Datasources.DATASOURCES_CONFIG.get(datasourceUri);
      if (knownDatasource != null) {
        return knownDatasource;
      } else {
        return this._buildDatasource(datasourceUri);
      }
    }

    // IMPORTANT should here be propper error handling?
    return {};
  }

  /**
   * {
   *   queryString: "...",
   *   queryTemplate: "...",
   *   labelPath: "...",
   *   labelProperty: "...",
   *   childrenPath: "...",
   *   childrenProperty: "...",
   *   noSort: true
   * }
   **/

  _buildDatasource(datasourceUri: any) {
    var datasource: {
      queryString?: string;
      queryTemplate?: any;
      labelPath?: any;
      labelProperty?: any;
      childrenPath?: any;
      childrenProperty?: any;
      sparqlEndpointUrl?: any;
      noSort?: any;
    } = {};
    // read datasource characteristics

    // Alternative 1 : read optional queryString
    var queryStrings = this._readAsLiteral(
      datasourceUri,
      Datasources.QUERY_STRING
    );
    if (queryStrings.length > 0) {
      datasource.queryString = queryStrings[0];
    }

    // Alternative 2 : query template + label path
    var queryTemplates = this._readAsResource(
      datasourceUri,
      Datasources.QUERY_TEMPLATE
    );
    if (queryTemplates.length > 0) {
      var theQueryTemplate = queryTemplates[0];
      var knownQueryTemplate =
        Datasources.QUERY_STRINGS_BY_QUERY_TEMPLATE.get(theQueryTemplate);
      if (knownQueryTemplate != null) {
        // 2.1 It is known in default Sparnatural ontology
        datasource.queryTemplate = knownQueryTemplate;
      } else {
        // 2.2 Unknown, read the query string on the query template
        var queryStrings = this._readAsResource(
          theQueryTemplate,
          Datasources.QUERY_STRING
        );
        if (queryStrings.length > 0) {
          var queryString = queryStrings[0];
          datasource.queryTemplate =
            queryString.startsWith('"') && queryString.endsWith('"')
              ? queryString.substring(1, queryString.length - 1)
              : queryString;
        }
      }

      // labelPath
      var labelPaths = this._readAsLiteral(
        datasourceUri,
        Datasources.LABEL_PATH
      );
      if (labelPaths.length > 0) {
        datasource.labelPath = labelPaths[0];
      }

      // labelProperty
      var labelProperties = this._readAsResource(
        datasourceUri,
        Datasources.LABEL_PROPERTY
      );
      if (labelProperties.length > 0) {
        datasource.labelProperty = labelProperties[0];
      }

      // childrenPath
      var childrenPaths = this._readAsLiteral(
        datasourceUri,
        Datasources.CHILDREN_PATH
      );
      if (childrenPaths.length > 0) {
        datasource.childrenPath = childrenPaths[0];
      }

      // childrenProperty
      var childrenProperties = this._readAsResource(
        datasourceUri,
        Datasources.CHILDREN_PROPERTY
      );
      if (childrenProperties.length > 0) {
        datasource.childrenProperty = childrenProperties[0];
      }
    }

    // read optional sparqlEndpointUrl
    var sparqlEndpointUrls = this._readAsLiteral(
      datasourceUri,
      Datasources.SPARQL_ENDPOINT_URL
    );
    if (sparqlEndpointUrls.length > 0) {
      datasource.sparqlEndpointUrl = sparqlEndpointUrls[0];
    }

    // read optional noSort
    var noSorts = this._readAsLiteral(datasourceUri, Datasources.NO_SORT);
    if (noSorts.length > 0) {
      datasource.noSort = noSorts[0] === "true";
    }

    return datasource;
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
            return me.getLabel(item1).localeCompare(me.getLabel(item2));
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
          return me.getLabel(item1).localeCompare(me.getLabel(item2));
        }
      }
    };

    // sort according to order or label
    items.sort(compareFunction);
    return items;
  }

  _readPropertiesWithDomain(classId: any) {
    var properties: any[] = [];

    const propertyQuads = this.store.getQuads(
      undefined,
      RDFS.DOMAIN,
      factory.namedNode(classId),
      undefined
    );

    for (const aQuad of propertyQuads) {
      // only select properties with proper Sparnatural configuration
      if (this.getObjectPropertyType(aQuad.subject.id)) {
        this._pushIfNotExist(aQuad.subject.id, properties);
      }
    }

    // read also the properties having as a domain a union containing this class
    var unionsContainingThisClass = this._readUnionsContaining(classId);

    for (const aUnionContainingThisClass of unionsContainingThisClass) {
      const propertyQuadsHavingUnionAsDomain =
        this.store.getQuads(
          undefined,
          RDFS.DOMAIN,
          aUnionContainingThisClass,
          undefined
        );

      for (const aQuad of propertyQuadsHavingUnionAsDomain) {
        // only select properties with proper Sparnatural configuration
        if (this.getObjectPropertyType(aQuad.subject.id)) {
          this._pushIfNotExist(aQuad.subject.id, properties);
        }
      }
    }

    // read also the properties having as a domain a super-class of this class
    var superClassesOfThisClass = this._readImmediateSuperClasses(classId);

    for (const anImmediateSuperClass of superClassesOfThisClass) {
      var propertiesFromSuperClass = this._readPropertiesWithDomain(
        anImmediateSuperClass
      );
      for (const aProperty of propertiesFromSuperClass) {
        this._pushIfNotExist(aProperty, properties);
      }
    }

    return properties;
  }

  _readClassesInRangeOfProperty(propertyId: any) {
    var classes: any[] = [];

    const propertyQuads = this.store.getQuads(
      factory.namedNode(propertyId),
      RDFS.RANGE,
      undefined,
      undefined
    );

    for (const aQuad of propertyQuads) {
      if (!this._isUnionClass(aQuad.object.id)) {
        this._pushIfNotExist(aQuad.object.id, classes);
      } else {
        // read union content
        var classesInUnion = this._readUnionContent(aQuad.object.id);
        for (const aUnionClass of classesInUnion) {
          this._pushIfNotExist(aUnionClass, classes);
        }
      }
    }

    return classes;
  }

  _readImmediateSuperClasses(classId: any) {
    var classes: any[] = [];

    const subClassQuads = this.store.getQuads(
      factory.namedNode(classId),
      RDFS.SUBCLASS_OF,
      undefined,
      undefined
    );

    for (const aQuad of subClassQuads) {
      this._pushIfNotExist(aQuad.object.id, classes);
    }

    return classes;
  }

  _readImmediateSubClasses(classId: any) {
    var classes: any[] = [];

    const subClassQuads = this.store.getQuads(
      undefined,
      RDFS.SUBCLASS_OF,
      factory.namedNode(classId),
      undefined
    );

    for (const aQuad of subClassQuads) {
      this._pushIfNotExist(aQuad.subject.id, classes);
    }

    return classes;
  }

  /**
   * Reads rdf:type(s) of an entity, and return them as an array
   **/
  _readRdfTypes(uri: any) {
    return this._readAsResource(uri, RDF.TYPE);
  }

  /**
   * Reads config:order of an entity and returns it, or null if not set
   **/
  _readOrder(uri: any) {
    return this._readAsSingleLiteral(uri, Config.ORDER);
  }

  /**
   * Reads the given property on an entity, and return values as an array
   **/
  _readAsResource(uri: any, property: any) {
    return this.store
      .getQuads(factory.namedNode(uri), property, undefined, undefined)
      .map((quad: { object: { id: any } }) => quad.object.id);
  }

  /**
   * Reads the given property on an entity, and returns the first value found, or null if not found
   **/
  _readAsSingleResource(uri: any, property: any) {
    var values = this._readAsResource(uri, property);

    if (values.length > 0) {
      return values[0];
    }

    return null;
  }

  _readAsLiteral(uri: any, property: any) {
    return this.store
      .getQuads(factory.namedNode(uri), property, undefined, undefined)
      .map((quad: { object: { value: any } }) => quad.object.value);
  }

  _readAsSingleLiteral(uri: any, property: any) {
    var values = this._readAsLiteral(uri, property);
    if (values.length == 0) {
      return undefined;
    } else {
      return values[0];
    }
  }

  _readAsLiteralWithLang(
    uri: any,
    property: any,
    lang: any,
    defaultToNoLang = true
  ) {
    var values = this.store
      .getQuads(factory.namedNode(uri), property, undefined, undefined)
      .filter((quad: any) => quad.object.language == lang)
      .map((quad: { object: { value: any } }) => quad.object.value);

    if (values.length == 0 && defaultToNoLang) {
      values = this.store
        .getQuads(factory.namedNode(uri), property, undefined, undefined)
        .filter((quad: any) => quad.object.language == "")
        .map((quad: { object: { value: any } }) => quad.object.value);
    }

    return values.join(", ");
  }

  _readAsRdfNode(rdfNode: any, property: any) {
    return this.store
      .getQuads(rdfNode, property, undefined, undefined)
      .map((quad: { object: any }) => quad.object);
  }

  _hasProperty(rdfNode: any, property: any) {
    return (
      this.store.getQuads(
        rdfNode,
        property,
        undefined,
        undefined
      ).length > 0
    );
  }

  /*** Handling of UNION classes ***/

  _isUnionClass(classUri: any) {
    return this._hasProperty(factory.namedNode(classUri), OWL.UNION_OF);
  }

  _isInUnion(classUri: any) {
    return (
      this.store.getQuads(
        undefined,
        RDF.FIRST,
        classUri,
        undefined
      ).length > 0
    );
  }

  _readUnionContent(classUri: any) {
    var lists = this._readAsRdfNode(factory.namedNode(classUri), OWL.UNION_OF);
    if (lists.length > 0) {
      return this._readList_rec(lists[0]);
    }
  }

  _readList_rec(list: any) {
    var result = this.store
      .getQuads(list, RDF.FIRST, undefined, undefined)
      .map((quad: { object: { id: any } }) => quad.object.id);

    var subLists = this._readAsRdfNode(list, RDF.REST);
    if (subLists.length > 0) {
      result = result.concat(this._readList_rec(subLists[0]));
    }

    return result;
  }

  _readRootList(listId: any): any {
    var root = this._readSuperList(listId);
    if (root == null) {
      return listId;
    } else {
      return this._readRootList(root);
    }
  }

  _readSuperList(listId: any) {
    const propertyQuads = this.store.getQuads(
      undefined,
      RDF.REST,
      listId,
      undefined
    );

    if (propertyQuads.length > 0) {
      return propertyQuads[0].subject.id;
    } else {
      return null;
    }
  }

  _readUnionsContaining(classId: any) {
    var unions = [];

    var listsContainingThisClass = this.store
      .getQuads(undefined, RDF.FIRST, factory.namedNode(classId), undefined)
      .map((quad: { subject: any }) => quad.subject);

    for (const aListContainingThisClass of listsContainingThisClass) {
      var rootList = this._readRootList(aListContainingThisClass);

      // now read the union pointing to this list
      var unionPointingToThisList = this.store
        .getQuads(undefined, OWL.UNION_OF, rootList, undefined)
        .map((quad: { subject: any }) => quad.subject);

      if (unionPointingToThisList.length > 0) {
        unions.push(unionPointingToThisList[0]);
      }
    }

    return unions;
  }

  /*** / Handling of UNION classes ***/

  _pushIfNotExist(item: any, items: any[]) {
    if (items.indexOf(item) < 0) {
      items.push(item);
    }

    return items;
  }
}
