import { Config } from "../../ontologies/SparnaturalConfig";
import { DataFactory } from 'rdf-data-factory';
import { SH, XSD } from "./SHACLSpecificationProvider";
import { GEOSPARQL } from "../../components/widgets/MapWidget";
import { StoreModel } from "../StoreModel";
import { StatisticsReader } from "../StatisticsReader";
import { RDF } from "../BaseRDFReader";

const factory = new DataFactory();


export interface SparnaturalSearchWidget {
    getUri():string;
    score(propertyShape:string, store: StoreModel):number;
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

export class AutocompleteWidget implements SparnaturalSearchWidget {

    getUri():string {
        return Config.AUTOCOMPLETE_PROPERTY;
    }

    score(propertyShape:string, store: StoreModel):number {
        return 10;
    }

}
SparnaturalSearchWidgetsRegistry.getInstance().getSearchWidgets().push(new AutocompleteWidget());

export class ListWidget implements SparnaturalSearchWidget {

    getUri():string {
        return Config.LIST_PROPERTY;
    }

    score(propertyShape:string, store: StoreModel):number {
        // if there is a provided list of values, score higher
        if(store.hasTriple(factory.namedNode(propertyShape), SH.IN, null) ) {
            return 100;
        }
        
        // if there is a distinctObjectsCount and the distinctObjectsCount is < 500, then this will score higher
        let count = new StatisticsReader(store).getDistinctObjectsCountForShape(factory.namedNode(propertyShape));
        if(count && (count < 500)) {
            return 20;
        } else {
            return -1;
        }
    }

}
SparnaturalSearchWidgetsRegistry.getInstance().getSearchWidgets().push(new ListWidget());

export class TreeWidget implements SparnaturalSearchWidget {

    getUri():string {
        return Config.TREE_PROPERTY;
    }

    score(propertyShape:string, store: StoreModel):number {
        return -1;
    }

}
SparnaturalSearchWidgetsRegistry.getInstance().getSearchWidgets().push(new TreeWidget());

export class DatePickerWidget implements SparnaturalSearchWidget {

    getUri():string {
        return Config.TIME_PROPERTY_DATE;
    }

