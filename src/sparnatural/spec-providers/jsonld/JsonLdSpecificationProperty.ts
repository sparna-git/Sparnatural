import ISpecificationProperty from "../ISpecificationProperty";
import JsonLdSpecificationEntry from "./JsonLdSpecificationEntry";
import JsonLdSpecificationProvider from "./JsonLdSpecificationProvider";

enum WIDGETSTYPES {
  "sparnatural:AutocompleteProperty",
  "sparnatural:ListProperty",
  "sparnatural:LiteralListProperty",
  "sparnatural:SearchProperty",
  "sparnatural:StringEqualsProperty",
  "sparnatural:GraphDBSearchProperty",
  "sparnatural:TimeProperty-Year",
  "sparnatural:TimeProperty-Date",
  "sparnatural:TimeProperty-Period",
  "sparnatural:NonSelectableProperty",
  "sparnatural:BooleanProperty",
  "sparnatural:TreeProperty",
  "sparnatural:MapProperty",
}

export default class JsonLdSpecificationProperty extends JsonLdSpecificationEntry implements ISpecificationProperty {
  constructor(jsonSpecs:any, id:string, lang:string) {
    if (id != null && typeof id === "object") {
      throw Error("Property expects a string id");
    }

    super(jsonSpecs, id, lang);
  }

  getPropertyType(): string|undefined {
    var objectProperty = JsonLdSpecificationProvider.getResourceById(this.id, this.jsonSpecs);
    if(objectProperty == null) return undefined;

    var superProperties =
      objectProperty["subPropertyOf"] === "object"
        ? objectProperty["subPropertyOf"]
        : new Array(objectProperty["subPropertyOf"]);

    for (var i in superProperties) {
      var value = superProperties[i];

      if (value in WIDGETSTYPES) {
        return this._expand(value);
      }
      throw Error(
        `Couldn't find object property type for ${value}. Make sure there is a Widget for this object property type!`
      );
    }
  }

  isMultilingual(): boolean {
    var item = JsonLdSpecificationProvider.getResourceById(this.id, this.jsonSpecs);
    if (item !== null) {
      return item["isMultilingual"] == true;
    }

    return false;
  }

  getBeginDateProperty(): string | null {
    return this._readValue(this.id, "beginDateProperty");
  }

  getEndDateProperty(): string | null {
    return this._readValue(this.id, "endDateProperty");
  }

  getExactDateProperty(): string | null {
    return this._readValue(this.id, "exactDateProperty");
  }

  isEnablingNegation(): boolean {
    var item = JsonLdSpecificationProvider.getResourceById(this.id, this.jsonSpecs);
    if (item !== null) {
      return item["enableNegation"] == true;
    }

    return false;
  }

  isEnablingOptional(): boolean {
    var item = JsonLdSpecificationProvider.getResourceById(this.id, this.jsonSpecs);
    if (item !== null) {
      return item["enableOptional"] == true;
    }

    return false;
  }

  getServiceEndpoint(): string | null {
    const serviceId = this._readValue(this.id,"sparqlService")
    if (serviceId) return this._readValue(serviceId,"endpoint")
    return null
  }

  isLogicallyExecutedAfter(): boolean {
    const executedAfter = this._readValue(this.id,"executedAfter");
    return executedAfter?executedAfter:false;
  }

  readDomain() {
    return this.#readDomainOrRange("domain");
  };
  
  readRange() {
    return this.#readDomainOrRange("range");
  };

  #readDomainOrRange(domainOrRange: string) : string[] {
    var result = new Array<string>();
    var item = JsonLdSpecificationProvider.getResourceById(this.id, this.jsonSpecs);
    if(item == null) return result;

    if (typeof item[domainOrRange] === "object") {
      for (var i in item[domainOrRange]["unionOf"]["@list"]) {
        var value = item[domainOrRange]["unionOf"]["@list"][i];
        result.push(value["@id"] as string);
      }
    } else if (item[domainOrRange]) {
      result.push(item[domainOrRange]);
    }

    return result;
  };

   
}