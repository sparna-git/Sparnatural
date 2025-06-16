
import { DataFactory } from 'rdf-data-factory';
import { Config } from "../../ontologies/SparnaturalConfig";
import ISpecificationProperty from "../ISpecificationProperty";
import { SHACLSpecificationEntry } from "./SHACLSpecificationEntry";
import { ListWidgetScorer, SparnaturalSearchWidgetScorer, SparnaturalSearchWidgetsScorerRegistry } from "./SHACLSearchWidgets";
import { SpecialSHACLSpecificationEntityRegistry, SpecialSHACLSpecificationEntity, SHACLSpecificationEntity } from "./SHACLSpecificationEntity";
import { Datasources } from "../../ontologies/SparnaturalConfigDatasources";
import ISHACLSpecificationEntity from "./ISHACLSpecificationEntity";
import { RdfStore } from "rdf-stores";
import { Quad, Quad_Subject, Term } from "@rdfjs/types/data-model";
import { StoreModel } from "../../../rdf/StoreModel";
import { StatisticsReader } from "../StatisticsReader";
import { SHACLSpecificationProvider } from './SHACLSpecificationProvider';
import { XSD } from '../../../rdf/vocabularies/XSD';
import { SH } from '../../../rdf/vocabularies/SH';
import { VOLIPI } from '../../../rdf/vocabularies/VOLIPI';
import { SKOS } from '../../../rdf/vocabularies/SKOS';
import { DASH } from '../../../rdf/vocabularies/DASH';
import { RDF } from '../BaseRDFReader';
import { RDFS } from '../../../rdf/vocabularies/RDFS';

const factory = new DataFactory();

export class SHACLSpecificationProperty extends SHACLSpecificationEntry implements ISpecificationProperty {

  constructor(uri:string, provider: SHACLSpecificationProvider, n3store: RdfStore, lang: string) {
    super(uri, provider, n3store, lang);
  }

  /**
   * Tests whether the provided property shape URI will be turned into a Sparnatural property
   * @param propertyShapeUri 
   * @param n3store 
   * @returns false if the property is deactivated, or it has an sh:hasValue
   */
  static isSparnaturalSHACLSpecificationProperty(propertyShapeUri:string, n3store: RdfStore):boolean {
    let graph = new StoreModel(n3store);
    let statReader:StatisticsReader = new StatisticsReader(graph);
    let shapeIri = factory.namedNode(propertyShapeUri);
    return (
      !graph.hasTriple(shapeIri, SH.DEACTIVATED, factory.literal("true", XSD.BOOLEAN))
      &&
      !graph.hasTriple(shapeIri, SH.HAS_VALUE, null)
      &&
      (
        (!statReader.hasStatistics(shapeIri))
        ||
        statReader.getTriplesCountForShape(shapeIri) > 0
      )
    );
  }

    getLabel(): string {
      // first try to read an sh:name
      let label = this.graph.readSinglePropertyInLang(factory.namedNode(this.uri), SH.NAME, this.lang)?.value;

      if(!label) {
        if(this.graph.hasTriple(factory.namedNode(this.uri),SH.PATH, null)) {
          // try to read the rdfs:label of the property itself
          // note that we try to read an rdfs:label event in case the path is a blank node, e.g. sequence path
          label = this.graph.readSinglePropertyInLang(
            this.graph.readSingleProperty(factory.namedNode(this.uri),SH.PATH) as Term            , 
            RDFS.LABEL, 
            this.lang)?.value;
        }
      }

      // no sh:name present, no property label, display the sh:path without prefixes
      if(!label) {
        label = new StoreModel(this.store).pathToSparql(this.store.getQuads(factory.namedNode(this.uri),SH.PATH, null, null)[0].object, true);
      }      
      // or try to read the local part of the URI, but should not happen
      if(!label) {
        label = StoreModel.getLocalName(this.uri) as string;
      }

      return label;
    }

