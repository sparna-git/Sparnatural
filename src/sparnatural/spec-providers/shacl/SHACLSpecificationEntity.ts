import { BaseRDFReader, RDFS } from "../BaseRDFReader";
import ISpecificationEntity from "../ISpecificationEntity";
import { Quad, Store } from "n3";
import factory from "@rdfjs/data-model";
import { Config } from "../../ontologies/SparnaturalConfig";
import { DASH, SH, SHACLSpecificationProvider } from "./SHACLSpecificationProvider";
import { SHACLSpecificationEntry } from "./SHACLSpecificationEntry";
import { SHACLSpecificationProperty } from "./SHACLSpecificationProperty";

export class SHACLSpecificationEntity extends SHACLSpecificationEntry implements ISpecificationEntity {

    constructor(uri:string, provider: SHACLSpecificationProvider, n3store: Store<Quad>, lang: string) {
        super(uri, provider, n3store, lang);
    }

    getLabel(): string {
        // first try to read an rdfs:label
        let label = this._readAsLiteralWithLang(this.uri, RDFS.LABEL, this.lang);
        // no rdfs:label present, read the local part of the URI
        if(!label) {
          label = SHACLSpecificationProvider.getLocalName(this.uri) as string;
        }
  
        return label;
      }
    
    getConnectingProperties(range: string): string[] {
        var items: string[] = [];

        // read all properties
        let propShapes = this._readAsResource(this.uri, SH.PROPERTY);
        propShapes.forEach(ps => {
            let prop = new SHACLSpecificationProperty(ps, this.provider, this.store, this.lang);
            let pRange = prop.getRange();
            if(pRange.indexOf(range) > -1) {
                items.push(ps);
            }
        })

        // dedup, although probably dedup is not necessary here
        var dedupItems = [...new Set(items)];
        // sort dedups
        var sortedDedups = SHACLSpecificationEntry.sort(dedupItems.map(s => new SHACLSpecificationProperty(s, this.provider, this.store, this.lang)));
        // return dedup array of strings
        return sortedDedups.map(e => e.getId());
    }

    getConnectedEntities(): string[] {
        var items: string[] = [];

        // read all properties
        let propShapes = this._readAsResource(this.uri, SH.PROPERTY);

        propShapes.forEach(ps => {
            let prop = new SHACLSpecificationProperty(ps, this.provider, this.store, this.lang);
            // and then read their ranges
            items.push(...prop.getRange());
        })

        // dedup
        var dedupItems = [...new Set(items)];
        // sort dedups
        var sortedDedups = SHACLSpecificationEntry.sort(dedupItems.map(s => new SHACLSpecificationEntity(s, this.provider, this.store, this.lang)));
        // return dedup array of strings
        return sortedDedups.map(e => e.getId());        
    }

    hasConnectedEntities(): boolean {
        return (this.getConnectedEntities().length > 0)
    }    

    /**
     * 
     * @returns true if sh:nodeKind = sh:Literal, or if sh:datatype is present, or if sh:languageIn is present
     */
    isLiteralEntity(): boolean {
        var hasNodeKindLiteral = this._hasTriple(factory.namedNode(this.uri), SH.NODE_KIND, SH.LITERAL);
        var hasDatatype = this._hasTriple(factory.namedNode(this.uri), SH.DATATYPE, null);
        var hasLanguageIn = this._hasTriple(factory.namedNode(this.uri), SH.LANGUAGE_IN, null);
        var hasUniqueLang = this._hasTriple(factory.namedNode(this.uri), SH.UNIQUE_LANG, null);

        return hasNodeKindLiteral || hasDatatype || hasLanguageIn || hasUniqueLang;
    }

    isRemoteEntity(): boolean {
        return false;
        throw new Error("Method not implemented.");
    }

    /**
     * @returns a property labelled with dash:propertyRole = dash:LabelRole
     */
    getDefaultLabelProperty(): string | null {
        var items: any[] = [];

        // read all properties
        let propShapes = this._readAsResource(this.uri, SH.PROPERTY);

        propShapes.forEach(ps => {
            if (this.store.getQuads(
                factory.namedNode(ps),
                DASH.PROPERTY_ROLE,
                DASH.LABEL_ROLE,
                null
            ).length > 0) {
                items.push(ps);
            }
        });

        return items.length>0?items[0]:null;
    }

}


export class SpecialSHACLSpecificationEntity implements ISpecificationEntity {

    private id:string;
    private icon:string;
    private label:string;

    constructor(id:string, icon:string,label:string) {
        this.id = id;
        this.icon = icon;
        this.label = label;
    }

    getConnectedEntities(): string[] {
        return new Array<string>();
    }

    hasConnectedEntities(): boolean {
        return false;
    }

    getConnectingProperties(range: string): string[] {
        return new Array<string>();
    }

    isLiteralEntity(): boolean {
        return true;
    }

    isRemoteEntity(): boolean {
        return false;
    }

    getDefaultLabelProperty(): string | null {
        return null;
    }

    getId(): string {
        return this.id;
    }

    getLabel(): string {
        return this.label;
    }

    getTooltip(): string | null {
        return null;
    }

    getColor(): string | null {
        return "slategray";
    }

    getDatasource(): any {
        return null;
    }

    getTreeChildrenDatasource(): any {
        return null;
    }

    getTreeRootsDatasource(): any {
        return null;
    }

    getIcon(): string {
        return SHACLSpecificationEntry.buildIconHtml(this.icon);
    }

    getHighlightedIcon(): string {
        return "";
    }
}

export class SpecialSHACLSpecificationEntityRegistry {

    private registry:Map<string,SpecialSHACLSpecificationEntity> = new Map<string,SpecialSHACLSpecificationEntity>();

    public static SPECIAL_SHACL_ENTITY_OTHER = "http://special/Other";

    public static SPECIAL_SHACL_ENTITY_DATES = "http://special/Date";

    static instance = new SpecialSHACLSpecificationEntityRegistry();

    /**
     * The Singleton's constructor should always be private to prevent direct
     * construction calls with the `new` operator.
     */
    private constructor() { 
        this.registry.set(
            SpecialSHACLSpecificationEntityRegistry.SPECIAL_SHACL_ENTITY_OTHER,
            new SpecialSHACLSpecificationEntity(SpecialSHACLSpecificationEntityRegistry.SPECIAL_SHACL_ENTITY_OTHER, "fa-solid fa-ellipsis", "Other")
        )
        this.registry.set(
            SpecialSHACLSpecificationEntityRegistry.SPECIAL_SHACL_ENTITY_DATES,
            new SpecialSHACLSpecificationEntity(SpecialSHACLSpecificationEntityRegistry.SPECIAL_SHACL_ENTITY_DATES, "fa-solid fa-calendar", "Date")
        )
    }

    /**
     * The static method that controls the access to the singleton instance.
     *
     * This implementation let you subclass the Singleton class while keeping
     * just one instance of each subclass around.
     */
    public static getInstance(): SpecialSHACLSpecificationEntityRegistry {
        if (!SpecialSHACLSpecificationEntityRegistry.instance) {
            SpecialSHACLSpecificationEntityRegistry.instance = new SpecialSHACLSpecificationEntityRegistry();
        }

        return SpecialSHACLSpecificationEntityRegistry.instance;
    }

    public getRegistry(): Map<string,SpecialSHACLSpecificationEntity> {
        return this.registry;
    }

}

