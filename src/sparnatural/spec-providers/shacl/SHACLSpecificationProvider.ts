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

export class SHACLSpecificationProvider extends BaseRDFReader implements ISparnaturalSpecification {

  constructor(n3store: Store<Quad>, lang: string) {
    super(n3store, lang);
  }
  getAllSparnaturalEntities(): string[] {
    throw new Error("Method not implemented.");
  }
  getEntitiesInDomainOfAnyProperty(): string[] {
    throw new Error("Method not implemented.");
  }
  expandSparql(sparql: string, prefixes: { [key: string]: string; }): string {
    throw new Error("Method not implemented.");
  }
  getEntity(entity: string): ISpecificationEntity {
    throw new Error("Method not implemented.");
  }
  getProperty(property: string): ISpecificationProperty {
    throw new Error("Method not implemented.");
  }




}
