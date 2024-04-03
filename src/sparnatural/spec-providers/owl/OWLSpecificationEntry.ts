import { BaseRDFReader, RDFS } from "../BaseRDFReader";
import ISpecificationEntry from "../ISpecificationEntry";
import { OWLSpecificationProvider } from "./OWLSpecificationProvider";
import { Config } from "../../ontologies/SparnaturalConfig";
import { DataFactory } from 'rdf-data-factory';
import { VOLIPI } from "../shacl/SHACLSpecificationProvider";
import { RdfStore } from "rdf-stores";
import { StoreModel } from "../StoreModel";

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
      // first try to read an rdfs:label
      let labels = this.graph.readPropertyInLang(factory.namedNode(this.uri), RDFS.LABEL, this.lang);
        
      if(labels.length > 0) {
          return labels[0].value;
      } else {
          // no rdfs:label present, read the local part of the URI
          return StoreModel.getLocalName(this.uri) as string;
      }
    }

    getTooltip(): string | undefined {
        return this.graph.readSinglePropertyInLang(factory.namedNode(this.uri), factory.namedNode(Config.TOOLTIP), this.lang)?.value;
    }

    getColor(): string | undefined {
      return this.graph.readSingleProperty(factory.namedNode(this.uri), VOLIPI.COLOR)?.value;
    }

    /**
     * Reads config:order of an entity and returns it, or undefined if not set
     **/
    getOrder(): string|undefined {
      return this.graph.readSingleProperty(factory.namedNode(this.uri), factory.namedNode(Config.ORDER))?.value;
    }

    getIcon(): string {
        var faIcon = this.graph.readProperty(
            factory.namedNode(this.uri),
            factory.namedNode(Config.FA_ICON)
        );
        if (faIcon.length > 0) {
          // use of fa-fw for fixed-width icons
          return (
            "<span style='font-size: 170%;' >&nbsp;<i class='" +
            faIcon[0].value +
            " fa-fw'></i></span>"
          );
        } else {
          var icons = this.graph.readProperty(factory.namedNode(this.uri), factory.namedNode(Config.ICON));
          if (icons.length > 0) {
            return icons[0].value;
          } else {
            // this is ugly, just so it aligns with other entries having an icon
            return "<span style='font-size: 175%;' >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>";
          }
        }
    }

    getHighlightedIcon(): string|undefined {
      var icons = this.graph.readProperty(
        factory.namedNode(this.uri),
        factory.namedNode(Config.HIGHLIGHTED_ICON)
      );
      if (icons.length > 0) {
        return icons[0].value;
      } 
    }
}