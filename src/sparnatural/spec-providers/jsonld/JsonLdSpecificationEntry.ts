import Datasources from "../../ontologies/SparnaturalConfigDatasources";
import ISpecificationEntry from "../ISpecificationEntry";
import JsonLdSpecificationProvider from "./JsonLdSpecificationProvider";

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

export default class JsonLdSpecificationEntry implements ISpecificationEntry {
    id:string;
    jsonSpecs:any;
    lang:string;


    constructor(jsonSpecs:any, id:string, lang:string) {
        this.id = id;
        this.jsonSpecs = jsonSpecs;
        this.lang = lang;
    }

    getId(): string {
        return this.id;
    }

    getLabel(): string {
        var item = JsonLdSpecificationProvider.getResourceById(this.id, this.jsonSpecs);
        if (item !== null) {
            for (var i in item["label"]) {
                var aLabel = item["label"][i];
                if (aLabel["@language"] == this.lang) {
                    return aLabel["@value"];
                }
            }
        }
        return "";
    }

    getTooltip(): string {
        var item = JsonLdSpecificationProvider.getResourceById(this.id, this.jsonSpecs);
        if (item !== null) {
          for (var i in item["tooltip"]) {
            var aLabel = item["tooltip"][i];
            if (aLabel["@language"] == this.lang) {
              return aLabel["@value"];
            }
          }
        }
    
        return "";
    }

    getIcon(): string {
        if (JsonLdSpecificationProvider.getResourceById(this.id, this.jsonSpecs)["faIcon"] != null) {
            // use of fa-fw for fixed-width icons
            return (
              "<span style='font-size: 170%;' >&nbsp;<i class='" +
              JsonLdSpecificationProvider.getResourceById(this.id, this.jsonSpecs)["faIcon"] +
              " fa-fw'></i></span>"
            );
          } else if (JsonLdSpecificationProvider.getResourceById(this.id, this.jsonSpecs)["icon"] != null) {
            
            return  JsonLdSpecificationProvider.getResourceById(this.id, this.jsonSpecs)["icon"]
          } else {
            // this is ugly, just so it aligns with other entries having an icon
            return "<span style='font-size: 10%;' >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>";
          }
    }

    getHighlightedIcon(): string {
        return JsonLdSpecificationProvider.getResourceById(this.id, this.jsonSpecs)["highlightedIcon"];
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

  protected _readValue(id: any, key: string | number) {
    var theObject = JsonLdSpecificationProvider.getResourceById(id, this.jsonSpecs);

    if (theObject !== null && theObject[key]) {
      return theObject[key];
    }

    return null;
  };

  protected _sortItemsByIndex(items: any[]) {
    var me = this;
    items.sort(function (c1: any, c2: any) {
      const c1Value = me.jsonSpecs["@graph"].indexOf(JsonLdSpecificationProvider.getResourceById(c1, me.jsonSpecs));
      const c2Value = me.jsonSpecs["@graph"].indexOf(JsonLdSpecificationProvider.getResourceById(c2, me.jsonSpecs));

      let comparison = 0;
      if (c1Value > c2Value) {
        comparison = 1;
      } else if (c1Value < c2Value) {
        comparison = -1;
      }
      return comparison;
    });

    return items;
  };

  protected _expand(id: string) {
    if (id.startsWith("http")) {
      return id;
    }

    if (id.indexOf(":") >= 0) {
      let prefix = id.split(":")[0];
      if (this.jsonSpecs["@context"][prefix] == null) {
        // can't do anything
        return id;
      } else {
        return this.jsonSpecs["@context"][prefix] + id.split(":")[1];
      }
    } else {
      if (this.jsonSpecs["@context"]["@vocab"] == null) {
        // can't do anything
        return id;
      } else {
        return this.jsonSpecs["@context"]["@vocab"] + id;
      }
    }
  };

}