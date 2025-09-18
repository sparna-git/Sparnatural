

export interface SparnaturalQueryIfc {
  distinct?: boolean;
  variables: Array<VariableTerm | VariableExpression>;
  order?: Order;
  branches: Array<Branch>;
  limit?: number;
  // additional metadata for the query, not directly related to its structure
  metadata?:{
    // query ID
    id?: string;
    // language of the UI with which the query was generated
    lang?: string;
    // (short) labels for the query, in different languages
    // the key is the language code (e.g. "en", "de", "fr")
    label?: {
      [key: string]: string;
    },
    // (long) descriptions for the query, in different languages
    // the key is the language code (e.g. "en", "de", "fr")
    description?: {
      [key: string]: string;
    },
    // any other metadata are allowed here
    [key: string]: any;
  }
}

export interface Branch {
  line: CriteriaLine;
  children: Array<Branch> | [];
  optional?: boolean;
  notExists?: boolean;
}

export interface VariableTerm {
  termType: "Variable",
  value: string
}

export interface VariableExpression {
  expression: {
    type: "aggregate",
    aggregation: string,
    distinct: boolean,
    expression: VariableTerm,
  },
  variable : VariableTerm
}

export interface CriteriaLine {
  s: string;  
  p: string;
  o: string;
  sType: string;
  oType: string;
  values?: CriteriaValue[];
}

// TODO : parameterize ?
export interface CriteriaValue {
  // human readable string representation shown as a WidgetValue to the user
  label: string; 
  value: WidgetValue;
}

export type WidgetValue = 
  RdfTermValue |
  DateValue | 
  BooleanValue | 
  MapValue | 
  NumberValue | 
  SearchValue;

export interface RdfTermValue {
  rdfTerm: RDFTerm;
};

export interface DateValue {
  // a date string in ISO format
  // e.g. "2023-10-05T14:48:00.000Z"
  // or for just a year "2023" or "-0450" (for 450 BC)
  // null if not set
  start: string | null;
  stop: string | null;
};

export interface BooleanValue {
   boolean: boolean;
}

export interface MapValue {
  valueType: 'Polygon' | 'Rectangle';
  coordinates: LatLng[][];
}

export interface NumberValue {
  min: number | undefined;
  max: number | undefined;
}

export interface SearchValue {
  search: string;
}

export interface LatLng {
  lat: number;
  lng: number;
  alt?: number | undefined;
}

/**
 * Generic RDFTerm value structure, either an IRI or a Literal with lang or datatype
 */
export interface RDFTerm {
  type: 'literal' | 'uri' | 'bnode';
  value: string;
  "xml:lang"?: string;
  datatype?: string;
}

/**
 * @param t1 
 * @param t2 
 * @returns true if both RDF term are equal (same type, same value, same datatype, same language)
 */
export function sameTerm(t1:RDFTerm, t2:RDFTerm):boolean {
    return(
        t1 != null
        &&
        t2 != null
        &&
        t1.type == t2.type
        &&
        t1.value == t2.value
        &&
        t1.datatype == t2.datatype
        &&
        t1["xml:lang"] == t2["xml:lang"]
    );
}

export enum Order {
  ASC = "asc",
  DESC = "desc",
  NOORDER = "noord",
}

export enum AggregateFunction {
  COUNT = "count",
  MAX = "max",
  MIN = "min",
  SUM = "sum",
  GROUP_CONCAT = "group_concat",
  SAMPLE = "sample",
  AVG = "avg"
}



export enum WidgetValueType {
  RdfTermValue = "RdfTermValue",
  DateValue = "DateTimePickerValue",
  BooleanValue = "BooleanValue",
  MapValue = "MapValue",
  NumberValue = "NumberValue",
  SearchValue = "SearchValue"
}

/**
 * Returns the type name of the given WidgetValue.
 * @param value The WidgetValue to check.
 * @returns The type name as a string ("MapValue", "RdfTermValue", etc.), or undefined if unknown.
 */
export function getWidgetValueType(value: WidgetValue): WidgetValueType | undefined {
  if (typeof value === "object" && value !== null) {
    if ("rdfTerm" in value) return WidgetValueType.RdfTermValue;
    if ("valueType" in value && "coordinates" in value) return WidgetValueType.MapValue;
    if ("start" in value && "stop" in value) {
      return WidgetValueType.DateValue;
    }
    if ("boolean" in value) return WidgetValueType.BooleanValue;
    if ("min" in value && "max" in value) return WidgetValueType.NumberValue;
    if ("search" in value) return WidgetValueType.SearchValue;
  }
  return undefined;
}

/**
 * Tests the equality of two WidgetValue objects.
 * @param v1 The first WidgetValue.
 * @param v2 The second WidgetValue.
 * @returns True if both values are equal, false otherwise.
 */
export function equalsWidgetValue(v1: WidgetValue, v2: WidgetValue): boolean {
  const type1 = getWidgetValueType(v1);
  const type2 = getWidgetValueType(v2);
  if (type1 !== type2) return false;

  switch (type1) {
    case WidgetValueType.RdfTermValue:
      return sameTerm((v1 as RdfTermValue).rdfTerm, (v2 as RdfTermValue).rdfTerm);
    case WidgetValueType.DateValue: {
      const d1 = v1 as DateValue;
      const d2 = v2 as DateValue;
      return d1.start === d2.start && d1.stop === d2.stop;
    }
    case WidgetValueType.BooleanValue:
      return (v1 as BooleanValue).boolean === (v2 as BooleanValue).boolean;
    case WidgetValueType.MapValue: {
      const m1 = v1 as MapValue;
      const m2 = v2 as MapValue;
      if (m1.valueType !== m2.valueType) return false;
      if (m1.coordinates.length !== m2.coordinates.length) return false;
      for (let i = 0; i < m1.coordinates.length; i++) {
        const arr1 = m1.coordinates[i];
        const arr2 = m2.coordinates[i];
        if (arr1.length !== arr2.length) return false;
        for (let j = 0; j < arr1.length; j++) {
          const c1 = arr1[j];
          const c2 = arr2[j];
          if (
            c1.lat !== c2.lat ||
            c1.lng !== c2.lng ||
            c1.alt !== c2.alt
          ) {
            return false;
          }
        }
      }
      return true;
    }
    case WidgetValueType.NumberValue: {
      const n1 = v1 as NumberValue;
      const n2 = v2 as NumberValue;
      return n1.min === n2.min && n1.max === n2.max;
    }
    case WidgetValueType.SearchValue:
      return (v1 as SearchValue).search === (v2 as SearchValue).search;
    default:
      return false;
  }
}
