import { ISpecificationEntry } from "../ISpecificationEntry";
import { OWLSpecificationProvider } from "./OWLSpecificationProvider";
import { Config } from "../../ontologies/SparnaturalConfig";
import { DataFactory } from 'rdf-data-factory';
import { RdfStore } from "rdf-stores";
import { StoreModel } from "../../../rdf/StoreModel";
import { BaseRdfStore } from "../../../rdf/BaseRdfStore";
import { RDFS } from "../../../rdf/vocabularies/RDFS";
import { VOLIPI } from "../../../rdf/vocabularies/VOLIPI";

const factory = new DataFactory();

export class OWLSpecificationEntry extends BaseRdfStore implements ISpecificationEntry {
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
        VOLIPI.ICON_NAME
      );
      
      if (faIcon.length > 0) {
        return faIcon[0].value;
      } else {
        var icons = this.graph.readProperty(factory.namedNode(this.uri), VOLIPI.ICON);
        if (icons.length > 0) {
          return icons[0].value;
        } else {
          // backward compatibility : read config-core:faIcon from OWL config
          var icons = this.graph.readProperty(factory.namedNode(this.uri), factory.namedNode(Config.FA_ICON));
          if (icons.length > 0) {
            return icons[0].value;
          }
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

    getParents(): string[] {
      return [];
    }
}