import { Config } from "../../ontologies/SparnaturalConfig";
import { DataFactory } from 'rdf-data-factory';
import { DCT, SH, VOID, XSD } from "./SHACLSpecificationProvider";
import { BaseRDFReader, RDF } from "../BaseRDFReader";
import { GEOSPARQL } from "../../components/widgets/MapWidget";
import { RdfStore } from "rdf-stores";
import { Quad_Subject } from "@rdfjs/types/data-model";

const factory = new DataFactory();


export interface SparnaturalSearchWidget {
    getUri():string;
    score(propertyShape:string, n3store: RdfStore):number;
}

export class SparnaturalSearchWidgetsRegistry {
    static instance = new SparnaturalSearchWidgetsRegistry();

    searchWidgets:SparnaturalSearchWidget[] = new Array<SparnaturalSearchWidget>();

    private constructor() { }

    public static getInstance(): SparnaturalSearchWidgetsRegistry {
        if (!SparnaturalSearchWidgetsRegistry.instance) {
            SparnaturalSearchWidgetsRegistry.instance = new SparnaturalSearchWidgetsRegistry();
        }

        return SparnaturalSearchWidgetsRegistry.instance;
    }

    getSearchWidgets(): SparnaturalSearchWidget[]{
        return this.searchWidgets;
    }
}

export class ListWidget implements SparnaturalSearchWidget {

    getUri():string {
        return Config.LIST_PROPERTY;
    }

    score(propertyShape:string, n3store: RdfStore):number {
        return 10;
    }

}
SparnaturalSearchWidgetsRegistry.getInstance().getSearchWidgets().push(new ListWidget());

export class AutocompleteWidget {

    getUri():string {
        return Config.AUTOCOMPLETE_PROPERTY;
    }

    score(propertyShape:string, n3store: RdfStore):number {
        // if there is a distinctObjectsCount and the distinctObjectsCount is > 500, then this will score higher
        let count = distinctObjectsCount(n3store, propertyShape);
        if(count && count > 500) {
            return 20;
        } else {
            return -1;
        }
        
    }

}
SparnaturalSearchWidgetsRegistry.getInstance().getSearchWidgets().push(new AutocompleteWidget());

export class TreeWidget {

    getUri():string {
        return Config.TREE_PROPERTY;
    }

    score(propertyShape:string, n3store: RdfStore):number {
        return -1;
    }

}
SparnaturalSearchWidgetsRegistry.getInstance().getSearchWidgets().push(new TreeWidget());

export class DatePickerWidget {

    getUri():string {
        return Config.TIME_PROPERTY_DATE;
    }

    score(propertyShape:string, n3store: RdfStore):number {
        let reader:BaseRDFReader = new BaseRDFReader(n3store, "en");

        let hasDateOrDateTimePredicate = function(rdfNode: any) {
            if(
            reader._hasTriple(rdfNode, SH.DATATYPE, XSD.DATE) 
            || 
            reader._hasTriple(rdfNode, SH.DATATYPE, XSD.DATE_TIME)) {
                return true;
            } else {
                return false;
            }
        }

        // if the datatype is xsd:date or xsd:dateTime
        if(
            hasDateOrDateTimePredicate(factory.namedNode(propertyShape))
        ){
            return 50;
        } else {
            return -1;
        }
        ;
    }

}
SparnaturalSearchWidgetsRegistry.getInstance().getSearchWidgets().push(new DatePickerWidget());

export class YearPickerWidget {

    getUri():string {
        return Config.TIME_PROPERTY_YEAR;
    }

    score(propertyShape:string, n3store: RdfStore):number {
        // if the datatype is xsd:gYear
        if(
            _hasTriple(n3store, factory.namedNode(propertyShape), SH.DATATYPE, XSD.GYEAR) 
        ) {
            return 50;
        } else {
            return -1;
        }
        ;
    }

}
SparnaturalSearchWidgetsRegistry.getInstance().getSearchWidgets().push(new YearPickerWidget());

