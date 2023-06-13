import Datasources from "../../ontologies/SparnaturalConfigDatasources";
import ISpecificationEntry from "../ISpecificationEntry";
import JsonLdSpecificationProvider from "./JsonLdSpecificationProvider";

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

    getColor(): string|null {
      var item = JsonLdSpecificationProvider.getResourceById(this.id, this.jsonSpecs);
      if (item !== null) {
        return item["color"];
      }
  
      return null;
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