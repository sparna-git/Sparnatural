import factory from "@rdfjs/data-model";
import { NamedNode, Quad, Store } from "n3";
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
import ISpecificationProperty from "../ISpecificationProperty";
import { SHACLSpecificationEntry } from "./SHACLSpecificationEntry";
import { SHACLSpecificationEntity } from "./SHACLSpecificationEntity";
import { SHACLSpecificationProperty } from "./SHACLSpecificationProperty";

const SH_NAMESPACE = "http://www.w3.org/ns/shacl#";
export const SH = {
  NAME: factory.namedNode(SH_NAMESPACE + "name") as NamedNode,
  PROPERTY: factory.namedNode(SH_NAMESPACE + "property") as NamedNode,
  ORDER: factory.namedNode(SH_NAMESPACE + "order") as NamedNode,
};


export class SHACLSpecificationProvider extends BaseRDFReader implements ISparnaturalSpecification {

  constructor(n3store: Store<Quad>, lang: string) {
    super(n3store, lang);
  }

  getAllSparnaturalEntities(): string[] {
    throw new Error("Method not implemented.");
  }

  getEntitiesInDomainOfAnyProperty(): string[] {
    // map to extract just the uri
    return this.getNodeShapesWithAnyProperty().map(e => e.getId());
  }

  expandSparql(sparql: string, prefixes: { [key: string]: string; }): string {
    throw new Error("Method not implemented.");
  }

  getLanguages(): string[] {
    let languages = this.store
      .getQuads(null, SH.NAME, null, null)
      .map((quad: { object: any }) => quad.object.language);
    // deduplicate the list of languages
    return [...new Set(languages)];
  }

  getEntity(uri: string): ISpecificationEntity {
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

  getNodeShapesWithAnyProperty():SHACLSpecificationEntry[] {
    const quadsArray = this.store.getQuads(
      null,
      SH.PROPERTY,
      null,
      null
    );

    var items: SHACLSpecificationEntry[] = [];
    for (const quad of quadsArray) {
      var nodeShapeId = quad.subject.id;
      this._pushIfNotExist(this.getEntity(nodeShapeId), items);
    }

    items = SHACLSpecificationEntry.sort(items);

    console.log("NodeShapes with at least one property " + items);
    return items;
  }

}
