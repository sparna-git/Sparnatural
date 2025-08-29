import { DataFactory } from 'rdf-data-factory';
import {
  Parser,
  Generator,
  SparqlParser,
  SparqlGenerator
} from "sparqljs";
import { RdfStore } from "rdf-stores";
import { Quad, Quad_Subject } from '@rdfjs/types/data-model';
import { Term } from "@rdfjs/types";
import { StoreModel } from '../../../rdf/StoreModel';
import { SH } from '../../../rdf/vocabularies/SH';
import { XSD } from '../../../rdf/vocabularies/XSD';
import { RDF } from '../../../rdf/vocabularies/RDF';


const factory = new DataFactory();

export class ShaclGraph {

  graph: StoreModel;
  store: RdfStore;

  #parser: SparqlParser;
  #generator: SparqlGenerator;

  constructor(n3store: RdfStore) {
    this.store = n3store;
    this.graph = new StoreModel(n3store);
    
    // init SPARQL parser and generator once
    this.#parser = new Parser();
    this.#generator = new Generator();
    this.#skolemizeAnonymousPropertyShapes();
  }

  #skolemizeAnonymousPropertyShapes() {
    // any subject of an sh:path...
    const quadsArray = this.store.getQuads(
      null,
      SH.PROPERTY,
      null,
      null
    );

    let i=0;
    for (const quad of quadsArray) {
      var propertyShapeNode = quad.object;
      if(propertyShapeNode.termType == "BlankNode") {
        // 1. get the base URI pointing to this property shape
        var nodeShape = quad.subject;
        if(nodeShape.termType == "NamedNode") {
          let uri = quad.subject.value;
          
          // 2. build a property shape URI from it
          let propertyShapeUri = uri+"_"+i;
          // 3. replace all triples where the blank node is subject
          this.store.getQuads(
            propertyShapeNode,
            null,
            null,
            null
          ).forEach(
            q => {
              this.store.removeQuad(q);
              this.store.addQuad(factory.quad(factory.namedNode(propertyShapeUri), q.predicate, q.object, q.graph));
            }
          );
          // 4. replace all triples where the blank node is object
          this.store.getQuads(
            null,
            null,
            propertyShapeNode,
            null
          ).forEach(
            q => {
              this.store.removeQuad(q);
              this.store.addQuad(factory.quad(q.subject, q.predicate, factory.namedNode(propertyShapeUri), q.graph));
            }
          );
        }
      }
      i++;
    }
  }

  /**
   * 
   * @returns All the subjects of type sh:NodeShape
   */
  getAllNodeShapes(): string[] {
    const quadsArray = this.store.getQuads(
      null,
      RDF.TYPE,
      SH.NODE_SHAPE,
      null
    );

    const itemsSet = new Set<string>();
    for (const quad of quadsArray) {
      var nodeShapeId = quad.subject.value;
      itemsSet.add(nodeShapeId);
    }

    return Array.from(itemsSet);
  }

  /**
   * 
   * @returns All the languages used in sh:name properties
   */
  getLanguages(): string[] {
    let languages = this.store
      .getQuads(null, SH.NAME, null, null)
      .map((quad: { object: any }) => quad.object.language);
    // deduplicate the list of languages
    return [...new Set(languages)];
  }

  /**
   * @param node a NodeShape
   * @returns true if the NodeShape is the subject of sh:deactivated true
   */
  isDeactivated(node:Term):boolean {
    return this.graph.hasTriple(node as Quad_Subject, SH.DEACTIVATED, factory.literal("true", XSD.BOOLEAN));
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
        try {
          // find it with the full URI
          var re = new RegExp("<" + quad.subject.value + ">", "g");
          let sparqlReplacementString = new StoreModel(this.store).pathToSparql(quad.object);
          sparql = sparql.replace(re, sparqlReplacementString);
        } catch (error) {
          console.error("Unsupported sh:path for "+quad.subject.value+" - review your configuration");
        }
      });

    // for each sh:target/sh:select ...
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
          // note how we match optionnally the final dot of the triple, and an optional space after the type (not always here)
          // flag "g" is for global search
          var re = new RegExp("(\\S*) (rdf:type|a|<http://www\\.w3\\.org/1999/02/22-rdf-syntax-ns#type>) <" + nodeShapeUri + ">( ?\\.)?", "g");      

          let replacer = function(
            match:string,
            // name of the variable being matched, e.g. ?Person_1
            p1:string,
            offset:number,
            fullString:string) {
            // first substitutes any other variable name with a prefix
            // so that we garantee unicity across the complete query
            var reVariables = new RegExp("\\?(\\S*)", "g");
            let whereClauseReplacedVariables = whereClause.replace(reVariables, "?$1_"+p1.substring(1));
            
            // then, replace the match on the original URI with the whereClause of the target
            // replacing "$this" with the original variable name
            var reThis = new RegExp("\\$this", "g");
            let whereClauseReplacedThis = whereClauseReplacedVariables.replace(reThis, p1);

            // then we make sure the where clause properly ends with a dot
            if(!whereClauseReplacedThis.trim().endsWith(".")) {
              whereClauseReplacedThis += ".";
            }
            return whereClauseReplacedThis;
          }

          sparql = sparql.replace(re,replacer);

          // add the prefixes from the target query to our query
          var parsedTargetQuery = this.#parser.parse(sparqlTarget);
          for (var key in parsedTargetQuery.prefixes) {
            let prefixUri = parsedTargetQuery.prefixes[key];
            // prepend the SPARQL prefix declaration to our SPARQL query if it does not already contain it
            if(!sparql.includes("PREFIX "+key+": <"+prefixUri+">")) {
              sparql = "PREFIX "+key+": <"+prefixUri+">\n" + sparql;
            }
          }

        })
      });

    // reparse the query, apply prefixes, and reserialize the query
    // console.log(sparql)
    // console.log(this.#parser.parse("SELECT ?this WHERE { ?this a <http://www.sparna.fr/foo> . FILTER(?this = \"foo\" || ?this = \"bar\" || ?this = \"baz\") }"));
    var query = this.#parser.parse(sparql);
    for (var key in prefixes) {
      query.prefixes[key] = prefixes[key];
    }
    return this.#generator.stringify(query);
  }

  /**
   * @returns the NodeShape targeting the provided class, either implicitly or explicitly through sh:targetClass 
   * @param c 
   */
  getNodeShapeTargetingClass(c:Quad_Subject):Term|null {
    if(this.graph.hasTriple(c, RDF.TYPE, SH.NODE_SHAPE)) {
      // class if also a NodeShape, return it directly
      return c;
    } else {
      let shapes:Term[] = this.graph.findSubjectsWithPredicate(SH.TARGET_CLASS,c);
      if(shapes.length > 0) {
        if(shapes.length > 1) {
          console.warn("Warning, found more than one NodeShape targeting class "+c.value);
        }
        return shapes[0];
      }
      return null;
    }
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

}
