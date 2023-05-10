import { BaseRDFReader } from "../BaseRDFReader";
import ISpecificationEntity from "../ISpecificationEntity";
import { Quad, Store } from "n3";
import factory from "@rdfjs/data-model";
import { Config } from "../../ontologies/SparnaturalConfig";
import { SHACLSpecificationProvider } from "./SHACLSpecificationProvider";
import { SHACLSpecificationEntry } from "./SHACLSpecificationEntry";

export class SHACLSpecificationEntity extends SHACLSpecificationEntry implements ISpecificationEntity {

    constructor(uri:string, provider: SHACLSpecificationProvider, n3store: Store<Quad>, lang: string) {
        super(uri, provider, n3store, lang);
    }
    
    getConnectedEntities(): string[] {
        throw new Error("Method not implemented.");
    }
    hasConnectedEntities(): boolean {
        throw new Error("Method not implemented.");
    }
    getConnectingProperties(range: string): string[] {
        throw new Error("Method not implemented.");
    }
    isLiteralEntity(): boolean {
        throw new Error("Method not implemented.");
    }
    isRemoteEntity(): boolean {
        throw new Error("Method not implemented.");
    }
    getDefaultLabelProperty(): string | null {
        throw new Error("Method not implemented.");
    }

}