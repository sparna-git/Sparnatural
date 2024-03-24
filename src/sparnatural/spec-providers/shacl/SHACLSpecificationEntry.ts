import { BaseRDFReader } from "../BaseRDFReader";
import ISpecificationEntry from "../ISpecificationEntry";
import { SH, SHACLSpecificationProvider, VOLIPI } from "./SHACLSpecificationProvider";
import { RdfStore } from "rdf-stores";
import { DataFactory } from 'rdf-data-factory';

const factory = new DataFactory();

export abstract class SHACLSpecificationEntry extends BaseRDFReader implements ISpecificationEntry {
    uri:string;
    provider:SHACLSpecificationProvider;

    constructor(uri:string, provider: SHACLSpecificationProvider, n3store: RdfStore, lang: string) {
        super(n3store, lang);
        this.uri=uri;
        this.provider=provider;
    }

    abstract getLabel():string;

    getId(): string {
        return this.uri;
    }

    getTooltip(): string | undefined {
      let tooltip = this.graph.readSinglePropertyInLang(factory.namedNode(this.uri), VOLIPI.MESSAGE, this.lang)?.value;
      if(!tooltip) {
        // try with sh:description
        tooltip = this.graph.readSinglePropertyInLang(factory.namedNode(this.uri), SH.DESCRIPTION, this.lang)?.value;
      }
      return tooltip;
    }

    getColor(): string | undefined {
      return this.graph.readSingleProperty(factory.namedNode(this.uri), VOLIPI.COLOR)?.value;
    }


    getIcon(): string {
      var faIcon = this.graph.readProperty(
        factory.namedNode(this.uri),
        VOLIPI.ICON_NAME
      );
      
      if (faIcon.length > 0) {
        return SHACLSpecificationEntry.buildIconHtml(faIcon[0].value);
      } else {
        var icons = this.graph.readProperty(factory.namedNode(this.uri), VOLIPI.ICON);
        if (icons.length > 0) {
          return icons[0].value;
        } else {
          // this is ugly, just so it aligns with other entries having an icon
          return "<span style='font-size: 175%;' >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>";
        }
      }
    }

    static buildIconHtml(iconCode:string) {
      // use of fa-fw for fixed-width icons
      return (
        "<span style='font-size: 170%;' >&nbsp;<i class='" +
        iconCode +
        " fa-fw'></i></span>"
      );
    }

    /**
     * @returns always return an empty icon. TODO : implement
     */
    getHighlightedIcon(): string {
      return "";
    }

    getOrder(): string | undefined {
        let order = this.graph.readSingleProperty(factory.namedNode(this.uri), SH.ORDER)?.value;
        return order
    }

    static sort(items: SHACLSpecificationEntry[]) {
        const compareFunction = function (item1: SHACLSpecificationEntry, item2: SHACLSpecificationEntry) {

          /*
          if(item1 instanceof SpecialSHACLSpecificationEntity) {
            if(!(item2 instanceof SpecialSHACLSpecificationEntity)) {
              return -1;
            }
          } else {
            if(item2 instanceof SpecialSHACLSpecificationEntity) {
              return 1;
            }
          }*/

          /*
          console.log(item1.getLabel())
          console.log(Object.getPrototypeOf(item1))
          */

          /*
          if(Object.getPrototypeOf(item1) === SpecialSHACLSpecificationEntity.prototype) {
            if(!(Object.getPrototypeOf(item2) === SpecialSHACLSpecificationEntity.prototype)) {
              return -1;
            }
          }
          */
    
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
    
        // sort according to order or label
        items.sort(compareFunction);
        return items;
      }
    

}