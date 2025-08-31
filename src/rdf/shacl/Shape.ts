import { ShaclStoreModel } from "./ShaclStoreModel";
import { Resource, ResourceFactory } from "../Resource";
import { RDFS } from "../vocabularies/RDFS";
import { StoreModel } from "../StoreModel";
import { VOLIPI } from '../vocabularies/VOLIPI';
import { SH } from '../vocabularies/SH';
import { NamedNode, Quad_Object, Quad_Subject, Term } from '@rdfjs/types';
import { RDF } from "../vocabularies/RDF";
import { DatatypeIfc, DatatypeRegistry } from "../Datatypes";
import { DASH } from "../vocabularies/DASH";
import { ListWidget, SearchWidgetIfc, SearchWidgetRegistry } from "./SearchWidgets";
import { XSD } from "../vocabularies/XSD";
import { DataFactory } from "rdf-data-factory";
// Note : pour éviter les dépendances cycliques, il ne faut pas importer NodeShape ici

const factory = new DataFactory();

/**
 * A SHACL shape, either a NodeShape or a PropertyShape
 */
export class Shape {
    resource: Resource;
    graph:ShaclStoreModel;

    constructor(resource:Resource, graph:ShaclStoreModel) {
      this.resource = resource;
      this.graph = graph;
    }

    /**
     * @returns the underlying resource of this shape (the NodeShape or PropertyShape IRI or BlankNode)
     */
    getResource(): Resource {
        return this.resource;
    }

    /**
     * @returns The color defined with volipi:color, if any
     */
    getVolipiColor(): string | undefined {
      return this.graph.readSingleProperty(this.resource, VOLIPI.COLOR)?.value;
    }

    /**
     * @returns the icon name defined with volipi:iconName, if any (for FontAwesome icons, e.g. "fa-user" or "fas fa-user")
     */
    getVolipiIconName(): string | undefined {
      return this.graph.readSingleProperty(this.resource,VOLIPI.ICON_NAME)?.value;
    }

    /**
     * @returns the icon defined with volipi:icon, if any (for URL to an image)
     */
    getVolipiIcon(): string | undefined {
      return this.graph.readSingleProperty(this.resource,VOLIPI.ICON)?.value;
    }

    /**
     * @returns the order defined with sh:order, if any
     */
    getShOrder(): Term | undefined {
        return this.graph.readSingleProperty(this.resource, SH.ORDER);
    }

    /**
     * @returns the NodeShape IRI that are referenced from this shape with sh:node
     */
    getShNode(): Resource[] {
        return this.graph.readProperty(this.resource, SH.NODE) as Resource[];
    }

    /**
     * @returns the IRI that are referenced from this shape with sh:class
     */
    getShClass(): Resource[] {
        return this.graph.readProperty(this.resource, SH.CLASS) as Resource[];
    }

    /**
     * @returns the IRI that are referenced from this shape with sh:datatype, as DatatypeIfc instances
     * @throws if the datatype is not a NamedNode
     */
    getShDatatype(): DatatypeIfc[] {
        return this.graph.readProperty(this.resource, SH.DATATYPE).map(dt => {
            if(dt.termType !== "NamedNode") {
                throw new Error("sh:datatype value is not a NamedNode");
            }
            return DatatypeRegistry.asDatatype(dt as NamedNode);
        });
    }

    /**
     * @returns the shapes contained in the sh:or list, if any
     */
    getShOr():Resource[] {
      return this.graph.readAsList(this.resource, SH.OR).map(r => ResourceFactory.fromTerm(r));
    }

    /**
     * This is defined as this level so that it is accessible from the sh:or when reading the sh:or of PropertyShapes
     * @returns the values of dash:searchWidget, if any
     */
    getDashSearchWidget(): Resource[] {
        return this.graph.readProperty(this.resource, DASH.SEARCH_WIDGET).map(r => ResourceFactory.fromTerm(r));
    }

    getLabel(lang:string): string | undefined {
      // first try to read an sh:name
      let label = this.graph.readSinglePropertyInLang(this.resource, RDFS.LABEL, lang)?.value;

      // or try to read the local part of the URI, but should not happen
      if(!label) {
        label = StoreModel.getLocalName(this.resource.value) as string;
      }

      return label;
    }

