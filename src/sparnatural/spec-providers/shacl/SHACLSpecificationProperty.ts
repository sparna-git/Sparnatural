import { RDF, RDFS } from "../BaseRDFReader";
import { DataFactory } from 'rdf-data-factory';
import { Config } from "../../ontologies/SparnaturalConfig";
import ISpecificationProperty from "../ISpecificationProperty";
import { DASH, SH, SHACLSpecificationProvider, XSD } from "./SHACLSpecificationProvider";
import { SHACLSpecificationEntry } from "./SHACLSpecificationEntry";
import { ListWidget, SparnaturalSearchWidget, SparnaturalSearchWidgetsRegistry } from "./SHACLSearchWidgets";
import { SpecialSHACLSpecificationEntityRegistry, SpecialSHACLSpecificationEntity, SHACLSpecificationEntity } from "./SHACLSpecificationEntity";
import Datasources from "../../ontologies/SparnaturalConfigDatasources";
import ISHACLSpecificationEntity from "./ISHACLSpecificationEntity";
import { RdfStore } from "rdf-stores";
import { Quad } from "@rdfjs/types/data-model";

const factory = new DataFactory();

export class SHACLSpecificationProperty extends SHACLSpecificationEntry implements ISpecificationProperty {

  constructor(uri:string, provider: SHACLSpecificationProvider, n3store: RdfStore, lang: string) {
    super(uri, provider, n3store, lang);
  }

    getLabel(): string {
      // first try to read an sh:name
      let label = this._readAsLiteralWithLang(factory.namedNode(this.uri), SH.NAME, this.lang);
      // no sh:name present, display the sh:path without prefixes
      if(!label) {
        label = SHACLSpecificationProvider.pathToSparql(this.store.getQuads(factory.namedNode(this.uri),SH.PATH, null, null)[0].object, this.store, true);
      }      
      // or try to read the local part of the URI, but should not happen
      if(!label) {
        label = SHACLSpecificationProvider.getLocalName(this.uri) as string;
      }

      return label;
    }

    getPropertyType(range:string): string | undefined {
        // select the shape on which this is applied
        // either the property shape, or one of the shape in an inner sh:or

        let rangeEntity:ISHACLSpecificationEntity;
        if(SpecialSHACLSpecificationEntityRegistry.getInstance().getRegistry().has(range)) {
          rangeEntity = SpecialSHACLSpecificationEntityRegistry.getInstance().getRegistry().get(range) as ISHACLSpecificationEntity;
        } else {
          rangeEntity = new SHACLSpecificationEntity(range,this.provider,this.store,this.lang);
        }

        var shapeUri:string|null = null;
        var orMembers = this._readAsList(factory.namedNode(this.uri), SH.OR);
        orMembers?.forEach(m => {
          if(rangeEntity.isRangeOf(this.store, m.id)) {
            shapeUri = m.id;
          }
          // recurse one level more
          var orOrMembers = this._readAsList(m, SH.OR);
          orOrMembers?.forEach(orOrMember => {
            if(rangeEntity.isRangeOf(this.store, orOrMember.id)) {
              shapeUri = orOrMember.id;
            }
          });
        });

        // defaults to this property shape
        if(!shapeUri) {
          shapeUri = this.uri;
        }

        let result:string[] = new Array<string>();

        // read the dash:searchWidget annotation
        this.store.getQuads(
            factory.namedNode(shapeUri),
            DASH.SEARCH_WIDGET,
            null,
            null
        ).forEach((quad:Quad) => {
            result.push(quad.object.value);
        });

        if(result.length) {
          return result[0];
        } else {
          return this.getDefaultPropertyType(shapeUri);
        }
    }

    getDefaultPropertyType(shapeUri:string): string {
      let highest:SparnaturalSearchWidget = new ListWidget();
      let highestScore:number = 0;
      for (let index = 0; index < SparnaturalSearchWidgetsRegistry.getInstance().getSearchWidgets().length; index++) {
        const currentWidget = SparnaturalSearchWidgetsRegistry.getInstance().getSearchWidgets()[index];
        let currentScore = currentWidget.score(shapeUri, this.store)
        if(currentScore > highestScore) {
          highestScore = currentScore;
          highest = currentWidget;
        }        
      }
      console.log("default property type")
      console.log(highest)
      return highest.getUri();
    }