export class MapWidget {

    getUri():string {
        return Config.MAP_PROPERTY;
    }

    score(propertyShape:string, n3store: RdfStore):number {
        // if the datatype is geo:wktLiteral
        if(
            _hasTriple(n3store, factory.namedNode(propertyShape), SH.DATATYPE, GEOSPARQL.WKT_LITERAL) 
        ) {
            return 50;
        } else {
            return -1;
        }
        ;
    }

}
SparnaturalSearchWidgetsRegistry.getInstance().getSearchWidgets().push(new MapWidget());

export class BooleanWidget {

    getUri():string {
        return Config.BOOLEAN_PROPERTY;
    }

    score(propertyShape:string, n3store: RdfStore):number {
        // if the datatype is xsd:boolean
        if(
            _hasTriple(n3store, factory.namedNode(propertyShape), SH.DATATYPE, XSD.BOOLEAN) 
        ) {
            return 50;
        } else {
            return -1;
        }
        ;
    }

}
SparnaturalSearchWidgetsRegistry.getInstance().getSearchWidgets().push(new BooleanWidget());


export class NoWidget {

    getUri():string {
        return Config.NON_SELECTABLE_PROPERTY;
    }

    score(propertyShape:string, n3store: RdfStore):number {
        return -1;
    }

}
SparnaturalSearchWidgetsRegistry.getInstance().getSearchWidgets().push(new NoWidget());


export class SearchRegexWidget {

    getUri():string {
        return Config.SEARCH_PROPERTY;
    }

    score(propertyShape:string, n3store: RdfStore):number {
        let count = distinctObjectsCount(n3store, propertyShape);
        // if the datatype is xsd:string or rdf:langString, and there is a large number, otherwise we stick with list widget
        if(
            (
                _hasTriple(n3store, factory.namedNode(propertyShape), SH.DATATYPE, XSD.STRING) 
                ||
                _hasTriple(n3store, factory.namedNode(propertyShape), SH.DATATYPE, RDF.LANG_STRING)
            )
            &&
            (count && count > 500)
        ) {
            return 50;
        } else {
            return -1;
        }
        ;
    }

}
SparnaturalSearchWidgetsRegistry.getInstance().getSearchWidgets().push(new SearchRegexWidget());

export class SearchEqualWidget {

    getUri():string {
        return Config.STRING_EQUALS_PROPERTY;
    }

    score(propertyShape:string, n3store: RdfStore):number {
        return -1;
    }

}
SparnaturalSearchWidgetsRegistry.getInstance().getSearchWidgets().push(new SearchEqualWidget());


function _hasTriple(n3store: RdfStore, rdfNode: any, property: any, value:any) {
    return (
      n3store.getQuads(
        rdfNode,
        property,
        value,
        null
      ).length > 0
    );
}

function distinctObjectsCount(n3store: RdfStore, propertyShape:string) {
    let partitions:Quad_Subject[] = n3store
      .getQuads(null, DCT.CONFORMS_TO, factory.namedNode(propertyShape), null)
      .map((quad: { subject: any }) => quad.subject);

      let result:number|undefined = undefined
      partitions.forEach(partition => {
        result = _readAsSingleInteger(n3store, partition, VOID.DISTINCT_OBJECTS);
      });

      return result
}

function _readAsSingleInteger(n3store: RdfStore, subject: Quad_Subject, property: any):number|undefined {
    var value = _readAsSingleLiteral(n3store, subject, property);
    if(value) {
        return Number.parseInt(value);
    }
}

function _readAsSingleLiteral(n3store: RdfStore, subject: Quad_Subject, property: any) {
    var values = _readAsLiteral(n3store, subject, property);
    if (values.length == 0) {
      return undefined;
    } else {
      return values[0];
    }
}

function _readAsLiteral(n3store: RdfStore, subject: Quad_Subject, property: any) {
    return n3store
      .getQuads(subject, property, null, null)
      .map((quad: { object: { value: any } }) => quad.object.value);
  }