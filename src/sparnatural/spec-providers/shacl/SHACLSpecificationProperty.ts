import { BaseRDFReader } from "../BaseRDFReader";
import ISpecificationEntity from "../ISpecificationEntity";
import { Quad, Store } from "n3";
import factory from "@rdfjs/data-model";
import { Config } from "../../ontologies/SparnaturalConfig";
import ISpecificationProperty from "../ISpecificationProperty";
import { SHACLSpecificationProvider } from "./SHACLSpecificationProvider";
import { SHACLSpecificationEntry } from "./SHACLSpecificationEntry";

export class SHACLSpecificationProperty extends SHACLSpecificationEntry implements ISpecificationProperty {

  constructor(uri:string, provider: SHACLSpecificationProvider, n3store: Store<Quad>, lang: string) {
    super(uri, provider, n3store, lang);
  }
    getPropertyType(): string | undefined {
        throw new Error("Method not implemented.");
    }
    isMultilingual(): boolean {
        throw new Error("Method not implemented.");
    }
    getRange(): string[] {
        throw new Error("Method not implemented.");
    }
    getBeginDateProperty(): string | null {
        throw new Error("Method not implemented.");
    }
    getEndDateProperty(): string | null {
        throw new Error("Method not implemented.");
    }
    getExactDateProperty(): string | null {
        throw new Error("Method not implemented.");
    }
    isEnablingNegation(): boolean {
        throw new Error("Method not implemented.");
    }
    isEnablingOptional(): boolean {
        throw new Error("Method not implemented.");
    }
    getServiceEndpoint(): string | null {
        throw new Error("Method not implemented.");
    }
    isLogicallyExecutedAfter(): boolean {
        throw new Error("Method not implemented.");
    }
}