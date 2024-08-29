import { DagIfc, Dag } from "../../dag/Dag";
import { Config } from "../../ontologies/SparnaturalConfig";
import ISpecificationEntity from "../ISpecificationEntity";
import JsonLdSpecificationEntry from "./JsonLdSpecificationEntry";
import JsonLdSpecificationProperty from "./JsonLdSpecificationProperty";
import JsonLdSpecificationProvider from "./JsonLdSpecificationProvider";
import ISpecificationProperty from "../ISpecificationProperty";

export default class JsonLdSpecificationEntity extends JsonLdSpecificationEntry implements ISpecificationEntity {
    constructor(jsonSpecs:any, provider:JsonLdSpecificationProvider, id:string, lang:string) {
        super(jsonSpecs, provider, id, lang);
    }


    getConnectedEntities(): string[] {
        var items: any[] = [];

        for (var j in this.jsonSpecs["@graph"]) {
            var item = this.jsonSpecs["@graph"][j];
            if (JsonLdSpecificationProvider._isObjectProperty(item)) {
                let prop:JsonLdSpecificationProperty = new JsonLdSpecificationProperty(this.jsonSpecs, this.provider, item["@id"], this.lang);
                if (prop.readDomain().indexOf(this.id) >= 0) {
                  var values = prop.getRange();
                  for (var i in values) {
                      items = JsonLdSpecificationProvider.pushIfNotExist(values[i], items);
                  }
                }
            }
        }

        // sort resulting array to garantee classes appear in the order
        // they are declared in the specs
        items = this._sortItemsByIndex(items);

        return items;
    }

    getConnectedEntitiesTree(): DagIfc<ISpecificationEntity> {
        return new Dag<ISpecificationEntity>();
    }

    hasConnectedEntities(): boolean {
        return this.getConnectedEntities().length > 0;
    }

    getConnectingProperties(range: string): string[] {
        var items: any[] = [];

        for (var i in this.jsonSpecs["@graph"]) {
          var item = this.jsonSpecs["@graph"][i];
          if (JsonLdSpecificationProvider._isObjectProperty(item)) {
            let prop:JsonLdSpecificationProperty = new JsonLdSpecificationProperty(this.jsonSpecs, this.provider, item["@id"], this.lang);
            if (
              (prop.readDomain().indexOf(this.id) >= 0) &&
              (range === null || prop.getRange().indexOf(range) >= 0)
            ) {
              items = JsonLdSpecificationProvider.pushIfNotExist(item["@id"], items);
            }
          }
        }

        return items;
    }

    
    /**
     * Return the tree of properties connecting this entity to the specified range entity
     * @param range The URI of the selected target entity
     * @returns 
     */
    getConnectingPropertiesTree(range: string): DagIfc<ISpecificationProperty> {
      // 1. get list of properties
      let entities:ISpecificationProperty[] = this.getConnectingProperties(range).map(s => this.provider.getProperty(s)) as ISpecificationProperty[];

      // 2. turn it into a flat tree
      let dag:Dag<ISpecificationProperty> = new Dag<ISpecificationProperty>();
      dag.initFlatTreeFromFlatList(entities);
      return dag;
    }

    isLiteralEntity(): boolean {
        var classEntity = JsonLdSpecificationProvider.getResourceById(this.id, this.jsonSpecs);
        if(classEntity == null) return false;
    
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

    hasTypeCriteria(): boolean {
      var classEntity = JsonLdSpecificationProvider.getResourceById(this.id, this.jsonSpecs);
      if(classEntity == null) return false;

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

    

    getDefaultLabelProperty(): string | undefined {
      return this._readValue(this.id, "defaultLabelProperty");
  }
      
}