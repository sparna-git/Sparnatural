import { DataFactory } from 'rdf-data-factory';
import { Config } from "../../ontologies/SparnaturalConfig";
import ISparnaturalSpecification from "../ISparnaturalSpecification";
import Datasources from "../../ontologies/SparnaturalConfigDatasources";
import {
  Parser,
  Generator,
  SparqlParser,
  SparqlGenerator
} from "sparqljs";
import { BaseRDFReader, RDF } from "../BaseRDFReader";
import ISpecificationEntity from "../ISpecificationEntity";
import ISpecificationProperty from "../ISpecificationProperty";
import { SHACLSpecificationEntry } from "./SHACLSpecificationEntry";
import { SHACLSpecificationEntity, SpecialSHACLSpecificationEntityRegistry } from "./SHACLSpecificationEntity";
import { SHACLSpecificationProperty } from "./SHACLSpecificationProperty";
import { RdfStore } from "rdf-stores";
import { NamedNode, Quad, Quad_Object } from '@rdfjs/types/data-model';

const factory = new DataFactory();

const SH_NAMESPACE = "http://www.w3.org/ns/shacl#";
export const SH = {
  CLASS: factory.namedNode(SH_NAMESPACE + "class") as NamedNode,
  DATATYPE: factory.namedNode(SH_NAMESPACE + "datatype") as NamedNode,
  DEACTIVATED: factory.namedNode(SH_NAMESPACE + "deactivated") as NamedNode,
  DESCRIPTION: factory.namedNode(SH_NAMESPACE + "description") as NamedNode,
  IRI: factory.namedNode(SH_NAMESPACE + "IRI") as NamedNode, 
  LANGUAGE_IN: factory.namedNode(SH_NAMESPACE + "languageIn") as NamedNode, 
  LITERAL: factory.namedNode(SH_NAMESPACE + "Literal") as NamedNode, 
  NAME: factory.namedNode(SH_NAMESPACE + "name") as NamedNode,
  NODE: factory.namedNode(SH_NAMESPACE + "node") as NamedNode,  
  NODE_KIND: factory.namedNode(SH_NAMESPACE + "nodeKind") as NamedNode, 
  NODE_SHAPE: factory.namedNode(SH_NAMESPACE + "NodeShape") as NamedNode,  
  OR: factory.namedNode(SH_NAMESPACE + "or") as NamedNode,
  ORDER: factory.namedNode(SH_NAMESPACE + "order") as NamedNode,
  PATH: factory.namedNode(SH_NAMESPACE + "path") as NamedNode,
  PROPERTY: factory.namedNode(SH_NAMESPACE + "property") as NamedNode,
  SELECT: factory.namedNode(SH_NAMESPACE + "select") as NamedNode,
  TARGET: factory.namedNode(SH_NAMESPACE + "target") as NamedNode,
  TARGET_CLASS: factory.namedNode(SH_NAMESPACE + "targetClass") as NamedNode,
  UNIQUE_LANG: factory.namedNode(SH_NAMESPACE + "uniqueLang") as NamedNode, 
};

const DASH_NAMESPACE = "http://datashapes.org/dash#";
export const DASH = {
  // note : this is not (yet) an official part of the DASH namespace, but was discussed with Holger
  SEARCH_WIDGET: factory.namedNode(DASH_NAMESPACE + "searchWidget") as NamedNode,
  SEARCH_WIDGET_CLASS: factory.namedNode(DASH_NAMESPACE + "SearchWidget") as NamedNode,
  PROPERTY_ROLE: factory.namedNode(DASH_NAMESPACE + "propertyRole") as NamedNode,
  LABEL_ROLE: factory.namedNode(DASH_NAMESPACE + "LabelRole") as NamedNode,
};

