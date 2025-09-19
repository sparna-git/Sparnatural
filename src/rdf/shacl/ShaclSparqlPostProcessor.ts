import { DataFactory } from 'rdf-data-factory';
import {
  Parser,
  Generator,
  SparqlParser,
  SparqlGenerator
} from "sparqljs";
import { Quad } from '@rdfjs/types/data-model';
import { SH } from '../vocabularies/SH';
import { ShaclModel } from './ShaclModel';
import { Model } from '../Model';


const factory = new DataFactory();

export class ShaclSparqlPostProcessor {

  shaclModel: ShaclModel;
  #parser: SparqlParser;
  #generator: SparqlGenerator;

  constructor(shaclModel: ShaclModel) {    
    this.shaclModel = shaclModel;

    // init SPARQL parser and generator once
    this.#parser = new Parser();
    this.#generator = new Generator();
  }


  expandSparql(sparql: string, prefixes: { [key: string]: string; }): string {
    
    // for each sh:targetClass
    this.shaclModel.store
      .getQuads(null, SH.TARGET_CLASS, null, null)
      .forEach((quad: Quad) => {
        // find it with the full URI
        var re = new RegExp("<" + quad.subject.value + ">", "g");
        sparql = sparql.replace(re, "<" + quad.object.value + ">");
      });

    // for each NodeShape that is itself a rdfs:Class ...
    // do nothing :-) their URI is already correct

    // for each sh:path
    this.shaclModel.store
      .getQuads(null, SH.PATH, null, null)
      .forEach((quad: Quad) => {
        try {
          // find it with the full URI
          var re = new RegExp("<" + quad.subject.value + ">", "g");
          let sparqlReplacementString = this.shaclModel.pathToSparql(quad.object);
          sparql = sparql.replace(re, sparqlReplacementString);
        } catch (error) {
          console.error("Unsupported sh:path for "+quad.subject.value+" - review your configuration");
        }
      });

    // for each sh:target/sh:select ...
    this.shaclModel.store
      .getQuads(null, SH.TARGET, null, null)
      .forEach((q1: Quad) => {

        // get the subject URI that will be replaced
        let nodeShapeUri = q1.subject.value;

        this.shaclModel.store
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

}
