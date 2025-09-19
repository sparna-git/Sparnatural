import { DataFactory } from 'rdf-data-factory';
import { SH } from '../vocabularies/SH';
import { SKOS } from '../vocabularies/SKOS';
import { XSD } from '../vocabularies/XSD';
import { RDF } from "../vocabularies/RDF";
import { Resource } from "../Resource";
import { ShaclModel } from "./ShaclModel";
import { GEOSPARQL } from '../vocabularies/GEOSPARQL';
import { StatisticsReader } from './StatisticsReader';
import { SPARNATURAL } from '../vocabularies/SPARNATURAL';
import { NamedNode } from '@rdfjs/types';

const factory = new DataFactory();


export interface SearchWidgetIfc {
    getResource():Resource;
    score(propertyShape:Resource, range:Resource, store: ShaclModel):number;
}

export class SearchWidgetRegistry {
    static instance = new SearchWidgetRegistry();

    registry:SearchWidgetIfc[] = new Array<SearchWidgetIfc>();

    private constructor() { }

    public static getInstance(): SearchWidgetRegistry {
        if (!SearchWidgetRegistry.instance) {
            SearchWidgetRegistry.instance = new SearchWidgetRegistry();
        }

        return SearchWidgetRegistry.instance;
    }

    getRegistry(): SearchWidgetIfc[]{
        return this.registry;
    }

    findbyUri(uri:string):SearchWidgetIfc|null {
        for(let s of this.registry) {
            if(s.getResource().value == uri) {
                return s;
            }
        }
        return null;
    }

    static asSearchWidget(uri:NamedNode):SearchWidgetIfc {
        let wid = SearchWidgetRegistry.getInstance().findbyUri(uri.value);
        if (wid) {
            return wid;
        }
        return new BaseWidget(uri);
    }
}

export class BaseWidget implements SearchWidgetIfc {
    resource:Resource;

    constructor(resource:Resource) {
        this.resource = resource;
    }

    getResource():Resource {
        return this.resource;
    }

    score(propertyShape:Resource, range:Resource, store: ShaclModel):number {
        return -1;
    }

}

export class AutocompleteWidget extends BaseWidget implements SearchWidgetIfc {

    constructor() {
        super(SPARNATURAL.AUTOCOMPLETE_PROPERTY);
    }

    score(propertyShape:Resource, range:Resource, store: ShaclModel):number {
        return 10;
    }

}
SearchWidgetRegistry.getInstance().getRegistry().push(new AutocompleteWidget());

export class ListWidget extends BaseWidget implements SearchWidgetIfc {

    constructor() {
        super(SPARNATURAL.LIST_PROPERTY);
    }

    score(propertyShape:Resource, range:Resource, store: ShaclModel):number {
        // if there is a provided list of values, score higher
        if(store.hasTriple(propertyShape, SH.IN, null) ) {
            return 100;
        }
        
        // if there is a distinctObjectsCount and the distinctObjectsCount is < 500, then this will score higher
        let count = new StatisticsReader(store).getDistinctObjectsCountForShape(propertyShape);
        if(count && (count < 500)) {
            return 20;
        }
        
        // if the shape points to skos:Concept in sh:class, score higher
        if(store.hasTriple(propertyShape, SH.CLASS, SKOS.CONCEPT)) {
            return 20;
        }

        if(range && ShaclModel.couldBeSkosConcept(range, store)){
            return 20;                    
        }

        return -1;
    }

}
SearchWidgetRegistry.getInstance().getRegistry().push(new ListWidget());

export class TreeWidget extends BaseWidget implements SearchWidgetIfc {

    constructor() {
        super(SPARNATURAL.TREE_PROPERTY);
    }

    score(propertyShape:Resource, range:Resource, store: ShaclModel):number {
        return -1;
    }

}
SearchWidgetRegistry.getInstance().getRegistry().push(new TreeWidget());

export class DatePickerWidget extends BaseWidget implements SearchWidgetIfc {

    constructor() {
        super(SPARNATURAL.TIME_PROPERTY_DATE);
    }

    score(propertyShape:Resource, range:Resource, store: ShaclModel):number {

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
            hasDateOrDateTimePredicate(propertyShape)
        ){
            return 50;
        } else {
            return -1;
        }
        ;
    }

}
SearchWidgetRegistry.getInstance().getRegistry().push(new DatePickerWidget());

export class YearPickerWidget extends BaseWidget implements SearchWidgetIfc {

    constructor() {
        super(SPARNATURAL.TIME_PROPERTY_YEAR);
    }

