import { BaseRdfStore } from "../../../rdf/BaseRdfStore";
import { ISpecificationEntry } from "../ISpecificationEntry";
import { SHACLSpecificationProvider } from "./SHACLSpecificationProvider";
import { RdfStore } from "rdf-stores";
import { DataFactory } from 'rdf-data-factory';
import { Shape } from "../../../rdf/shacl/Shape";
import { ShaclStoreModel, ShapeFactory } from "../../../rdf/shacl/ShaclStoreModel";

const factory = new DataFactory();

export abstract class SHACLSpecificationEntry extends BaseRdfStore implements ISpecificationEntry {
    uri:string;
    provider:SHACLSpecificationProvider;
    shape:Shape;

    constructor(uri:string, provider: SHACLSpecificationProvider, n3store: RdfStore, lang: string) {
        super(n3store, lang);
        this.uri=uri;
        this.provider=provider;
        this.shape = ShapeFactory.buildShape(factory.namedNode(uri), new ShaclStoreModel(this.store));
    }

    abstract getLabel():string;

    abstract getTooltip():string|undefined;

    abstract getParents(): string[];

    getId(): string {
        return this.uri;
    }

    getColor(): string | undefined {
      return this.shape.getColor();
    }


    getIcon(): string {
      return this.shape.getIcon();
    }

    /**
     * @returns always return an empty icon. TODO : implement
     */
    getHighlightedIcon(): string {
      return "";
    }

    getOrder(): string | undefined {
        return (this.shape.getOrder()? this.shape.getOrder().value : undefined);
    }

    static sort(items: SHACLSpecificationEntry[]) {  
      // sort according to order or label
      items.sort(SHACLSpecificationEntry.compare);
      return items;
    }

    static compare(item1: SHACLSpecificationEntry, item2: SHACLSpecificationEntry) {
  
      var order1 = item1.getOrder();
      var order2 = item2.getOrder();

      if (order1) {
        if (order2) {
          if (order1 == order2) {
            return item1.getLabel().localeCompare(item2.getLabel());
          } else {
            // if the order is actually a number, convert it to number and use a number conversion
            if(!isNaN(Number(order1)) && !isNaN(Number(order2))) {
              return Number(order1) - Number(order2);
            } else {
              return (order1 > order2) ? 1 : -1;
            }
          }
        } else {
          return -1;
        }
      } else {
        if (order2) {
          return 1;
        } else {
          return item1.getLabel().localeCompare(item2.getLabel());
        }
      }
    };    

}