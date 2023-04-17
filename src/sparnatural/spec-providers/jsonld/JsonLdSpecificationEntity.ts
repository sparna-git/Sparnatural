import { Config } from "../../ontologies/SparnaturalConfig";
import ISpecificationEntity from "../ISpecificationEntity";
import JsonLdSpecificationEntry from "./JsonLdSpecificationEntry";

export default class JsonLdSpecificationEntity extends JsonLdSpecificationEntry implements ISpecificationEntity {
    constructor(jsonSpecs:any, id:string, lang:string) {
        super(jsonSpecs, id, lang);
    }


    getConnectedEntities(): string[] {
        var items: any[] = [];

        for (var j in this.jsonSpecs["@graph"]) {
            var item = this.jsonSpecs["@graph"][j];
            if (this._isObjectProperty(item)) {
                if (this._inDomainOf(item, this.id)) {
                var values = this._readRange(item);
                for (var i in values) {
                    items = this._pushIfNotExist(values[i], items);
                }
                }
            }
        }

        // sort resulting array to garantee classes appear in the order
        // they are declared in the specs
        items = this._sortItemsByIndex(items);

        return items;
    }

    hasConnectedEntities(): boolean {
        return this.getConnectedEntities().length > 0;
    }

    getConnectingProperties(range: string): string[] {
        var items: any[] = [];

        for (var i in this.jsonSpecs["@graph"]) {
          var item = this.jsonSpecs["@graph"][i];
          if (this._isObjectProperty(item)) {
            if (
              (this._inDomainOf(item, this.id)) &&
              (range === null || this._inRangeOf(item, range))
            ) {
              items = this._pushIfNotExist(item["@id"], items);
            }
          }
        }
    
        return items;
    }

    isLiteralEntity(): boolean {
        var classEntity = this._getResourceById(this.id);
    
        if (classEntity && classEntity["subClassOf"]) {
          var superClasses =
            classEntity["subClassOf"] === "object"
              ? classEntity["subClassOf"]
              : new Array(classEntity["subClassOf"]);
          for (var i in superClasses) {
            var value = superClasses[i];
            if (this._expand(value) == Config.RDFS_LITERAL) {
              return true;
            }
          }
        }
    
        return false;
    }

    isRemoteEntity(): boolean {
        var classEntity = this._getResourceById(this.id);
    
        if (classEntity["subClassOf"]) {
          var superClasses =
            classEntity["subClassOf"] === "object"
              ? classEntity["subClassOf"]
              : new Array(classEntity["subClassOf"]);
          for (var i in superClasses) {
            var value = superClasses[i];
            if (this._expand(value) == Config.NOT_INSTANTIATED_CLASS) {
              return true;
            }
          }
        }
    
        return false;
    }

    getDefaultLabelProperty(): string | null {
        return this._readValue(this.id, "defaultLabelProperty");
    }

    _inDomainOf(objectProperty: {}, classId: string) {
        return this._readDomain(objectProperty).indexOf(classId) >= 0;
      };
    
      _inRangeOf(objectProperty: {}, classId: string) {
        return this._readRange(objectProperty).indexOf(classId) >= 0;
      };
    
      _readDomain(objectProperty: {}) {
        return this._readDomainOrRange(objectProperty, "domain");
      };
    
      _readRange(objectProperty: {}) {
        return this._readDomainOrRange(objectProperty, "range");
      };
    
      _readDomainOrRange(
        objectProperty: any,
        domainOrRange: string
      ) : string[] {
        var result = new Array<string>();
        if (typeof objectProperty[domainOrRange] === "object") {
          for (var i in objectProperty[domainOrRange]["unionOf"]["@list"]) {
            var value = objectProperty[domainOrRange]["unionOf"]["@list"][i];
            result.push(value["@id"] as string);
          }
        } else if (objectProperty[domainOrRange]) {
          result.push(objectProperty[domainOrRange]);
        }
    
        return result;
      };

    
}