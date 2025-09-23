import { DataFactory } from 'rdf-data-factory';
import { ISparnaturalSpecification } from "../ISparnaturalSpecification";
import { ISpecificationEntity } from "../ISpecificationEntity";
import ISpecificationProperty from "../ISpecificationProperty";
import { SHACLSpecificationEntry } from "./SHACLSpecificationEntry";
import { SHACLSpecificationEntity, SpecialSHACLSpecificationEntityRegistry } from "./SHACLSpecificationEntity";
import { SHACLSpecificationProperty } from "./SHACLSpecificationProperty";
import { RdfStore } from "rdf-stores";
import { Quad_Subject } from '@rdfjs/types/data-model';
import { Term } from "@rdfjs/types";
import { Model, RDF, SH, ShaclModel, ShaclSparqlPostProcessor, StatisticsReader, XSD } from 'rdf-shacl-commons';
import { BaseRdfStore } from '../BaseRdfStore';
import { Dag, DagIfc, DagNodeIfc } from '../../dag/Dag';


const factory = new DataFactory();

export class SHACLSpecificationProvider extends BaseRdfStore implements ISparnaturalSpecification {

  constructor(n3store: RdfStore, lang: string) {
    super(n3store, lang);

    // skolemize blank nodes
    ShaclModel.skolemizeAnonymousPropertyShapes(this.store);
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

    let statisticsReader:StatisticsReader = new StatisticsReader(new Model(this.store));

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
    let postProc:ShaclSparqlPostProcessor = new ShaclSparqlPostProcessor(new ShaclModel(this.store));
    return postProc.expandSparql(sparql, prefixes);
  }

  getLanguages(): string[] {
    let shaclStoreModel:ShaclModel = new ShaclModel(this.store);
    return shaclStoreModel.readAllLanguages();
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

}