    getTooltip(): string | undefined {
      let tooltip = this.graph.readSinglePropertyInLang(factory.namedNode(this.uri), VOLIPI.MESSAGE, this.lang)?.value;
      if(!tooltip) {
        // try with sh:description
        tooltip = this.graph.readSinglePropertyInLang(factory.namedNode(this.uri), SH.DESCRIPTION, this.lang)?.value;
      }

      // make sure we have a path to read properties on the property itself
      if(this.graph.hasTriple(factory.namedNode(this.uri),SH.PATH, null)) {
        if(!tooltip) {
          // try to read a skos:definition on the property
          // try to read the value of the property itself
          // note that we try to read an rdfs:comment even in case the path is a blank node, e.g. sequence path
          tooltip = this.graph.readSinglePropertyInLang(
            this.graph.readSingleProperty(factory.namedNode(this.uri),SH.PATH) as Term            , 
            SKOS.DEFINITION, 
            this.lang)?.value;
        }

        if(!tooltip) {
          // try to read an rdfs:comment on the property
          // try to read the rdfs:label of the property itself
          // note that we try to read an rdfs:label event in case the path is a blank node, e.g. sequence path
          tooltip = this.graph.readSinglePropertyInLang(
            this.graph.readSingleProperty(factory.namedNode(this.uri),SH.PATH) as Term            , 
            RDFS.COMMENT, 
            this.lang)?.value;
        }
      }

      return tooltip;
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
        var orMembers = this.graph.readAsList(factory.namedNode(this.uri), SH.OR);
        orMembers?.forEach(m => {
          if(rangeEntity.isRangeOf(this.store, m.value)) {
            shapeUri = m.value;
          }
          // recurse one level more
          var orOrMembers = this.graph.readAsList(m, SH.OR);
          orOrMembers?.forEach(orOrMember => {
            if(rangeEntity.isRangeOf(this.store, orOrMember.value)) {
              shapeUri = orOrMember.value;
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
          return this.getDefaultPropertyType(shapeUri, range);
        }
    }

    /**
     * @param shapeUri the shape URI (this property shape or an or member of the range of this shape) from which to compute the default property type (e.g. by reading the associated count)
     * @returns the default widget for this property, based on datatype and count
     */
    getDefaultPropertyType(shapeUri:string, range:string): string {
      let highest:SparnaturalSearchWidgetScorer = new ListWidgetScorer();
      let highestScore:number = 0;
      for (let index = 0; index < SparnaturalSearchWidgetsScorerRegistry.getInstance().getSearchWidgets().length; index++) {
        const currentWidget = SparnaturalSearchWidgetsScorerRegistry.getInstance().getSearchWidgets()[index];
        let currentScore = currentWidget.score(shapeUri, range, new StoreModel(this.store), this.provider);
        if(currentScore > highestScore) {
          highestScore = currentScore;
          highest = currentWidget;
        }        
      }
      return highest.getUri();
    }

    omitClassCriteria(): boolean {
      // omits the class criteria iff the property shape is an sh:IRI, but with no sh:class or no sh:node
      var hasNodeKindIri = this.graph.hasTriple(factory.namedNode(this.uri), SH.NODE_KIND, SH.IRI);

      if(hasNodeKindIri) {
        return (this.#getShClassAndShNodeRange().length == 0);
      }

      return false;
    }

    /**
     * A property is multilingual if its datatype points to rdf:langString
     */
    isMultilingual(): boolean {
      return this.graph.hasTriple(factory.namedNode(this.uri), SH.DATATYPE, RDF.LANG_STRING)
    }

    isDeactivated(): boolean {
      return this.graph.hasTriple(factory.namedNode(this.uri), SH.DEACTIVATED, factory.literal("true", XSD.BOOLEAN));
    }

    getShPath(): Term {
      return this.graph.readSingleProperty(factory.namedNode(this.uri), SH.PATH);
    }

    getParents(): string[] {
      let parentsFromSuperProperties:Term[] = this.getSuperPropertiesOfPath()
      // note : we exclude blank nodes
      .filter(term => term.termType == "NamedNode")
      // we find the property shape having this property as a path
      .map(term => {
          let propertyShapesWithSuperProperty:Quad_Subject[] = this.graph.findSubjectsOf(SH.PATH, term);
          let result:Quad_Subject = undefined;          

          // we can find multiple property shapes with this super property
          // we need to filter them to find the one that is referenced from the same node shape as the one the current property is attached
          propertyShapesWithSuperProperty.forEach(ps => {
            // a potential issue is that this same property shape may be attached to multiple node shapes, so we need to check on each of them
            this.graph.findSubjectsOf(SH.PROPERTY, factory.namedNode(this.uri)).forEach(nodeShape => {
              if(this.graph.hasTriple(
                nodeShape,
                SH.PROPERTY,
                ps
              )) {
                result = ps;
              }
            });
          })
          return result;
      })
      // remove those for which the shape was not found
      .filter(term => (term != undefined));
      
      // concat parents from superclasses and from node - deduplicated
      let parents = [...new Set([...parentsFromSuperProperties])];
      return parents
      // and simply return the string value
      .map(term => term.value);
    }

    /**
     * @returns the property shapes that target a superproperty of the property being the path of this shape.
     * In other words follow sh:path/owl:subPropertyOf/^sh:path on the same entity
     */
    getSuperPropertiesOfPath(): Term[] {
      // retrieve property
      let property:Term = this.graph.readSingleProperty(factory.namedNode(this.uri),SH.PATH) as Term;
      if(property.termType == "NamedNode") {
        // then retrieve super properties of this one
        let superProperties:Term[] = this.graph.readProperty(property, RDFS.SUBPROPERTY_OF);
        return superProperties;
      } else {
        return [];
      }
    }

    /**
     * @returns 
     */
    getRange(): string[] {
      // first read on property shape itself
      var classes: string[] = SHACLSpecificationProperty.readShClassAndShNodeOn(this.store, factory.namedNode(this.uri));

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
        var orMembers = this.graph.readAsList(factory.namedNode(this.uri), SH.OR);
        
        orMembers?.forEach(m => {
          // read sh:class / sh:node
          var orClasses: string[] = SHACLSpecificationProperty.readShClassAndShNodeOn(this.store, m);

          // nothing, see if default applies on this sh:or member
          if(orClasses.length == 0) {
            SpecialSHACLSpecificationEntityRegistry.getInstance().getRegistry().forEach((value: SpecialSHACLSpecificationEntity, key: string) => {
              if(key != SpecialSHACLSpecificationEntityRegistry.SPECIAL_SHACL_ENTITY_OTHER) {
                if(value.isRangeOf(this.store, m.value)) {
                  orClasses.push(key);
                }
              }
            });
          }

          // still nothing, recurse one level more
          if(orClasses.length == 0) {
            var orOrMembers = this.graph.readAsList(m, SH.OR);
            orOrMembers?.forEach(orOrMember => {
              // read sh:class / sh:node
              var orOrClasses: string[] = SHACLSpecificationProperty.readShClassAndShNodeOn(this.store, orOrMember);
              // nothing, see if default applies on this sh:or member
              if(orOrClasses.length == 0) {
                SpecialSHACLSpecificationEntityRegistry.getInstance().getRegistry().forEach((value: SpecialSHACLSpecificationEntity, key: string) => {
                  if(key != SpecialSHACLSpecificationEntityRegistry.SPECIAL_SHACL_ENTITY_OTHER) {
                    if(value.isRangeOf(this.store, orOrMember.value)) {
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
      var classes: string[] = SHACLSpecificationProperty.readShClassAndShNodeOn(this.store, factory.namedNode(this.uri));

      // read sh:or content
      var orMembers = this.graph.readAsList(factory.namedNode(this.uri), SH.OR);
      orMembers?.forEach(m => {
        classes.push(...SHACLSpecificationProperty.readShClassAndShNodeOn(this.store, m));
      });

      return classes;
    }

    static readShClassAndShNodeOn(n3store:RdfStore, theUriOrBlankNode:Term):string[] {         
      var ranges: string[] = [];

      // read the sh:node
      const shnodeQuads = n3store.getQuads(
        theUriOrBlankNode,
        SH.NODE,
        null,
        null
      ).forEach((q:Quad) => {
        ranges.push(q.object.value);
      });  

      // sh:node has precedence over sh:class : if sh:node is found, no need to look for sh:class
      if(ranges.length == 0) {
        // read the sh:class
        const shclassQuads = n3store.getQuads(
          theUriOrBlankNode,
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
                ranges.push(q.subject.value);
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
                    q.subject,
                    RDF.TYPE,
                    SH.NODE_SHAPE,
                    null
                ).forEach((q2:Quad) => {
                  ranges.push(q2.subject.value);
                });              
            });
        });
      }
      
      return ranges;
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

    getMinValue():string|undefined {
      let datatype = this.graph.readSingleProperty(factory.namedNode(this.uri), SH.DATATYPE)?.value;
      if(datatype && DATATYPES_BOUND[datatype]?.minInclusive) {
          return DATATYPES_BOUND[datatype]?.minInclusive?.toString();
      }
    }

    getMaxValue():string|undefined {
      let datatype = this.graph.readSingleProperty(factory.namedNode(this.uri), SH.DATATYPE)?.value;
      if(datatype && DATATYPES_BOUND[datatype]?.maxInclusive) {
          return DATATYPES_BOUND[datatype]?.maxInclusive?.toString();
      }
    }

    getValues():Term[] | undefined {
      return this.graph.readAsList(factory.namedNode(this.uri), SH.IN);
    }

    getBeginDateProperty(): string | undefined {
      return this.graph.readSingleProperty(factory.namedNode(this.uri), factory.namedNode(Config.BEGIN_DATE_PROPERTY))?.value;
    }
  
    getEndDateProperty(): string | undefined {
      return this.graph.readSingleProperty(factory.namedNode(this.uri), factory.namedNode(Config.END_DATE_PROPERTY))?.value;
    }
  
    getExactDateProperty(): string | undefined {
      return this.graph.readSingleProperty(factory.namedNode(this.uri), factory.namedNode(Config.EXACT_DATE_PROPERTY))?.value;
    }
  
    isEnablingNegation(): boolean {
      return !(
        this.graph.readSingleProperty(factory.namedNode(this.uri), factory.namedNode(Config.ENABLE_NEGATION))?.value == "false"
      );
    }
  
    isEnablingOptional(): boolean {
      return !(
        this.graph.readSingleProperty(factory.namedNode(this.uri), factory.namedNode(Config.ENABLE_OPTIONAL))?.value == "false"
      );
    }
  
    getServiceEndpoint(): string | undefined {
      const service = this.graph.readSingleProperty(factory.namedNode(this.uri),factory.namedNode(Config.SPARQL_SERVICE));
      if(service) {
        return this.graph.readSingleProperty(service,factory.namedNode(Config.ENDPOINT))?.value;
      }
    }
  
    isLogicallyExecutedAfter(): boolean {
      return this.graph.hasTriple(factory.namedNode(this.uri), factory.namedNode(Config.SPARNATURAL_CONFIG_CORE+"executedAfter"), null);
    }

    static compare(item1: SHACLSpecificationProperty, item2: SHACLSpecificationProperty) {
      return SHACLSpecificationEntry.compare(item1, item2);
    }
}


const DATATYPES_BOUND:{[key: string]:{minInclusive?:number, maxInclusive?:number}} = {
  "http://www.w3.org/2001/XMLSchema#byte" : {
    minInclusive : -127,
    maxInclusive : 128
  },
  "http://www.w3.org/2001/XMLSchema#unsignedByte" : {
    minInclusive : 0,
    maxInclusive : 255
  },
  "http://www.w3.org/2001/XMLSchema#short" : {
    minInclusive : -32768,
    maxInclusive : 32767
  },
  "http://www.w3.org/2001/XMLSchema#unsignedShort" : {
    minInclusive : 0,
    maxInclusive : 65535
  },
  "http://www.w3.org/2001/XMLSchema#int" : {
    minInclusive : -2147483648,
    maxInclusive : 2147483647
  },
  "http://www.w3.org/2001/XMLSchema#unsignedInt" : {
    minInclusive : 0,
    maxInclusive : 4294967295
  },
  "http://www.w3.org/2001/XMLSchema#long" : {
    minInclusive : -9223372036854775808,
    maxInclusive : 9223372036854775807
  },
  "http://www.w3.org/2001/XMLSchema#unsignedLong" : {
    minInclusive : 0,
    maxInclusive : 18446744073709551615
  },
  "http://www.w3.org/2001/XMLSchema#nonNegativeInteger" : {
    minInclusive : 0
  },
  "http://www.w3.org/2001/XMLSchema#integer" : {
    // nothing
  }

}