const VOLIPI_NAMESPACE = "http://data.sparna.fr/ontologies/volipi#";
export const VOLIPI = {
  COLOR: factory.namedNode(VOLIPI_NAMESPACE + "color") as NamedNode,
  MESSAGE: factory.namedNode(VOLIPI_NAMESPACE + "message") as NamedNode,
  ICON_NAME: factory.namedNode(VOLIPI_NAMESPACE + "iconName") as NamedNode, 
  ICON: factory.namedNode(VOLIPI_NAMESPACE + "icon") as NamedNode, 
};

const XSD_NAMESPACE = "http://www.w3.org/2001/XMLSchema#";
export const XSD = {
  BOOLEAN: factory.namedNode(XSD_NAMESPACE + "boolean") as NamedNode,
  DATE: factory.namedNode(XSD_NAMESPACE + "date") as NamedNode,
  DATE_TIME: factory.namedNode(XSD_NAMESPACE + "dateTime") as NamedNode,
  GYEAR: factory.namedNode(XSD_NAMESPACE + "gYear") as NamedNode,
  STRING: factory.namedNode(XSD_NAMESPACE + "string") as NamedNode
};

const DCT_NAMESPACE = "http://purl.org/dc/terms/";
export const DCT = {
  CONFORMS_TO: factory.namedNode(DCT_NAMESPACE + "conformsTo") as NamedNode,
};

const VOID_NAMESPACE = "http://rdfs.org/ns/void#";
export const VOID = {
  ENTITIES: factory.namedNode(VOID_NAMESPACE + "entities") as NamedNode,
  TRIPLES: factory.namedNode(VOID_NAMESPACE + "triples") as NamedNode,
  DISTINCT_OBJECTS: factory.namedNode(VOID_NAMESPACE + "distinctObjects") as NamedNode,
};

export class SHACLSpecificationProvider extends BaseRDFReader implements ISparnaturalSpecification {

  #parser: SparqlParser;
  #generator: SparqlGenerator;

  constructor(n3store: RdfStore, lang: string) {
    super(n3store, lang);

    // init SPARQL parser and generator once
    this.#parser = new Parser();
    this.#generator = new Generator();
  }

  getAllSparnaturalEntities(): string[] {
    const quadsArray = this.store.getQuads(
      null,
      RDF.TYPE,
      SH.NODE_SHAPE,
      null
    );

    var items: SHACLSpecificationEntry[] = [];
    for (const quad of quadsArray) {
      var nodeShapeId = quad.subject.value;
      this._pushIfNotExist(this.getEntity(nodeShapeId), items);
    }

    items = SHACLSpecificationEntry.sort(items);

    return items.map(e => e.getId());
  }

  getEntitiesInDomainOfAnyProperty(): string[] {
    // map to extract just the uri
    return this.getInitialEntityList().map(e => e.getId());
  }

