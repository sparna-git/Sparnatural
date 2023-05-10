import { BaseRDFReader } from "../BaseRDFReader";
import ISpecificationEntry from "../ISpecificationEntry";
import { Quad, Store } from "n3";
import factory from "@rdfjs/data-model";
import { SH, SHACLSpecificationProvider } from "./SHACLSpecificationProvider";

export class SHACLSpecificationEntry extends BaseRDFReader implements ISpecificationEntry {
    uri:string;
    provider:SHACLSpecificationProvider;


    constructor(uri:string, provider: SHACLSpecificationProvider, n3store: Store<Quad>, lang: string) {
        super(n3store, lang);
        this.uri=uri;
        this.provider=provider;
    }

    getId(): string {
        return this.uri;
    }

    getLabel(): string {
        // first try to read an sh:name
        // and if not present read an rdfs:label
        return "xxx";
    }

    getTooltip(): string | null {
        throw new Error("Method not implemented.");
    }

    getDatasource() {
        throw new Error("Method not implemented.");
    }

    getTreeChildrenDatasource() {
        throw new Error("Method not implemented.");
    }

    getTreeRootsDatasource() {
        throw new Error("Method not implemented.");
    }

    getIcon(): string {
        throw new Error("Method not implemented.");
    }

    getHighlightedIcon(): string {
        throw new Error("Method not implemented.");
    }

    getShOrder() {
        return this._readAsSingleLiteral(this.uri, SH.ORDER);
    }


    static sort(items: SHACLSpecificationEntry[]) {
        const compareFunction = function (item1: SHACLSpecificationEntry, item2: SHACLSpecificationEntry) {
          // return me.getLabel(item1).localeCompare(me.getLabel(item2));
    
          var order1 = item1.getShOrder();
          var order2 = item2.getShOrder();
    
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
    
        // sort according to order or label
        items.sort(compareFunction);
        return items;
      }
    

}