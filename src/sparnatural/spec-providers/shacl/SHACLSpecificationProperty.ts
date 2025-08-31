
import { DataFactory } from 'rdf-data-factory';
import { Config } from "../../ontologies/SparnaturalConfig";
import ISpecificationProperty from "../ISpecificationProperty";
import { SHACLSpecificationEntry } from "./SHACLSpecificationEntry";
import { SpecialSHACLSpecificationEntityRegistry, SpecialSHACLSpecificationEntity } from "./SHACLSpecificationEntity";
import { Datasources } from "../../ontologies/SparnaturalConfigDatasources";
import { RdfStore } from "rdf-stores";
import { Term } from "@rdfjs/types/data-model";
import { StoreModel } from "../../../rdf/StoreModel";
import { StatisticsReader } from "../../../rdf/shacl/StatisticsReader";
import { SHACLSpecificationProvider } from './SHACLSpecificationProvider';
import { XSD } from '../../../rdf/vocabularies/XSD';
import { SH } from '../../../rdf/vocabularies/SH';
import { DatasourceReading } from '../DatasourceReading';
import { RDF } from '../../../rdf/vocabularies/RDF';
import { PropertyShape } from '../../../rdf/shacl/PropertyShape';
import { Shape } from '../../../rdf/shacl/Shape';
import { DatatypeIfc } from '../../../rdf/Datatypes';
import { ShaclStoreModel, ShapeFactory } from '../../../rdf/shacl/ShaclStoreModel';

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
      return this.shape.getLabel(this.lang);
    }

    getTooltip(): string | undefined {
      return (this.shape as PropertyShape).getTooltip(this.lang);
    }

    getPropertyType(range:string): string | undefined {
        return (this.shape as PropertyShape).getSearchWidgetForRange(factory.namedNode(range)).getResource().value;
    }

    omitClassCriteria(): boolean {
      // omits the class criteria iff the property shape is an sh:IRI, but with no sh:class or no sh:node
      var hasNodeKindIri = this.graph.hasTriple(factory.namedNode(this.uri), SH.NODE_KIND, SH.IRI);

      if(hasNodeKindIri) {
        return (this.shape.resolveShNodeOrShClass().length == 0);
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
      return this.shape.isDeactivated();
    }

    getShPath(): Term {
      return (this.shape as PropertyShape).getShPath();
    }

    getParents(): string[] {
      return (this.shape as PropertyShape).getParentProperties().map(r => r.resource.value);
    }

    /**
     * @returns 
     */
    getRange(): string[] {
      // first read on property shape itself
      var classes: string[] = this.shape.resolveShNodeOrShClass().map(r => r.value) ;

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
        var orMembers:Shape[] = this.shape.getShOr().map(m => ShapeFactory.buildShape(m, new ShaclStoreModel(this.store)));
        
        orMembers?.forEach(m => {
          // read sh:class / sh:node
          var orClasses: string[] = m.resolveShNodeOrShClass().map(r => r.value) ;

          // nothing, see if default applies on this sh:or member
          if(orClasses.length == 0) {
            SpecialSHACLSpecificationEntityRegistry.getInstance().getRegistry().forEach((value: SpecialSHACLSpecificationEntity, key: string) => {
              if(key != SpecialSHACLSpecificationEntityRegistry.SPECIAL_SHACL_ENTITY_OTHER) {
                if(value.isRangeOf(this.store, m.resource.value)) {
                  orClasses.push(key);
                }
              }
            });
          }

          // still nothing, recurse one level more
          if(orClasses.length == 0) {
            var orOrMembers:Shape[] = m.getShOr().map(m => ShapeFactory.buildShape(m, new ShaclStoreModel(this.store)));

            orOrMembers?.forEach(orOrMember => {
              // read sh:class / sh:node
              var orOrClasses: string[] = orOrMember.resolveShNodeOrShClass().map(r => r.value) ;

              // nothing, see if default applies on this sh:or member
              if(orOrClasses.length == 0) {
                SpecialSHACLSpecificationEntityRegistry.getInstance().getRegistry().forEach((value: SpecialSHACLSpecificationEntity, key: string) => {
                  if(key != SpecialSHACLSpecificationEntityRegistry.SPECIAL_SHACL_ENTITY_OTHER) {
                    if(value.isRangeOf(this.store, m.resource.value)) {
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


    getDatasource() {
      return DatasourceReading.readDatasourceAnnotationProperty(
          this.uri,
          Datasources.DATASOURCE,
          this.graph
      );
    }

    getTreeChildrenDatasource() {
      return DatasourceReading.readDatasourceAnnotationProperty(
          this.uri,
          Datasources.TREE_CHILDREN_DATASOURCE,
          this.graph
        );
    }

    getTreeRootsDatasource() {
      return DatasourceReading.readDatasourceAnnotationProperty(
          this.uri,
          Datasources.TREE_ROOTS_DATASOURCE,
          this.graph
      );
    }

    getMinValue():string|undefined {
      let datatype:DatatypeIfc[] = this.shape.getShDatatype();
      if(datatype && datatype.length > 0) {
          return datatype[0]?.minInclusive?.toString();
      }
    }

    getMaxValue():string|undefined {
      let datatype:DatatypeIfc[] = this.shape.getShDatatype();
      if(datatype && datatype.length > 0) {
          return datatype[0]?.maxInclusive?.toString();
      }
    }

    getValues():Term[] | undefined {
      return (this.shape as PropertyShape).getShIn();
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