    /**
     * @returns true if the shape is deactivated (sh:deactivated true^^xsd:boolean)
     */
    isDeactivated(): boolean {
      return this.graph.hasTriple(this.resource, SH.DEACTIVATED, factory.literal("true", XSD.BOOLEAN));
    }





    /**
     * Note that this is defined here so that it can be used on NodeShapes inside inner sh:or of PropertyShapes
     * @returns the search widget for this property, based on datatype and count
     */
    getDefaultSearchWidget(): SearchWidgetIfc {
      let highest:SearchWidgetIfc = new ListWidget();
      let highestScore:number = 0;

      // read the range so that it can be passed to the score function
      // this is needed for list widget, which scores higher if the range is skos:Concept
      let theRanges:Resource[] = this.resolveShNodeOrShClass();
      let theRange:Resource = theRanges.length ? theRanges[0] : undefined;

      for (let index = 0; index < SearchWidgetRegistry.getInstance().getRegistry().length; index++) {
        const currentWidget = SearchWidgetRegistry.getInstance().getRegistry()[index];
        let currentScore = currentWidget.score(this.resource, theRange, this.graph);
        if(currentScore > highestScore) {
          highestScore = currentScore;
          highest = currentWidget;
        }        
      }

      return highest;
    }

    /**
     * @returns true if sh:nodeKind = sh:Literal, or if sh:datatype is present, or if sh:languageIn / sh:uniqueLang is present
     */
    isLiteral(): boolean {
        var hasNodeKindLiteral = this.graph.hasTriple(this.resource, SH.NODE_KIND, SH.LITERAL);
        var hasDatatype = this.graph.hasTriple(this.resource, SH.DATATYPE, null);
        var hasLanguageIn = this.graph.hasTriple(this.resource, SH.LANGUAGE_IN, null);
        var hasUniqueLang = this.graph.hasTriple(this.resource, SH.UNIQUE_LANG, null);

        return hasNodeKindLiteral || hasDatatype || hasLanguageIn || hasUniqueLang;
    }

    /**
     * @returns the shapes that are the range of this shape, either from sh:node or from sh:class/^sh:targetClass
     * Note that sh:node has precedence over sh:class : if sh:node is found, no need to look for sh:class
     */
    resolveShNodeOrShClass():Resource[] {         
      var ranges: Resource[] = [];

      // read the sh:node
      const shnodeQuads = this.graph.readProperty(
        this.resource,
        SH.NODE
      ).forEach((q:Quad_Object) => {
        ranges.push(q as Resource);
      });  

      // sh:node has precedence over sh:class : if sh:node is found, no need to look for sh:class
      if(ranges.length == 0) {
        // read the sh:class
        const shclassQuads = this.graph.readProperty(
          this.resource,
          SH.CLASS
        );

        // then for each of them, find all NodeShapes targeting this class
        shclassQuads.forEach((o:Quad_Object) => {
            this.graph.findSubjectsOf(
                SH.TARGET_CLASS,
                o
            ).forEach((q:Quad_Subject) => {
                ranges.push(q as Resource);
            });

            // also look for nodeshapes that have directly this URI and that are themselves classes
            // and nodeshapes
            if(this.graph.hasTriple(
              o as Resource,
              RDF.TYPE,
              RDFS.CLASS,
            )) {
              if(this.graph.hasTriple(
                o as Resource,
                RDF.TYPE,
                SH.NODE_SHAPE,
              )) {
                ranges.push(o as Resource);
              }
            }
        });
      }
      
      return ranges;
    }

}

export class ShapeOrderOrLabelComparator {
  lang:string;

  constructor(lang:string) {
    this.lang = lang;
  }

  compare(item1: Shape, item2: Shape) {
  
    var order1 = item1.getShOrder();
    var order2 = item2.getShOrder();

    if (order1) {
      if (order2) {
        if (order1 == order2) {
          return item1.getLabel(this.lang).localeCompare(item2.getLabel(this.lang));
        } else {
          // if the order is actually a number, convert it to number and use a number conversion
          if(!isNaN(Number(order1.value)) && !isNaN(Number(order2.value))) {
            return Number(order1.value) - Number(order2.value);
          } else {
            return (order1.value > order2.value) ? 1 : -1;
          }
        }
      } else {
        return -1;
      }
    } else {
      if (order2) {
        return 1;
      } else {
        return item1.getLabel(this.lang).localeCompare(item2.getLabel(this.lang));
      }
    }
  };
}