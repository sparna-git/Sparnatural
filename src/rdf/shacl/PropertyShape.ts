
import { DataFactory, NamedNode } from 'rdf-data-factory';
import { Quad_Subject, Term } from "@rdfjs/types/data-model";

import { Shape } from './Shape';
import { Resource, ResourceFactory } from '../Resource';
import { ShaclStoreModel, ShapeFactory } from './ShaclStoreModel';
import { RDFS } from '../vocabularies/RDFS';
import { SH } from '../vocabularies/SH';
import { StoreModel } from '../StoreModel';
import { VOLIPI } from '../vocabularies/VOLIPI';
import { SKOS } from '../vocabularies/SKOS';
import { SearchWidgetIfc, SearchWidgetRegistry } from './SearchWidgets';

const factory = new DataFactory();

export class PropertyShape extends Shape {

    constructor(resource:Resource, graph:ShaclStoreModel) {
        super(resource, graph);
    }

    /**
     * @returns the sh:path of this property shape
     */
    getShPath(): Resource {
        return ResourceFactory.fromTerm(this.graph.readSingleProperty(this.resource, SH.PATH));
    }

    /**
     * @returns this list of values defined in sh:in, if any, otherwise undefined
     */
    getShIn():Term[] | undefined {
      let values:Term[] = this.graph.readAsList(this.resource, SH.IN);
      return (values.length > 0) ? values : undefined;
    }

    /**
     * @returns The single value defined with sh:hasValue, if any
     */
    getShHasValue():Term | undefined {
      let value:Term = this.graph.readSingleProperty(this.resource, SH.HAS_VALUE);
      return (value) ? value : undefined;
    }

    /**
     * @returns the sh:minCount number if defined, otherwise undefined
     */
    getShMinCount(): number | undefined {
      let minCount = this.graph.readSinglePropertyAsNumber(this.resource, SH.MIN_COUNT);
      return (minCount !== undefined) ? minCount : undefined;
    }

    /**
     * @returns the sh:maxCount number if defined, otherwise undefined
     */
    getShMaxCount(): number | undefined {
      let maxCount = this.graph.readSinglePropertyAsNumber(this.resource, SH.MAX_COUNT);
      return (maxCount !== undefined) ? maxCount : undefined;
    }

    getLabel(lang:string): string {
      // first try to read an sh:name
      let label = this.graph.readSinglePropertyInLang(this.resource, SH.NAME, lang)?.value;

      if(!label) {
        if(this.graph.hasTriple(this.resource,SH.PATH, null)) {
          // try to read the rdfs:label of the property itself
          // note that we try to read an rdfs:label event in case the path is a blank node, e.g. sequence path
          label = this.graph.readSinglePropertyInLang(
            this.getShPath(),
            RDFS.LABEL, 
            lang)?.value;
        }
      }

      // no sh:name present, no property label, display the sh:path without prefixes
      if(!label) {
        label = this.graph.pathToSparql(this.getShPath(), true);
      }      
      // or try to read the local part of the URI, but should not happen
      if(!label) {
        label = StoreModel.getLocalName(this.resource.value) as string;
      }

      return label;
    }

    getTooltip(lang:string): string | undefined {
      let tooltip = this.graph.readSinglePropertyInLang(this.resource, VOLIPI.MESSAGE, lang)?.value;
      if(!tooltip) {
        // try with sh:description
        tooltip = this.graph.readSinglePropertyInLang(this.resource, SH.DESCRIPTION, lang)?.value;
      }

      // make sure we have a path to read properties on the property itself
      if(this.graph.hasTriple(this.resource,SH.PATH, null)) {
        if(!tooltip) {
          // try to read a skos:definition on the property
          // try to read the value of the property itself
          // note that we try to read an rdfs:comment even in case the path is a blank node, e.g. sequence path
          tooltip = this.graph.readSinglePropertyInLang(
            this.getShPath(),
            SKOS.DEFINITION, 
            lang)?.value;
        }

        if(!tooltip) {
          // try to read an rdfs:comment on the property
          // try to read the rdfs:label of the property itself
          // note that we try to read an rdfs:label event in case the path is a blank node, e.g. sequence path
          tooltip = this.graph.readSinglePropertyInLang(
            this.getShPath(),
            RDFS.COMMENT, 
            lang)?.value;
        }
      }

      return tooltip;
    }

    getSearchWidgetForRange(range:Resource): SearchWidgetIfc {
      // select the shape on which this is applied
      // either the property shape, or one of the shape in an inner sh:or

      // find the shapes in the sh:or that has the provided range as sh:class or sh:node
      var theShape:Shape|null = null;

      var orMembers:Shape[] = this.getShOr().map(m => ShapeFactory.buildShape(m, this.graph));
      orMembers.forEach(m => {
        if(m.resolveShNodeOrShClass().map(r => r.value).indexOf(range.value) > -1) {
          theShape = m;
        }
        // recurse one level more
        var orOrMembers:Shape[] = m.getShOr().map(m => ShapeFactory.buildShape(m, this.graph));
        orOrMembers.forEach(orOrMember => {
          if(orOrMember.resolveShNodeOrShClass().map(r => r.value).indexOf(range.value) > -1) {
            theShape = orOrMember;
          }
        });
      });

      // defaults to this property shape
      if(!theShape) {
        theShape = this;
      }

      // read the dash:searchWidget annotation
      let results:Resource[] = theShape.getDashSearchWidget();

      if(results.length) {
        return SearchWidgetRegistry.asSearchWidget(results[0] as NamedNode);
      } else {
        return theShape.getDefaultSearchWidget();
      }
    }

    /**
     * @returns the property shapes that target a superproperty of the property being the path of this shape.
     * In other words follow sh:path/owl:subPropertyOf/^sh:path on the same entity
     */
    getParentProperties(): PropertyShape[] {
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
            this.graph.findSubjectsOf(SH.PROPERTY, this.resource).forEach(nodeShape => {
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
      
      // deduplicate set
      let parents = [...new Set([...parentsFromSuperProperties])];
      return parents
      // and simply return the string value
      .map(term => new PropertyShape(term as Resource, this.graph));
    }


    /**
     * @returns the super properties of the property being the path of this shape, following rdfs:subPropertyOf.
     * If the path is an anonymous node, then an empty array is returned.
     */
    getSuperPropertiesOfPath(): Resource[] {
      // retrieve property
      let property:Resource = this.getShPath();

      if(property.termType == "NamedNode") {
        // then retrieve super properties of this one
        let superProperties:Resource[] = this.graph.readProperty(property, RDFS.SUBPROPERTY_OF) as Resource[];
        return superProperties;
      } else {
        return [];
      }
    }



}

