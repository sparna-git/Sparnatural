import { BaseRDFReader, RDF, RDFS } from "../BaseRDFReader";
import ISpecificationEntity from "../ISpecificationEntity";
import { Quad, Store } from "n3";
import factory from "@rdfjs/data-model";
import { Config } from "../../ontologies/SparnaturalConfig";
import ISpecificationProperty from "../ISpecificationProperty";
import { DASH, SH, SHACLSpecificationProvider, XSD } from "./SHACLSpecificationProvider";
import { SHACLSpecificationEntry } from "./SHACLSpecificationEntry";
import { ListWidget, SparnaturalSearchWidget, SparnaturalSearchWidgetsRegistry } from "./SHACLSearchWidgets";
import { SpecialSHACLSpecificationEntityRegistry } from "./SHACLSpecificationEntity";

export class SHACLSpecificationProperty extends SHACLSpecificationEntry implements ISpecificationProperty {

  constructor(uri:string, provider: SHACLSpecificationProvider, n3store: Store<Quad>, lang: string) {
    super(uri, provider, n3store, lang);
  }

    getPropertyType(): string | undefined {
        let result:string[] = new Array<string>();

        // read the dash:editor property
        this.store.getQuads(
            factory.namedNode(this.uri),
            DASH.SEARCH_WIDGET,
            null,
            null
        ).forEach((quad:Quad) => {
            result.push(quad.object.id);
        });

        if(result.length) {
          return result[0];
        } else {
          return this.getDefaultPropertyType();
        }
    }

    getDefaultPropertyType(): string {
      let highest:SparnaturalSearchWidget = new ListWidget();
      let highestScore:number = 0;
      for (let index = 0; index < SparnaturalSearchWidgetsRegistry.getInstance().getSearchWidgets().length; index++) {
        const currentWidget = SparnaturalSearchWidgetsRegistry.getInstance().getSearchWidgets()[index];
        let currentScore = currentWidget.score(this.uri, this.store)
        if(currentScore > highestScore) {
          highestScore = currentScore;
          highest = currentWidget;
        }        
      }

      return highest.getUri();
    }

    omitClassCriteria(): boolean {
      // omits the class criteria iff the property shape is an sh:IRI, but with no sh:class or no sh:node
      var hasNodeKindIri = this._hasTriple(factory.namedNode(this.uri), SH.NODE_KIND, SH.IRI);

      if(hasNodeKindIri) {
        var hasShClass = this._hasTriple(factory.namedNode(this.uri), SH.CLASS, null);
        var hasShNode = this._hasTriple(factory.namedNode(this.uri), SH.NODE, null);
        // TODO : test on sh:or ?
        return !hasShClass && !hasShNode;
      }

      return false;
    }

    /**
     * A property is multilingual if its datatype points to rdf:langString
     */
    isMultilingual(): boolean {
      return this._hasTriple(factory.namedNode(this.uri), SH.DATATYPE, RDF.LANG_STRING)
    }

    /**
     * TODO : support multiple ranges with sh:or combined with sh:class + sh:node
     * @returns 
     */
    getRange(): string[] {
        // read the sh:class
        var classes: any[] = [];

        const shclassQuads = this.store.getQuads(
          factory.namedNode(this.uri),
          SH.CLASS,
          null,
          null
        );

        // then for each of them, find all NodeShapes targeting this class
        shclassQuads.forEach((quad:Quad) => {
            this.store.getQuads(
                null,
                SH.TARGET_CLASS,
                quad.object,
                null
            ).forEach((quad:Quad) => {
                classes.push(quad.subject.id);
            });

            // also look for nodeshapes that have directly this URI and that are themselves classes
            this.store.getQuads(
                quad.object,
                RDF.TYPE,
                RDFS.CLASS,
                null
            ).forEach((quad:Quad) => {
                classes.push(quad.subject.id);
            });
        });

        // read the sh:node
        const shnodeQuads = this.store.getQuads(
            factory.namedNode(this.uri),
            SH.NODE,
            null,
            null
        ).forEach((quad:Quad) => {
            classes.push(quad.object.id);
        });

        // no sh:class, no sh:node, consider the range to be a special class
        // based on the datatype analysis
        if(classes.length == 0) {
          if(
            this._hasTriple(factory.namedNode(this.uri), SH.DATATYPE, XSD.DATE) 
            ||
            this._hasTriple(factory.namedNode(this.uri), SH.DATATYPE, XSD.DATE_TIME) 
            ||
            this._hasTriple(factory.namedNode(this.uri), SH.DATATYPE, XSD.GYEAR)
          ) {
            classes.push(SpecialSHACLSpecificationEntityRegistry.SPECIAL_SHACL_ENTITY_DATES);
          } else {
            classes.push(SpecialSHACLSpecificationEntityRegistry.SPECIAL_SHACL_ENTITY_OTHER);
          }
        }

        // return a dedup array
        return [...new Set(classes)];
    }

    getBeginDateProperty(): string | null {
        return this._readAsSingleResource(this.uri, Config.BEGIN_DATE_PROPERTY);
      }
    
      getEndDateProperty(): string | null {
        return this._readAsSingleResource(this.uri, Config.END_DATE_PROPERTY);
      }
    
      getExactDateProperty(): string | null {
        return this._readAsSingleResource(this.uri, Config.EXACT_DATE_PROPERTY);
      }
    
      isEnablingNegation(): boolean {
        return (
          this._readAsSingleLiteral(this.uri, Config.ENABLE_NEGATION) == "true"
        );
      }
    
      isEnablingOptional(): boolean {
        return (
          this._readAsSingleLiteral(this.uri, Config.ENABLE_OPTIONAL) == "true"
        );
      }
    
      getServiceEndpoint(): string | null {
        const service = this._readAsSingleResource(this.uri,Config.SPARQL_SERVICE);
        if(service) {
          const endpoint = this._readAsSingleResource(service,Config.ENDPOINT);
          if (endpoint) {
            return endpoint;
          } 
        }    
        return null;
      }
    
      isLogicallyExecutedAfter(): boolean {
        var executedAfter = this._readAsSingleLiteral(this.uri, Config.SPARNATURAL_CONFIG_CORE+"executedAfter");
        return executedAfter;
      }
}