    omitClassCriteria(): boolean {
      // omits the class criteria iff the property shape is an sh:IRI, but with no sh:class or no sh:node
      var hasNodeKindIri = this._hasTriple(factory.namedNode(this.uri), SH.NODE_KIND, SH.IRI);

      if(hasNodeKindIri) {
        return (this.#getShClassAndShNodeRange().length == 0);
      }

      return false;
    }

    /**
     * A property is multilingual if its datatype points to rdf:langString
     */
    isMultilingual(): boolean {
      return this._hasTriple(factory.namedNode(this.uri), SH.DATATYPE, RDF.LANG_STRING)
    }

    isDeactivated(): boolean {
      return this._hasTriple(factory.namedNode(this.uri), SH.DEACTIVATED, factory.literal("true", XSD.BOOLEAN));
    }

    /**
     * @returns 
     */
    getRange(): string[] {
      // first read on property shape itself
      var classes: string[] = SHACLSpecificationProperty.readShClassAndShNodeOn(this.store, this.uri);

      // nothing, see if some default can apply on the property shape itself
      if(classes.length == 0) { 
        SpecialSHACLSpecificationEntityRegistry.getInstance().getRegistry().forEach((value: SpecialSHACLSpecificationEntity, key: string) => {
          if(key != SpecialSHACLSpecificationEntityRegistry.SPECIAL_SHACL_ENTITY_OTHER) {
            if(value.isRangeOf(this.store, this.uri)) {
              classes.push(key);
            }
          }
        });
      }

      // still nothing, look on the sh:or members
      if(classes.length == 0) {
        var orMembers = this._readAsList(factory.namedNode(this.uri), SH.OR);
        
        orMembers?.forEach(m => {
          // read sh:class / sh:node
          var orClasses: string[] = SHACLSpecificationProperty.readShClassAndShNodeOn(this.store, m.id);

          // nothing, see if default applies on this sh:or member
          if(orClasses.length == 0) {
            SpecialSHACLSpecificationEntityRegistry.getInstance().getRegistry().forEach((value: SpecialSHACLSpecificationEntity, key: string) => {
              if(key != SpecialSHACLSpecificationEntityRegistry.SPECIAL_SHACL_ENTITY_OTHER) {
                if(value.isRangeOf(this.store, m.id)) {
                  orClasses.push(key);
                }
              }
            });
          }

          // still nothing, recurse one level more
          if(orClasses.length == 0) {
            var orOrMembers = this._readAsList(m, SH.OR);
            orOrMembers?.forEach(orOrMember => {
              // read sh:class / sh:node
              var orOrClasses: string[] = SHACLSpecificationProperty.readShClassAndShNodeOn(this.store, orOrMember.id);
              // nothing, see if default applies on this sh:or member
              if(orOrClasses.length == 0) {
                SpecialSHACLSpecificationEntityRegistry.getInstance().getRegistry().forEach((value: SpecialSHACLSpecificationEntity, key: string) => {
                  if(key != SpecialSHACLSpecificationEntityRegistry.SPECIAL_SHACL_ENTITY_OTHER) {
                    if(value.isRangeOf(this.store, orOrMember.id)) {
                      orClasses.push(key);
                    }
                  }
                });
              }
            });
          }

          // still nothing, add default, only if not added previously
          if(orClasses.length == 0) {
            if(orClasses.indexOf(SpecialSHACLSpecificationEntityRegistry.SPECIAL_SHACL_ENTITY_OTHER) == -1) {
              orClasses.push(SpecialSHACLSpecificationEntityRegistry.SPECIAL_SHACL_ENTITY_OTHER);
            }
          }

          // add sh:or range to final list of ranges
          classes.push(...orClasses);
        });
      }

      // still nothing, add the default
      if(classes.length == 0) {
        classes.push(SpecialSHACLSpecificationEntityRegistry.SPECIAL_SHACL_ENTITY_OTHER);
      }

      // return a dedup array
      return [...new Set(classes)];
    }

    #getShClassAndShNodeRange():string[] {
      // read the sh:class
      var classes: string[] = SHACLSpecificationProperty.readShClassAndShNodeOn(this.store, this.uri);

      // read sh:or content
      var orMembers = this._readAsList(factory.namedNode(this.uri), SH.OR);
      orMembers?.forEach(m => {
        classes.push(...SHACLSpecificationProperty.readShClassAndShNodeOn(this.store, m.id));
      });

      return classes;
  }

