import ISparnaturalSpecification from "../ISparnaturalSpecification";
import ISpecificationEntity from "../ISpecificationEntity";
import JsonLdSpecificationEntity from "./JsonLdSpecificationEntity";
import ISpecificationProperty from "../ISpecificationProperty";
import JsonLdSpecificationProperty from "./JsonLdSpecificationProperty";

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

export default class JsonLdSpecificationProvider implements ISparnaturalSpecification {
  jsonSpecs: any;
  lang: any;
  constructor(specs: any, lang: any) {
    this.jsonSpecs = specs;
    this.lang = lang;
  }


  getEntity(entityUri: string): ISpecificationEntity {
    return new JsonLdSpecificationEntity(
      this.jsonSpecs,
      entityUri,
      this.lang
    );
  }

  getProperty(property: string): ISpecificationProperty {
    return new JsonLdSpecificationProperty(
      this.jsonSpecs,
      property,
      this.lang
    );
  }

  getAllSparnaturalEntities() {
    var classes = this.getEntitiesInDomainOfAnyProperty();
    // copy initial array
    var result = classes.slice();
    // now look for all classes we can reach from this class list
    for (const aClass of classes) {
      let c = new JsonLdSpecificationEntity(this.jsonSpecs, aClass, this.lang);
      var connectedClasses = c.getConnectedEntities();
      for (const aConnectedClass of connectedClasses) {
        JsonLdSpecificationProvider.pushIfNotExist(aConnectedClass, result);
      }
    }
    return result;
  };

  /*
		Reads "first-level" classes, i.e. classes that are in the domain
		of at least one property that connects them to other classes
	*/
  getEntitiesInDomainOfAnyProperty() {
    var items: any[] = [];

    for (var j in this.jsonSpecs["@graph"]) {
      var item = this.jsonSpecs["@graph"][j];
      if (JsonLdSpecificationProvider._isObjectProperty(item)) {
        let prop = new JsonLdSpecificationProperty(this.jsonSpecs, item["@id"], this.lang);
        var domains = prop.readDomain();
        for (var i in domains) {
          var aClass = domains[i];
          let c = new JsonLdSpecificationEntity(this.jsonSpecs, aClass, this.lang);
          // always exclude RemoteClasses from first list
          if (!c.isRemoteEntity()) {
            items = JsonLdSpecificationProvider.pushIfNotExist(aClass, items);
          }
        }
      }
    }

    // sort resulting array to garantee classes appear in the order
    // they are declared in the specs
    items = this._sortItemsByIndex(items);

    return items;
  };

 
  expandSparql(sparql: string) {
    for (var i in this.jsonSpecs["@graph"]) {
      var item = this.jsonSpecs["@graph"][i];

      if (item["sparqlString"] != null) {
        var re = new RegExp("<" + item["@id"] + ">", "g");
        sparql = sparql.replace(re, item["sparqlString"]);
      }
    }

    return sparql;
  };

  public static _isObjectProperty(item: { [x: string]: any }) {
    if (typeof item["@type"] === "object") {
      for (var i in item["@type"]) {
        var value = item["@type"][i];
        if (value == "ObjectProperty") {
          return true;
        }
      }

      return false;
    } else {
      return item["@type"] == "ObjectProperty";
    }
  };

  public static pushIfNotExist(item: any, items: any[]) {
    if (items.indexOf(item) < 0) {
      items.push(item);
    }

    return items;
  };

  public static getResourceById = function (id: any, jsonSpecs:any) {
    for (var i in jsonSpecs["@graph"]) {
      var anEntry = jsonSpecs["@graph"][i];
      if (anEntry["@id"] == id) {
        return anEntry;
      }
    }
    return null;
  };

  _sortItemsByIndex(items: any[]) {
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

  _expand(id: string) {
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
