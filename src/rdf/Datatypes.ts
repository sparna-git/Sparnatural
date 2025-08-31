import { DataFactory, NamedNode } from 'rdf-data-factory';
import { XSD } from './vocabularies/XSD';


const factory = new DataFactory();

/**
 * Interface for datatype definitions
 */
export interface DatatypeIfc {
    getUri():NamedNode;
    isNumberDatatype():boolean;
    isDateDatatype():boolean;
    minInclusive?:number;
    maxInclusive?:number;
}


export class DatatypeImpl implements DatatypeIfc {
    uri:NamedNode;
    minInclusive?:number;
    maxInclusive?:number;

    constructor(uri:NamedNode, minInclusive?:number, maxInclusive?:number) {
        this.uri = uri;
        this.minInclusive = minInclusive;
        this.maxInclusive = maxInclusive;
    }

    getUri():NamedNode {
        return this.uri;
    }

    isNumberDatatype():boolean {
        return NUMBER_DATATYPES.some(dt => dt.equals(this.uri));
    }

    isDateDatatype():boolean {
        return DATE_DATATYPES.some(dt => dt.equals(this.uri));
    }
}

export class DatatypeRegistry {
    static instance = new DatatypeRegistry();

    registry:DatatypeIfc[] = new Array<DatatypeIfc>();

    private constructor() { }

    public static getInstance(): DatatypeRegistry {
        if (!DatatypeRegistry.instance) {
            DatatypeRegistry.instance = new DatatypeRegistry();
        }

        return DatatypeRegistry.instance;
    }

    getRegistry(): DatatypeIfc[]{
        return this.registry;
    }

    findbyUri(uri:string):DatatypeIfc|null {
        for(let dt of this.registry) {
            if(dt.getUri().value == uri) {
                return dt;
            }
        }
        return null;
    }

    static asDatatype(uri:NamedNode):DatatypeIfc {
        let dt = DatatypeRegistry.getInstance().findbyUri(uri.value);
        if (dt) {
            return dt;
        }
        return new DatatypeImpl(uri);
    }
}

let registry = DatatypeRegistry.getInstance().getRegistry();

registry.push(new DatatypeImpl(XSD.INTEGER));
registry.push(new DatatypeImpl(XSD.SHORT, -32768, 32767));
registry.push(new DatatypeImpl(XSD.BYTE, -128, 127));
registry.push(new DatatypeImpl(XSD.NONNEGATIVE_INTEGER, 0));
registry.push(new DatatypeImpl(XSD.LONG, -9223372036854775808, 9223372036854775807));
registry.push(new DatatypeImpl(XSD.INT, -2147483648, 2147483647));
registry.push(new DatatypeImpl(XSD.FLOAT));
registry.push(new DatatypeImpl(XSD.DOUBLE));
registry.push(new DatatypeImpl(XSD.DECIMAL));
registry.push(new DatatypeImpl(XSD.UNSIGNED_SHORT, 0, 65535));
registry.push(new DatatypeImpl(XSD.UNSIGNED_BYTE, 0, 255));
registry.push(new DatatypeImpl(XSD.UNSIGNED_INT, 0, 4294967295));
registry.push(new DatatypeImpl(XSD.UNSIGNED_LONG, 0, 18446744073709551615));

export const NUMBER_DATATYPES:NamedNode[] = [
    XSD.BYTE,
    XSD.DECIMAL,
    XSD.DOUBLE,
    XSD.FLOAT,
    XSD.INT,
    XSD.INTEGER,
    XSD.LONG,
    XSD.NONNEGATIVE_INTEGER,
    XSD.SHORT,
    XSD.UNSIGNED_BYTE,
    XSD.UNSIGNED_INT,
    XSD.UNSIGNED_LONG,
    XSD.UNSIGNED_SHORT  
]

export const DATE_DATATYPES:NamedNode[] = [
    XSD.DATE,
    XSD.DATE_TIME,
    XSD.GYEAR 
]