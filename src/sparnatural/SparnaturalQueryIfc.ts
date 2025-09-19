

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
  children?: Array<Branch> | [];
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
  values?: LabelledCriteria<Criteria>[];
}

// TODO : parameterize ?
export interface LabelledCriteria<T extends Criteria> {
  // human readable string representation shown as a WidgetValue to the user
  label: string; 
  value: T;
}

export type Criteria = 
  RdfTermCriteria |
  DateCriteria | 
  BooleanCriteria | 
  MapCriteria | 
  NumberCriteria | 
  SearchCriteria;

export interface RdfTermCriteria {
  rdfTerm: RDFTerm;
};

export interface DateCriteria {
  // a date string in ISO format
  // e.g. "2023-10-05T14:48:00.000Z"
  // or for just a year "2023" or "-0450" (for 450 BC)
  // undefined if not set
  start?: string | undefined;
  stop?: string | undefined;
};

export interface BooleanCriteria {
   boolean: boolean;
}

export interface MapCriteria {
  coordType: 'Polygon' | 'Rectangle';
  coordinates: LatLng[][];
}

export interface NumberCriteria {
  // either min or max need to be defined
  min?: number | undefined;
  max?: number | undefined;
}

export interface SearchCriteria {
  // this is interpreted as a regexp when using plain SPARQL queries
  // or as a fulltext search string when using a triplestore with fulltext search capabilities
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
  // value is either the IRI string, the literal value, or the bnode identifier
  value: string;
  "xml:lang"?: string;
  datatype?: string;
}


//////////////////////////////////////////////////////////////////////////////////////////////



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



export enum CriteriaType {
  RdfTermCriteria = "RdfTermCriteria",
  DateCriteria = "DateCriteria",
  BooleanCriteria = "BooleanCriteria",
  MapCriteria = "mapCriteria",
  NumberCriteria = "NumberCriteria",
  SearchCriteria = "SearchCriteria"
}

/**
 * Returns the type name of the given WidgetValue.
 * @param value The WidgetValue to check.
 * @returns The type name as a string ("MapValue", "RdfTermValue", etc.), or undefined if unknown.
 */
export function getCriteriaType(value: Criteria): CriteriaType | undefined {
  if (typeof value === "object" && value !== null) {
    if ("rdfTerm" in value) return CriteriaType.RdfTermCriteria;
    if ("coordinates" in value) return CriteriaType.MapCriteria;
    if ("start" in value || "stop" in value) return CriteriaType.DateCriteria;
    if ("boolean" in value) return CriteriaType.BooleanCriteria;
    if ("min" in value || "max" in value) return CriteriaType.NumberCriteria;
    if ("search" in value) return CriteriaType.SearchCriteria;
  }
  return undefined;
}

/**
 * Tests the equality of two WidgetValue objects.
 * @param v1 The first WidgetValue.
 * @param v2 The second WidgetValue.
 * @returns True if both values are equal, false otherwise.
 */
export function equalsCriteria(v1: Criteria, v2: Criteria): boolean {
  const type1 = getCriteriaType(v1);
  const type2 = getCriteriaType(v2);
  if (type1 !== type2) return false;

  switch (type1) {
    case CriteriaType.RdfTermCriteria:
      return sameTerm((v1 as RdfTermCriteria).rdfTerm, (v2 as RdfTermCriteria).rdfTerm);
    case CriteriaType.DateCriteria: {
      const d1 = v1 as DateCriteria;
      const d2 = v2 as DateCriteria;
      return d1.start === d2.start && d1.stop === d2.stop;
    }
    case CriteriaType.BooleanCriteria:
      return (v1 as BooleanCriteria).boolean === (v2 as BooleanCriteria).boolean;
    case CriteriaType.MapCriteria: {
      const m1 = v1 as MapCriteria;
      const m2 = v2 as MapCriteria;
      if (m1.coordType !== m2.coordType) return false;
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
    case CriteriaType.NumberCriteria: {
      const n1 = v1 as NumberCriteria;
      const n2 = v2 as NumberCriteria;
      return n1.min === n2.min && n1.max === n2.max;
    }
    case CriteriaType.SearchCriteria:
      return (v1 as SearchCriteria).search === (v2 as SearchCriteria).search;
    default:
      return false;
  }
}
