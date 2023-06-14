import { BaseRDFReader, RDFS } from "../BaseRDFReader";
import ISpecificationEntry from "../ISpecificationEntry";
import { Quad, Store } from "n3";
import factory from "@rdfjs/data-model";
import { SH, SHACLSpecificationProvider, VOLIPI } from "./SHACLSpecificationProvider";
import Datasources from "../../ontologies/SparnaturalConfigDatasources";

export abstract class SHACLSpecificationEntry extends BaseRDFReader implements ISpecificationEntry {
    uri:string;
    provider:SHACLSpecificationProvider;

    constructor(uri:string, provider: SHACLSpecificationProvider, n3store: Store<Quad>, lang: string) {
        super(n3store, lang);
        this.uri=uri;
        this.provider=provider;
    }

    abstract getLabel():string;

    getId(): string {
        return this.uri;
    }

    getTooltip(): string | null {
      let tooltip = this._readAsLiteralWithLang(this.uri, VOLIPI.MESSAGE, this.lang);
      if(!tooltip) {
        // try with sh:description
        tooltip = this._readAsLiteralWithLang(this.uri, SH.DESCRIPTION, this.lang);
      }
      return tooltip;
    }

    getColor(): string | null {
      return this._readAsSingleLiteral(this.uri, VOLIPI.COLOR);
    }


    getIcon(): string {
      var faIcon = this._readAsLiteral(
        this.uri,
        VOLIPI.ICON_NAME
      );
      
      if (faIcon.length > 0) {
        return SHACLSpecificationEntry.buildIconHtml(faIcon[0]);
      } else {
        var icons = this._readAsLiteral(this.uri, VOLIPI.ICON);
        if (icons.length > 0) {
          return icons[0];
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

    getOrder() {
        let order = this._readAsSingleLiteral(this.uri, SH.ORDER);
        return order
    }

    static sort(items: SHACLSpecificationEntry[]) {
        const compareFunction = function (item1: SHACLSpecificationEntry, item2: SHACLSpecificationEntry) {
          // return me.getLabel(item1).localeCompare(me.getLabel(item2));
    
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