import { Quad, Store } from "n3";
import { Config } from "../../ontologies/SparnaturalConfig";
import factory from "@rdfjs/data-model";
import { SH, XSD } from "./SHACLSpecificationProvider";
import { RDF } from "../BaseRDFReader";




export interface SparnaturalSearchWidget {
    getUri():string;
    score(propertyShape:string, n3store: Store<Quad>):number;
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

    score(propertyShape:string, n3store: Store<Quad>):number {
        return 10;
    }

}
SparnaturalSearchWidgetsRegistry.getInstance().getSearchWidgets().push(new ListWidget());

export class AutocompleteWidget {

    getUri():string {
        return Config.AUTOCOMPLETE_PROPERTY;
    }

    score(propertyShape:string, n3store: Store<Quad>):number {
        return -1;
    }

}
SparnaturalSearchWidgetsRegistry.getInstance().getSearchWidgets().push(new AutocompleteWidget());

export class TreeWidget {

    getUri():string {
        return Config.TREE_PROPERTY;
    }

    score(propertyShape:string, n3store: Store<Quad>):number {
        return -1;
    }

}
SparnaturalSearchWidgetsRegistry.getInstance().getSearchWidgets().push(new TreeWidget());

export class DatePickerWidget {

    getUri():string {
        return Config.TIME_PROPERTY_DATE;
    }

    score(propertyShape:string, n3store: Store<Quad>):number {
        // if the datatype is xsd:date or xsd:dateTime
        if(
        _hasTriple(n3store, factory.namedNode(propertyShape), SH.DATATYPE, XSD.DATE) 
        || 
        _hasTriple(n3store, factory.namedNode(propertyShape), SH.DATATYPE, XSD.DATE_TIME)
        ) {
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

    score(propertyShape:string, n3store: Store<Quad>):number {
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

    score(propertyShape:string, n3store: Store<Quad>):number {
        // TODO : if the datatype is wktLiteral
        return -1;
    }

}
SparnaturalSearchWidgetsRegistry.getInstance().getSearchWidgets().push(new MapWidget());

export class BooleanWidget {

    getUri():string {
        return Config.BOOLEAN_PROPERTY;
    }

    score(propertyShape:string, n3store: Store<Quad>):number {
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

    score(propertyShape:string, n3store: Store<Quad>):number {
        return -1;
    }

}
SparnaturalSearchWidgetsRegistry.getInstance().getSearchWidgets().push(new NoWidget());


export class SearchRegexWidget {

    getUri():string {
        return Config.SEARCH_PROPERTY;
    }

    score(propertyShape:string, n3store: Store<Quad>):number {
        // if the datatype is xsd:string or rdf:langString
        if(
            _hasTriple(n3store, factory.namedNode(propertyShape), SH.DATATYPE, XSD.STRING) 
            ||
            _hasTriple(n3store, factory.namedNode(propertyShape), SH.DATATYPE, RDF.LANG_STRING)
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

    score(propertyShape:string, n3store: Store<Quad>):number {
        return -1;
    }

}
SparnaturalSearchWidgetsRegistry.getInstance().getSearchWidgets().push(new SearchEqualWidget());


function _hasTriple(n3store: Store<Quad>, rdfNode: any, property: any, value:any) {
    return (
        n3store.getQuads(
        rdfNode,
        property,
        value,
        null
      ).length > 0
    );
  }