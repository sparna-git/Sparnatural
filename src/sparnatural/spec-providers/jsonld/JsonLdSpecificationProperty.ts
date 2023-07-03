import Datasources from "../../ontologies/SparnaturalConfigDatasources";
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
  "sparnatural:VirtuosoSearchProperty",
  "sparnatural:TimeProperty-Year",
  "sparnatural:TimeProperty-Date",
  "sparnatural:TimeProperty-Period",
  "sparnatural:NonSelectableProperty",
  "sparnatural:BooleanProperty",
  "sparnatural:TreeProperty",
  "sparnatural:MapProperty",
}

interface IDataSources {
  // one of queryString or queryTemplate must be set
  queryString?: string;
  queryTemplate?: any;

  labelPath?: any;
  labelProperty?: any;
  // one of childrenPath or childrenProperty must be present if queryTemplate is set, only for Trees datasource
  childrenPath?: any;
  childrenProperty?: any;
  // optional
  sparqlEndpointUrl?: any;
  // optional
  noSort?: any;
}

export default class JsonLdSpecificationProperty extends JsonLdSpecificationEntry implements ISpecificationProperty {
  constructor(jsonSpecs:any, id:string, lang:string) {
    if (id != null && typeof id === "object") {
      throw Error("Property expects a string id");
    }

    super(jsonSpecs, id, lang);
  }

  getRange(): string[] {
    return this.#readDomainOrRange("range");
  }

  getPropertyType(range:string): string|undefined {
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

  getDatasource() {
    var propertyOrClass = JsonLdSpecificationProvider.getResourceById(this.id, this.jsonSpecs);
    return this.#_buildDatasource(propertyOrClass["datasource"]);
  }

  getTreeChildrenDatasource() {
      var propertyOrClass = JsonLdSpecificationProvider.getResourceById(this.id, this.jsonSpecs);
      return this.#_buildDatasource(propertyOrClass["treeRootsDatasource"]);
  }
  getTreeRootsDatasource() {
      var propertyOrClass = JsonLdSpecificationProvider.getResourceById(this.id, this.jsonSpecs);
      return this.#_buildDatasource(propertyOrClass["treeChildrenDatasource"]);
  }

  /**
  * {
  *   queryString: "...",
  *   queryTemplate: "...",
  *   labelPath: "...",
  *   labelProperty: "...",
  *   childrenPath: "...",
  *   childrenProperty: "..."
  * }
  **/
  #_buildDatasource(datasourceObject: { [x: string]: any }|string) {
  if (datasourceObject == null) {
    return null;
  }

  var datasource: IDataSources = {};

  if (datasource && this.#isDataSourceObject(datasourceObject)) {
    // if datasource is an object...

    // Alternative 1 : read optional queryString
    datasource.queryString = datasourceObject["queryString"];

    // Alternative 2 : queryTemplate + labelPath
    var queryTemplate = datasourceObject["queryTemplate"];

    if (queryTemplate != null) {
      var expandedQueryTemplate = this._expand(queryTemplate);
      var knownQueryTemplate =
        Datasources.QUERY_STRINGS_BY_QUERY_TEMPLATE.get(
          expandedQueryTemplate
        );
      if (knownQueryTemplate != null) {
        // 2.1 It is known in default Sparnatural ontology
        datasource.queryTemplate = knownQueryTemplate;
      } else {
        // 2.2 Unknown, could be defined in the config itself
        // TODO
        console.error(
          "Reference to custom query template currently unsupported in JSON config"
        );
      }
    }

    // labelPath
    datasource.labelPath = datasourceObject["labelPath"];

    // labelProperty
    datasource.labelProperty = datasourceObject["labelProperty"];

    // childrenPath
    datasource.childrenPath = datasourceObject["childrenPath"];

    // childrenProperty
    datasource.childrenProperty = datasourceObject["childrenProperty"];

    // read optional sparqlEndpointUrl
    datasource.sparqlEndpointUrl = datasourceObject["sparqlEndpointUrl"];

    // read optional noSort
    datasource.noSort = datasourceObject["noSort"];
  } else {
    // if datasource is a URI...
    // look it up in known datasources config
    datasource = Datasources.DATASOURCES_CONFIG.get(
      this._expand(datasourceObject as string)
    );
    if (datasource == null) {
      // look it up in the config
      console.error(
        "Reference to custom datasource URI currently unsupported in JSON config"
      );
    }
  }

  return datasource;
  };

  #isDataSourceObject(val:any): val is IDataSources{
    const isObj = (
      typeof val === 'object' &&
      val !== null &&
      !Array.isArray(val) &&
      typeof val !== 'string'
    )

    return isObj && ("queryString" in val || "queryTemplate" in val)
  }

  isMultilingual(): boolean {
    var item = JsonLdSpecificationProvider.getResourceById(this.id, this.jsonSpecs);
    if (item !== null) {
      return item["isMultilingual"] == true;
    }

    return false;
  }

  omitClassCriteria(): boolean {
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