  expandSparql(sparql: string, prefixes: { [key: string]: string; }): string {
    
    // for each sh:targetClass
    this.store
      .getQuads(null, SH.TARGET_CLASS, null, null)
      .forEach((quad: Quad) => {
        // find it with the full URI
        var re = new RegExp("<" + quad.subject.value + ">", "g");
        sparql = sparql.replace(re, "<" + quad.object.value + ">");
      });

    // for each NodeShape that is itself a rdfs:Class ...
    // do nothing :-) their URI is already correct

    // for each sh:path
    this.store
      .getQuads(null, SH.PATH, null, null)
      .forEach((quad: Quad) => {
        // find it with the full URI
        var re = new RegExp("<" + quad.subject.value + ">", "g");
        let sparqlReplacementString = SHACLSpecificationProvider.pathToSparql(quad.object);
        sparql = sparql.replace(re, sparqlReplacementString);
      });

    // TODO : for each sh:target/sh:select ...
    this.store
      .getQuads(null, SH.TARGET, null, null)
      .forEach((q1: Quad) => {

        // get the subject URI that will be replaced
        let nodeShapeUri = q1.subject.value;

        this.store
        .getQuads(q1.object, SH.SELECT, null, null)
        .forEach((quad: Quad) => {          
          let sparqlTarget = quad.object.value;
          // extract everything between '{' and '}'
          let beginWhere = sparqlTarget.substring(sparqlTarget.indexOf('{')+1);
          let whereClause = beginWhere.substring(0,beginWhere.lastIndexOf('}')).trim();

          // replace the $this with the name of the original variable in the query
          // \S matches any non-whitespace charracter
          var re = new RegExp("(\\S*) (rdf:type|a) <" + nodeShapeUri + ">", "g");      

          let replacer = function(match:string, p1:string, offset:number, fullString:string) {
            // first substitutes any other variable name with a prefix
            // so that we garantee unicity across the complete query
            var reVariables = new RegExp("\\?(\\S*)", "g");
            let whereClauseReplacedVariables = whereClause.replace(reVariables, "?$1_"+p1.substring(1));
            
            // then, replace the match on the original URI with the whereClause of the target
            // replacing "$this" with the original variable name
            var reThis = new RegExp("\\$this", "g");
            let whereClauseReplacedThis = whereClauseReplacedVariables.replace(reThis, p1);
            return whereClauseReplacedThis;
          }

          sparql = sparql.replace(re,replacer);
        })
      });

    // reparse the query, apply prefixes, and reserialize the query
    var query = this.#parser.parse(sparql);
    for (var key in prefixes) {
      query.prefixes[key] = prefixes[key];
    }
    return this.#generator.stringify(query);
  }



  getLanguages(): string[] {
    let languages = this.store
      .getQuads(null, SH.NAME, null, null)
      .map((quad: { object: any }) => quad.object.language);
    // deduplicate the list of languages
    return [...new Set(languages)];
  }

  getEntity(uri: string): ISpecificationEntity {
    if(SpecialSHACLSpecificationEntityRegistry.getInstance().getRegistry().has(uri)) {
      return SpecialSHACLSpecificationEntityRegistry.getInstance().getRegistry().get(uri) as ISpecificationEntity;
    }

    return new SHACLSpecificationEntity(
      uri, 
      this, 
      this.store,
      this.lang
    );
  }

  getProperty(uri: string): ISpecificationProperty {
    return new SHACLSpecificationProperty(
      uri, 
      this, 
      this.store,
      this.lang
    );
  }

  getInitialEntityList():SHACLSpecificationEntity[] {
    const duplicatedNodeShapes = this.store.getQuads(
      null,
      SH.PROPERTY,
      null,
      null
    ).map(triple => triple.subject);

    let dedupNodeShapes = [...new Set(duplicatedNodeShapes)];

    // remove from the initial list the NodeShapes that are marked with sh:deactivated
    let that = this;
    dedupNodeShapes = dedupNodeShapes.filter(node => {
      return !that._hasTriple(node, SH.DEACTIVATED, factory.literal("true", XSD.BOOLEAN))
    });

    var items: SHACLSpecificationEntity[] = [];
    for (const aNode of dedupNodeShapes) {
      items.push((this.getEntity(aNode.value) as SHACLSpecificationEntity));
    }

    items = (SHACLSpecificationEntry.sort(items) as SHACLSpecificationEntity[]);

    console.log("Initial entity list " + items.map(i => i.getId()));
    return items;
  }

  getNodeShapesLocallyReferencedWithShNode():string[] {
    const duplicatedNodeShapes = this.store.getQuads(
      null,
      SH.NODE,
      null,
      null
    ).map(triple => triple.object.value);

    let dedupNodeShapes = [...new Set(duplicatedNodeShapes)];
    return dedupNodeShapes;
  }


  public static pathToSparql(object:Quad_Object) {
    if(object as NamedNode) {
      return "<" + (object as NamedNode).value + ">";
    } else {
      throw new Error("SHACL blank node paths not implemented yet")
    }
  }

  public static getLocalName(uri:string){
    if(uri.includes('#')) return uri.split('#').pop()
    return uri.split('/').pop()
  }

}
