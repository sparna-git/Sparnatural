import { BlankNode, DataFactory } from 'rdf-data-factory';
import { ISparnaturalSpecification } from "../ISparnaturalSpecification";
import {
  Parser,
  Generator,
  SparqlParser,
  SparqlGenerator
} from "sparqljs";
import { BaseRDFReader, RDF } from "../BaseRDFReader";
import { ISpecificationEntity } from "../ISpecificationEntity";
import ISpecificationProperty from "../ISpecificationProperty";
import { SHACLSpecificationEntry } from "./SHACLSpecificationEntry";
import { SHACLSpecificationEntity, SpecialSHACLSpecificationEntityRegistry } from "./SHACLSpecificationEntity";
import { SHACLSpecificationProperty } from "./SHACLSpecificationProperty";
import { RdfStore } from "rdf-stores";
import { NamedNode, Quad, Quad_Object, Quad_Subject } from '@rdfjs/types/data-model';
import { Term } from "@rdfjs/types";
import { StoreModel } from '../../../rdf/StoreModel';
import { DagIfc, Dag, DagNodeIfc } from '../../dag/Dag';
import { StatisticsReader } from '../StatisticsReader';
import { SH } from '../../../rdf/vocabularies/SH';
import { XSD } from '../../../rdf/vocabularies/XSD';


const factory = new DataFactory();

export class SHACLSpecificationProvider extends BaseRDFReader implements ISparnaturalSpecification {

  #parser: SparqlParser;
  #generator: SparqlGenerator;

  constructor(n3store: RdfStore, lang: string) {
    super(n3store, lang);

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

  getAllSparnaturalEntities(): string[] {
    const quadsArray = this.store.getQuads(
      null,
      RDF.TYPE,
      SH.NODE_SHAPE,
      null
    );

    const itemsSet = new Set<SHACLSpecificationEntry>();
    for (const quad of quadsArray) {
      var nodeShapeId = quad.subject.value;
      itemsSet.add(this.getEntity(nodeShapeId) as unknown as SHACLSpecificationEntry);
    }

    let items:SHACLSpecificationEntry[] = SHACLSpecificationEntry.sort(Array.from(itemsSet));

    return items.map(e => e.getId());
  }

  getEntitiesInDomainOfAnyProperty(): string[] {
    // map to extract just the uri
    return this.getInitialEntityList().map(e => e.getId());
  }

  getEntitiesTreeInDomainOfAnyProperty(): DagIfc<ISpecificationEntity> {
    // 1. get the entities that are in a domain of a property
    let entities:SHACLSpecificationEntity[] = this.getInitialEntityList();

    // 2. add the children of these entities - recursively
    // while the children of every entity is not found in our flat list of entity, continue adding children
    while(!entities.every(entity => {
        return entity.getChildren().every(child => {
          // avoid testing deactivated shapes
          return (this.isDeactivated(factory.namedNode(child))) || (entities.find(anotherEntity => anotherEntity.getId() === child) != undefined);
        });
    })) {
        let childrenToAdd:SHACLSpecificationEntity[] = [];
        // for each entity in the initial list...
        entities.forEach(entity => {
            // foreach child of this entity...
            entity.getChildren().forEach(child => {
                // if this child is not in the list, add it
                if(
                  // don't put deactivated shapes in the list
                  ! this.isDeactivated(factory.namedNode(child))
                  &&
                  !entities.find(anotherEntity => anotherEntity.getId() === child)
                ) {
                    childrenToAdd.push(this.getEntity(child) as SHACLSpecificationEntity);
                }
            })
        });
        childrenToAdd.forEach(p => entities.push(p));
    }

    // 3. complement the initial list with their parents
    let disabledList:string[] = new Array<string>();
    while(!entities.every(entity => {
      return entity.getParents().every(parent => {
        return (entities.find(anotherEntity => anotherEntity.getId() === parent) != undefined);
      });      
    })) {
      let parentsToAdd:SHACLSpecificationEntity[] = [];
      entities.forEach(entity => {
        entity.getParents().forEach(parent => {
          if(!entities.find(anotherEntity => anotherEntity.getId() === parent)) {
            parentsToAdd.push(this.getEntity(parent) as SHACLSpecificationEntity);
          }
        })
      });
      parentsToAdd.forEach(p => entities.push(p));
      // also keep that as a disabled node
      parentsToAdd.forEach(p => disabledList.push(p.getId()));
    }

    let dag:Dag<SHACLSpecificationEntity> = new Dag<SHACLSpecificationEntity>();
    dag.initFromParentableAndIdAbleEntity(entities, disabledList);

    let statisticsReader:StatisticsReader = new StatisticsReader(new StoreModel(this.store));

    // add count
    dag.traverseBreadthFirst((node:DagNodeIfc<ISpecificationEntity>) => {
      if(node.parents.length == 0) {
        // if this is a root
        // add a count to it
        node.count = statisticsReader.getEntitiesCountForShape(factory.namedNode(node.payload.getId()))
      } else {
        // otherwise make absolutely sure the count is undefined
        node.count = undefined
      }
    })

    // sort tree
    dag.sort(SHACLSpecificationEntity.compare);

    return dag;
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
    if(!this.graph.hasTriple(factory.namedNode(uri), null, null)) {
      console.warn("The requested property "+uri+" is unknown in the configuration. We cannot find any triple with this URI as subject.")
      return undefined;
    }

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
      return !that.isDeactivated(node);
    });

    // remove from the initial list the NodeShapes that are connected to only properties that Sparnatural will not use
    // by checking the lenght of the list of properties we can make sure of that
    dedupNodeShapes = dedupNodeShapes.filter(node => {
      return (this.getEntity(node.value) as SHACLSpecificationEntity).getProperties().length > 0;
    });

    var items: SHACLSpecificationEntity[] = [];
    for (const aNode of dedupNodeShapes) {
      items.push((this.getEntity(aNode.value) as SHACLSpecificationEntity));
    }

    items = (SHACLSpecificationEntry.sort(items) as SHACLSpecificationEntity[]);

    return items;
  }

  /**
   * @param node a NodeShape
   * @returns true if the NodeShape is the subject of sh:deactivated true
   */
  isDeactivated(node:Term):boolean {
    return this.graph.hasTriple(node as Quad_Subject, SH.DEACTIVATED, factory.literal("true", XSD.BOOLEAN));
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

}
