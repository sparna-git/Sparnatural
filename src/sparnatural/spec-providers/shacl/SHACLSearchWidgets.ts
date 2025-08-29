import { Config } from "../../ontologies/SparnaturalConfig";
import { DataFactory } from 'rdf-data-factory';
import { SH } from '../../../rdf/vocabularies/SH';
import { SKOS } from '../../../rdf/vocabularies/SKOS';
import { XSD } from '../../../rdf/vocabularies/XSD';
import { GEOSPARQL } from "../../components/widgets/MapWidget";
import { StoreModel } from "../../../rdf/StoreModel";
import { StatisticsReader } from "../StatisticsReader";
import { ISparnaturalSpecification } from "../ISparnaturalSpecification";
import { RDF } from "../../../rdf/vocabularies/RDF";

const factory = new DataFactory();


export interface SparnaturalSearchWidgetScorer {
    getUri():string;
    score(propertyShape:string, range:string, store: StoreModel, config: ISparnaturalSpecification):number;
}

export class SparnaturalSearchWidgetsScorerRegistry {
    static instance = new SparnaturalSearchWidgetsScorerRegistry();

    searchWidgets:SparnaturalSearchWidgetScorer[] = new Array<SparnaturalSearchWidgetScorer>();

    private constructor() { }

    public static getInstance(): SparnaturalSearchWidgetsScorerRegistry {
        if (!SparnaturalSearchWidgetsScorerRegistry.instance) {
            SparnaturalSearchWidgetsScorerRegistry.instance = new SparnaturalSearchWidgetsScorerRegistry();
        }

        return SparnaturalSearchWidgetsScorerRegistry.instance;
    }

    getSearchWidgets(): SparnaturalSearchWidgetScorer[]{
        return this.searchWidgets;
    }
}

export class AutocompleteWidgetScorer implements SparnaturalSearchWidgetScorer {

    getUri():string {
        return Config.AUTOCOMPLETE_PROPERTY;
    }

    score(propertyShape:string, range:string, store: StoreModel, config: ISparnaturalSpecification):number {
        return 10;
    }

}
SparnaturalSearchWidgetsScorerRegistry.getInstance().getSearchWidgets().push(new AutocompleteWidgetScorer());

export class ListWidgetScorer implements SparnaturalSearchWidgetScorer {

    getUri():string {
        return Config.LIST_PROPERTY;
    }

    score(propertyShape:string, range:string, store: StoreModel, config: ISparnaturalSpecification):number {
        // if there is a provided list of values, score higher
        if(store.hasTriple(factory.namedNode(propertyShape), SH.IN, null) ) {
            return 100;
        }
        
        // if there is a distinctObjectsCount and the distinctObjectsCount is < 500, then this will score higher
        let count = new StatisticsReader(store).getDistinctObjectsCountForShape(factory.namedNode(propertyShape));
        if(count && (count < 500)) {
            return 20;
        }
        
        // if the shape points to skos:Concept in sh:class, score higher
        if(store.hasTriple(factory.namedNode(propertyShape), SH.CLASS, SKOS.CONCEPT)) {
            return 20;
        }

        if(config.getEntity(range).couldBeSkosConcept()){
            return 20;                    
        }

        return -1;
    }

}
SparnaturalSearchWidgetsScorerRegistry.getInstance().getSearchWidgets().push(new ListWidgetScorer());

export class TreeWidgetScorer implements SparnaturalSearchWidgetScorer {

    getUri():string {
        return Config.TREE_PROPERTY;
    }

    score(propertyShape:string, range:string, store: StoreModel, config: ISparnaturalSpecification):number {
        return -1;
    }

}
SparnaturalSearchWidgetsScorerRegistry.getInstance().getSearchWidgets().push(new TreeWidgetScorer());

export class DatePickerWidgetScorer implements SparnaturalSearchWidgetScorer {

    getUri():string {
        return Config.TIME_PROPERTY_DATE;
    }

    score(propertyShape:string, range:string, store: StoreModel, config: ISparnaturalSpecification):number {

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
SparnaturalSearchWidgetsScorerRegistry.getInstance().getSearchWidgets().push(new DatePickerWidgetScorer());

export class YearPickerWidgetScorer implements SparnaturalSearchWidgetScorer {

    getUri():string {
        return Config.TIME_PROPERTY_YEAR;
    }

    score(propertyShape:string, range:string, store: StoreModel, config: ISparnaturalSpecification):number {
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
SparnaturalSearchWidgetsScorerRegistry.getInstance().getSearchWidgets().push(new YearPickerWidgetScorer());

export class MapWidgetScorer implements SparnaturalSearchWidgetScorer {

    getUri():string {
        return Config.MAP_PROPERTY;
    }

    score(propertyShape:string, range:string, store: StoreModel, config: ISparnaturalSpecification):number {
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
SparnaturalSearchWidgetsScorerRegistry.getInstance().getSearchWidgets().push(new MapWidgetScorer());

export class BooleanWidgetScorer implements SparnaturalSearchWidgetScorer {

    getUri():string {
        return Config.BOOLEAN_PROPERTY;
    }

    score(propertyShape:string, range:string, store: StoreModel, config: ISparnaturalSpecification):number {
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
SparnaturalSearchWidgetsScorerRegistry.getInstance().getSearchWidgets().push(new BooleanWidgetScorer());


export class NumberWidgetScorer implements SparnaturalSearchWidgetScorer {

    getUri():string {
        return Config.NUMBER_PROPERTY;
    }

    score(propertyShape:string, range:string, store: StoreModel, config: ISparnaturalSpecification):number {
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
SparnaturalSearchWidgetsScorerRegistry.getInstance().getSearchWidgets().push(new NumberWidgetScorer());


export class NoWidgetScorer implements SparnaturalSearchWidgetScorer {

    getUri():string {
        return Config.NON_SELECTABLE_PROPERTY;
    }

    score(propertyShape:string, range:string, store: StoreModel, config: ISparnaturalSpecification):number {
        return -1;
    }

}
SparnaturalSearchWidgetsScorerRegistry.getInstance().getSearchWidgets().push(new NoWidgetScorer());


export class SearchRegexWidgetScorer implements SparnaturalSearchWidgetScorer {

    getUri():string {
        return Config.SEARCH_PROPERTY;
    }

    score(propertyShape:string, range:string, store: StoreModel, config: ISparnaturalSpecification):number {
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
SparnaturalSearchWidgetsScorerRegistry.getInstance().getSearchWidgets().push(new SearchRegexWidgetScorer());

export class SearchEqualWidgetScorer implements SparnaturalSearchWidgetScorer {

    getUri():string {
        return Config.STRING_EQUALS_PROPERTY;
    }

    score(propertyShape:string, range:string, store: StoreModel, config: ISparnaturalSpecification):number {
        return -1;
    }

}
SparnaturalSearchWidgetsScorerRegistry.getInstance().getSearchWidgets().push(new SearchEqualWidgetScorer());