    static readShClassAndShNodeOn(n3store:RdfStore, theUri:any):string[] {         
      var classes: string[] = [];

      // read the sh:class
      const shclassQuads = n3store.getQuads(
        factory.namedNode(theUri),
        SH.CLASS,
        null,
        null
      );

      // then for each of them, find all NodeShapes targeting this class
      shclassQuads.forEach((quad:Quad) => {
          n3store.getQuads(
              null,
              SH.TARGET_CLASS,
              quad.object,
              null
          ).forEach((q:Quad) => {
              classes.push(q.subject.value);
          });

          // also look for nodeshapes that have directly this URI and that are themselves classes
          // and nodeshapes
          n3store.getQuads(
              quad.object,
              RDF.TYPE,
              RDFS.CLASS,
              null
          ).forEach((q:Quad) => {
                n3store.getQuads(
                  quad.object,
                  RDF.TYPE,
                  SH.NODE_SHAPE,
                  null
              ).forEach((q2:Quad) => {
                classes.push(q2.subject.value);
              });              
          });
      });

      // read the sh:node
      const shnodeQuads = n3store.getQuads(
          factory.namedNode(theUri),
          SH.NODE,
          null,
          null
      ).forEach((q:Quad) => {
        classes.push(q.object.value);
      });  
      
      return classes;
    }

    getDatasource() {
      return this._readDatasourceAnnotationProperty(
          this.uri,
          Datasources.DATASOURCE
      );
    }

    getTreeChildrenDatasource() {
      return this._readDatasourceAnnotationProperty(
          this.uri,
          Datasources.TREE_CHILDREN_DATASOURCE
        );
    }

    getTreeRootsDatasource() {
      return this._readDatasourceAnnotationProperty(
          this.uri,
          Datasources.TREE_ROOTS_DATASOURCE
      );
    }

    getBeginDateProperty(): string | null {
      return this._readAsSingleResource(factory.namedNode(this.uri), factory.namedNode(Config.BEGIN_DATE_PROPERTY));
    }
  
    getEndDateProperty(): string | null {
      return this._readAsSingleResource(factory.namedNode(this.uri), factory.namedNode(Config.END_DATE_PROPERTY));
    }
  
    getExactDateProperty(): string | null {
      return this._readAsSingleResource(factory.namedNode(this.uri), factory.namedNode(Config.EXACT_DATE_PROPERTY));
    }
  
    isEnablingNegation(): boolean {
      return !(
        this._readAsSingleLiteral(factory.namedNode(this.uri), factory.namedNode(Config.ENABLE_NEGATION)) == "false"
      );
    }
  
    isEnablingOptional(): boolean {
      return !(
        this._readAsSingleLiteral(factory.namedNode(this.uri), factory.namedNode(Config.ENABLE_OPTIONAL)) == "false"
      );
    }
  
    getServiceEndpoint(): string | null {
      const service = this._readAsSingleResource(factory.namedNode(this.uri),factory.namedNode(Config.SPARQL_SERVICE));
      if(service) {
        const endpoint = this._readAsSingleResource(service,factory.namedNode(Config.ENDPOINT));
        if (endpoint) {
          return endpoint;
        } 
      }    
      return null;
    }
  
    isLogicallyExecutedAfter(): boolean {
      var executedAfter = this._readAsSingleLiteral(factory.namedNode(this.uri), factory.namedNode(Config.SPARNATURAL_CONFIG_CORE+"executedAfter"));
      return executedAfter;
    }
}