    score(propertyShape:string, store: StoreModel):number {

        let hasDateOrDateTimePredicate = function(rdfNode: any) {
            if(
                store.hasTriple(rdfNode, SH.DATATYPE, XSD.DATE) 
                || 
                store.hasTriple(rdfNode, SH.DATATYPE, XSD.DATE_TIME)
            ) {
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

export class YearPickerWidget implements SparnaturalSearchWidget {

    getUri():string {
        return Config.TIME_PROPERTY_YEAR;
    }

    score(propertyShape:string, store: StoreModel):number {
        // if the datatype is xsd:gYear
        if(
            store.hasTriple(factory.namedNode(propertyShape), SH.DATATYPE, XSD.GYEAR) 
        ) {
            return 50;
        } else {
            return -1;
        }
        ;
    }

}
SparnaturalSearchWidgetsRegistry.getInstance().getSearchWidgets().push(new YearPickerWidget());

export class MapWidget implements SparnaturalSearchWidget {

    getUri():string {
        return Config.MAP_PROPERTY;
    }

    score(propertyShape:string, store: StoreModel):number {
        // if the datatype is geo:wktLiteral
        if(
            store.hasTriple(factory.namedNode(propertyShape), SH.DATATYPE, GEOSPARQL.WKT_LITERAL) 
        ) {
            return 50;
        } else {
            return -1;
        }
        ;
    }

}
SparnaturalSearchWidgetsRegistry.getInstance().getSearchWidgets().push(new MapWidget());

export class BooleanWidget implements SparnaturalSearchWidget {

    getUri():string {
        return Config.BOOLEAN_PROPERTY;
    }

    score(propertyShape:string, store: StoreModel):number {
        // if the datatype is xsd:boolean
        if(
            store.hasTriple(factory.namedNode(propertyShape), SH.DATATYPE, XSD.BOOLEAN) 
        ) {
            return 50;
        } else {
            return -1;
        }
        ;
    }

}
SparnaturalSearchWidgetsRegistry.getInstance().getSearchWidgets().push(new BooleanWidget());


export class NumberWidget implements SparnaturalSearchWidget {

    getUri():string {
        return Config.NUMBER_PROPERTY;
    }

    score(propertyShape:string, store: StoreModel):number {
        // if the datatype is xsd:boolean
        if(
            store.hasTriple(factory.namedNode(propertyShape), SH.DATATYPE, XSD.BYTE)
            ||
            store.hasTriple(factory.namedNode(propertyShape), SH.DATATYPE, XSD.DECIMAL)
            ||
            store.hasTriple(factory.namedNode(propertyShape), SH.DATATYPE, XSD.DOUBLE) 
            ||
            store.hasTriple(factory.namedNode(propertyShape), SH.DATATYPE, XSD.FLOAT) 
            ||
            store.hasTriple(factory.namedNode(propertyShape), SH.DATATYPE, XSD.INT)
            ||
            store.hasTriple(factory.namedNode(propertyShape), SH.DATATYPE, XSD.INTEGER)
            ||
            store.hasTriple(factory.namedNode(propertyShape), SH.DATATYPE, XSD.LONG)
            ||
            store.hasTriple(factory.namedNode(propertyShape), SH.DATATYPE, XSD.NONNEGATIVE_INTEGER)
            ||
            store.hasTriple(factory.namedNode(propertyShape), SH.DATATYPE, XSD.SHORT)
            ||
            store.hasTriple(factory.namedNode(propertyShape), SH.DATATYPE, XSD.UNSIGNED_BYTE)
            ||
            store.hasTriple(factory.namedNode(propertyShape), SH.DATATYPE, XSD.UNSIGNED_INT)
            ||
            store.hasTriple(factory.namedNode(propertyShape), SH.DATATYPE, XSD.UNSIGNED_LONG)
            ||
            store.hasTriple(factory.namedNode(propertyShape), SH.DATATYPE, XSD.UNSIGNED_SHORT)            
        ) {
            return 50;
        } else {
            return -1;
        }
        ;
    }

}
SparnaturalSearchWidgetsRegistry.getInstance().getSearchWidgets().push(new NumberWidget());


export class NoWidget implements SparnaturalSearchWidget {

    getUri():string {
        return Config.NON_SELECTABLE_PROPERTY;
    }

    score(propertyShape:string, store: StoreModel):number {
        return -1;
    }

}
SparnaturalSearchWidgetsRegistry.getInstance().getSearchWidgets().push(new NoWidget());


export class SearchRegexWidget implements SparnaturalSearchWidget {

    getUri():string {
        return Config.SEARCH_PROPERTY;
    }

    score(propertyShape:string, store: StoreModel):number {
        let count = new StatisticsReader(store).getDistinctObjectsCountForShape(factory.namedNode(propertyShape));
        // if the datatype is xsd:string or rdf:langString, and there is a large number, otherwise we stick with list widget
        if(
            (
                store.hasTriple(factory.namedNode(propertyShape), SH.DATATYPE, XSD.STRING) 
                ||
                store.hasTriple(factory.namedNode(propertyShape), SH.DATATYPE, RDF.LANG_STRING)
            )
            &&
            // if there is no count, this will always score high
            (!count || (count > 500))
        ) {
            return 50;
        } else {
            return -1;
        }
        ;
    }

}
SparnaturalSearchWidgetsRegistry.getInstance().getSearchWidgets().push(new SearchRegexWidget());

export class SearchEqualWidget implements SparnaturalSearchWidget {

    getUri():string {
        return Config.STRING_EQUALS_PROPERTY;
    }

    score(propertyShape:string, store: StoreModel):number {
        return -1;
    }

}
SparnaturalSearchWidgetsRegistry.getInstance().getSearchWidgets().push(new SearchEqualWidget());