    score(propertyShape:Resource, range:Resource, store: ShaclModel):number {
        // if the datatype is xsd:gYear
        if(
            store.hasTriple(propertyShape, SH.DATATYPE, XSD.GYEAR) 
        ) {
            return 50;
        } else {
            return -1;
        }
        ;
    }

}
SearchWidgetRegistry.getInstance().getRegistry().push(new YearPickerWidget());

export class MapWidget extends BaseWidget implements SearchWidgetIfc {

    constructor() {
        super(SPARNATURAL.MAP_PROPERTY);
    }

    score(propertyShape:Resource, range:Resource, store: ShaclModel):number {
        // if the datatype is geo:wktLiteral
        if(
            store.hasTriple(propertyShape, SH.DATATYPE, GEOSPARQL.WKT_LITERAL) 
        ) {
            return 50;
        } else {
            return -1;
        }
        ;
    }

}
SearchWidgetRegistry.getInstance().getRegistry().push(new MapWidget());

export class BooleanWidget extends BaseWidget implements SearchWidgetIfc {

    constructor() {
        super(SPARNATURAL.BOOLEAN_PROPERTY);
    }

    score(propertyShape:Resource, range:Resource, store: ShaclModel):number {
        // if the datatype is xsd:boolean
        if(
            store.hasTriple(propertyShape, SH.DATATYPE, XSD.BOOLEAN) 
        ) {
            return 50;
        } else {
            return -1;
        }
        ;
    }

}
SearchWidgetRegistry.getInstance().getRegistry().push(new BooleanWidget());


export class NumberWidget extends BaseWidget implements SearchWidgetIfc {

    constructor() {
        super(SPARNATURAL.NUMBER_PROPERTY);
    }

    score(propertyShape:Resource, range:Resource, store: ShaclModel):number {
        // if the datatype is xsd:boolean
        if(
            store.hasTriple(propertyShape, SH.DATATYPE, XSD.BYTE)
            ||
            store.hasTriple(propertyShape, SH.DATATYPE, XSD.DECIMAL)
            ||
            store.hasTriple(propertyShape, SH.DATATYPE, XSD.DOUBLE) 
            ||
            store.hasTriple(propertyShape, SH.DATATYPE, XSD.FLOAT) 
            ||
            store.hasTriple(propertyShape, SH.DATATYPE, XSD.INT)
            ||
            store.hasTriple(propertyShape, SH.DATATYPE, XSD.INTEGER)
            ||
            store.hasTriple(propertyShape, SH.DATATYPE, XSD.LONG)
            ||
            store.hasTriple(propertyShape, SH.DATATYPE, XSD.NONNEGATIVE_INTEGER)
            ||
            store.hasTriple(propertyShape, SH.DATATYPE, XSD.SHORT)
            ||
            store.hasTriple(propertyShape, SH.DATATYPE, XSD.UNSIGNED_BYTE)
            ||
            store.hasTriple(propertyShape, SH.DATATYPE, XSD.UNSIGNED_INT)
            ||
            store.hasTriple(propertyShape, SH.DATATYPE, XSD.UNSIGNED_LONG)
            ||
            store.hasTriple(propertyShape, SH.DATATYPE, XSD.UNSIGNED_SHORT)            
        ) {
            return 50;
        } else {
            return -1;
        }
        ;
    }

}
SearchWidgetRegistry.getInstance().getRegistry().push(new NumberWidget());


export class NoWidget extends BaseWidget implements SearchWidgetIfc {

    constructor() {
        super(SPARNATURAL.NON_SELECTABLE_PROPERTY);
    }

    score(propertyShape:Resource, range:Resource, store: ShaclModel):number {
        return -1;
    }

}
SearchWidgetRegistry.getInstance().getRegistry().push(new NoWidget());


export class SearchRegexWidget extends BaseWidget implements SearchWidgetIfc {

    constructor() {
        super(SPARNATURAL.SEARCH_PROPERTY);
    }

    score(propertyShape:Resource, range:Resource, store: ShaclModel):number {
        let count = new StatisticsReader(store).getDistinctObjectsCountForShape(propertyShape);
        // if the datatype is xsd:string or rdf:langString, and there is a large number, otherwise we stick with list widget
        if(
            (
                store.hasTriple(propertyShape, SH.DATATYPE, XSD.STRING) 
                ||
                store.hasTriple(propertyShape, SH.DATATYPE, RDF.LANG_STRING)
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
SearchWidgetRegistry.getInstance().getRegistry().push(new SearchRegexWidget());

export class SearchEqualWidget extends BaseWidget implements SearchWidgetIfc {

    constructor() {
        super(SPARNATURAL.STRING_EQUALS_PROPERTY);
    }

    score(propertyShape:Resource, range:Resource, store: ShaclModel):number {
        return -1;
    }

}
SearchWidgetRegistry.getInstance().getRegistry().push(new SearchEqualWidget());

