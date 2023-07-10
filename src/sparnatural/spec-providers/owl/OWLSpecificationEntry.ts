import { BaseRDFReader, RDFS } from "../BaseRDFReader";
import ISpecificationEntry from "../ISpecificationEntry";
import { OWLSpecificationProvider } from "./OWLSpecificationProvider";
import { Config } from "../../ontologies/SparnaturalConfig";
import { DataFactory } from 'rdf-data-factory';
import { VOLIPI } from "../shacl/SHACLSpecificationProvider";
import { RdfStore } from "rdf-stores";

const factory = new DataFactory();

export class OWLSpecificationEntry extends BaseRDFReader implements ISpecificationEntry {
    uri:string;
    provider:OWLSpecificationProvider;


    constructor(uri:string, provider: OWLSpecificationProvider, n3store: RdfStore, lang: string) {
        super(n3store, lang);
        this.uri=uri;
        this.provider=provider;
    }

    getId(): string {
        return this.uri;
    }

    getLabel(): string {
        return this.#_readLabel(this.uri, this.lang);
    }

    getTooltip(): string {
        return this._readAsLiteralWithLang(this.uri, factory.namedNode(Config.TOOLTIP), this.lang);
    }

    getColor(): string | null {
      return this._readAsSingleLiteral(this.uri, VOLIPI.COLOR);
    }

    /**
     * Reads config:order of an entity and returns it, or null if not set
     **/
    getOrder() {
      return this._readAsSingleLiteral(this.uri, Config.ORDER);
    }

    getIcon(): string {
        var faIcon = this._readAsLiteral(
            this.uri,
            factory.namedNode(Config.FA_ICON)
          );
          if (faIcon.length > 0) {
            // use of fa-fw for fixed-width icons
            return (
              "<span style='font-size: 170%;' >&nbsp;<i class='" +
              faIcon +
              " fa-fw'></i></span>"
            );
          } else {
            var icons = this._readAsLiteral(this.uri, factory.namedNode(Config.ICON));
            if (icons.length > 0) {
              return icons[0];
            } else {
              // this is ugly, just so it aligns with other entries having an icon
              return "<span style='font-size: 175%;' >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>";
            }
          }
    }

    getHighlightedIcon() {
      var icons = this._readAsLiteral(
        this.uri,
        factory.namedNode(Config.HIGHLIGHTED_ICON)
      );
      if (icons.length > 0) {
        return icons[0];
      } 
    }

    /**
     * Reads rdfs:label of an entity and returns it, or null if not set
     **/
    #_readLabel(uri: any, lang:string) {
        return this._readAsLiteralWithLang(uri, RDFS.LABEL, lang);
    }
}