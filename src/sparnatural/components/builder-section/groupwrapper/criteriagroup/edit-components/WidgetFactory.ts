import { Config } from "../../../../../ontologies/SparnaturalConfig";
import Datasources from "../../../../../ontologies/SparnaturalConfigDatasources";
import { SparqlTreeHandler } from "../../../../widgets/treewidget/TreeHandlers";
import ISpecProvider from "../../../../../spec-providers/ISpecProvider";
import { SelectedVal } from "../../../../../generators/ISparJson";
import {
  SparqlTemplateAutocompleteHandler,
  SparqlTemplateListHandler,
} from "../../../../widgets/autocomplete/AutocompleteAndListHandlers";
import MapWidget from "../../../../widgets/MapWidget";
import { AbstractWidget } from "../../../../widgets/AbstractWidget";
import { BooleanWidget } from "../../../../widgets/BooleanWidget";
import { DatesWidget } from "../../../../widgets/DatesWidget";
import { SearchRegexWidget } from "../../../../widgets/SearchRegexWidget";
import { TimeDatePickerWidget } from "../../../../widgets/timedatepickerwidget/TimeDatePickerWidget";
import { NoWidget } from "../../../../widgets/NoWidget";
import { TreeWidget } from "../../../../widgets/treewidget/TreeWidget";
import { AutoCompleteWidget } from "../../../../widgets/autocomplete/AutoCompleteWidget";
import { LiteralListWidget } from "../../../../widgets/listwidget/LiteralListWidget";
import { ListWidget } from "../../../../widgets/listwidget/ListWidget";
import { getSettings } from "../../../../../settings/defaultSettings";
import WidgetWrapper from "./WidgetWrapper";

interface DataSource {
    queryTemplate:string;
    queryString:string;
    labelPath:string;
    labelProperty:string;
    sparqlEndpointUrl:string;
    noSort: boolean;
}

export default class WidgetFactory {
    specProvider:ISpecProvider
    widgetWrapper:WidgetWrapper
    defaultSparqlPostProcess = {
        semanticPostProcess: (sparql: any) => {
          // also add prefixes
          for (let key in getSettings().sparqlPrefixes) {
            sparql = sparql.replace(
              "SELECT ",
              "PREFIX " +
                key +
                ": <" +
                getSettings().sparqlPrefixes[key] +
                "> \nSELECT "
            );
          }
          return this.specProvider.expandSparql(sparql, getSettings().sparqlPrefixes);
        },
    }

    constructor(widgetWrapper:WidgetWrapper, specProvider:ISpecProvider) {
        this.specProvider = specProvider
        this.widgetWrapper = widgetWrapper
    }

    createWidget(widgetType:string, startClassVal:SelectedVal, objectPropVal:SelectedVal, endClassVal:SelectedVal): AbstractWidget {
        let datasource = this.#getDataSource(objectPropVal,endClassVal) as DataSource
        const language = getSettings().language;
        switch (widgetType) {
            case Config.LITERAL_LIST_PROPERTY: {
              // defaut handler to be used
              var handler = getSettings()?.list; 
              if (datasource == null) {
                // datasource still null
                // if a default endpoint was provided, provide default datasource
                if (getSettings().defaultEndpoint) {
                  datasource = Datasources.DATASOURCES_CONFIG.get(
                    Datasources.LITERAL_LIST_ALPHA
                  );
                }
              }
              if (datasource != null) {
                // if we have a datasource, possibly the default one, provide a config based
                // on a SparqlTemplate, otherwise use the handler provided
                handler = new SparqlTemplateListHandler(
                  // endpoint URL
                  datasource.sparqlEndpointUrl != null
                    ? datasource.sparqlEndpointUrl
                    : getSettings().defaultEndpoint,
                  // sparqlPostProcessor
                  this.defaultSparqlPostProcess,
                  language,
                  // sparql query (with labelPath interpreted)
                  this.getFinalQueryString(datasource)
                );
              }
              return new LiteralListWidget(
                this.widgetWrapper,
                handler,
                !(datasource.noSort == true),
                startClassVal,
                objectPropVal,
                endClassVal
              );
      
            }
            case Config.LIST_PROPERTY:
              // defaut handler to be used
              var handler = getSettings().list;
      
              if (datasource == null) {
                // datasource still null
                // if a default endpoint was provided, provide default datasource
                if (getSettings().defaultEndpoint) {
                  datasource = Datasources.DATASOURCES_CONFIG.get(
                    Datasources.LIST_URI_COUNT
                  );
                }
              }
      
              if (datasource != null) {
                // if we have a datasource, possibly the default one, provide a config based
                // on a SparqlTemplate, otherwise use the handler provided
                handler = new SparqlTemplateListHandler(
                  // endpoint URL
                  datasource.sparqlEndpointUrl != null
                    ? datasource.sparqlEndpointUrl
                    : getSettings().defaultEndpoint,
                  // sparqlPostProcessor
                  this.defaultSparqlPostProcess,
                  // language,
                  language,
                  // sparql query (with labelPath interpreted)
                  this.getFinalQueryString(datasource)
                );
              }
              return new ListWidget(
                this.widgetWrapper,
                handler,
                !(datasource.noSort == true),
                startClassVal,
                objectPropVal,
                endClassVal
              );
      
            case Config.AUTOCOMPLETE_PROPERTY:
              var handler = getSettings().autocomplete;
      
              if (datasource == null) {
                // datasource still null
                // if a default endpoint was provided, provide default datasource
                if (getSettings().defaultEndpoint) {
                  datasource = Datasources.DATASOURCES_CONFIG.get(
                    Datasources.SEARCH_URI_CONTAINS
                  );
                }
              }
      
              if (datasource != null) {
                // if we have a datasource, possibly the default one, provide a config based
                // on a SparqlTemplate, otherwise use the handler provided
                handler = new SparqlTemplateAutocompleteHandler(
                  // endpoint URL
                  datasource.sparqlEndpointUrl != null
                    ? datasource.sparqlEndpointUrl
                    : getSettings().defaultEndpoint,
      
                 this.defaultSparqlPostProcess,
                  language,
                  // sparql query (with labelPath interpreted)
                  this.getFinalQueryString(datasource)
                );
              }
              return new AutoCompleteWidget(
                this.widgetWrapper,
                handler,
                getSettings().langSearch,
                startClassVal,
                objectPropVal,
                endClassVal
              );
      
              break;
            case Config.GRAPHDB_SEARCH_PROPERTY:
            case Config.STRING_EQUALS_PROPERTY:
            case Config.SEARCH_PROPERTY:
              return new SearchRegexWidget(
                this.widgetWrapper,
                startClassVal,
                objectPropVal,
                endClassVal
              );
              break;
            case Config.TIME_PROPERTY_YEAR:
              return new TimeDatePickerWidget(
                this.widgetWrapper,
                getSettings().dates,
                "year",
                startClassVal,
                objectPropVal,
                endClassVal,
                this.specProvider
              );
              break;
            case Config.TIME_PROPERTY_DATE:
              return new TimeDatePickerWidget(
                this.widgetWrapper,
                getSettings().dates,
                "day",
                startClassVal,
                objectPropVal,
                endClassVal,
                this.specProvider
              );
              break;
            case Config.TIME_PROPERTY_PERIOD:
              return new DatesWidget(
                this.widgetWrapper,
                getSettings().dates,
                startClassVal,
                objectPropVal,
                endClassVal
              );
              break;
            case Config.NON_SELECTABLE_PROPERTY:
              return new NoWidget(this.widgetWrapper);
              break;
            case Config.BOOLEAN_PROPERTY:
              return new BooleanWidget(
                this.widgetWrapper,
                startClassVal,
                objectPropVal,
                endClassVal
              );
              break;
            case Config.TREE_PROPERTY:
      
              // determine custom roots datasource
              var treeRootsDatasource =
                this.specProvider.getTreeRootsDatasource(objectPropVal.type);
              if (treeRootsDatasource == null) {
                // try to read it on the class
                treeRootsDatasource =
                  this.specProvider.getTreeRootsDatasource(endClassVal.type);
              }
              if (treeRootsDatasource == null) {
                // datasource still null
                // if a default endpoint was provided, provide default datasource
                if (getSettings().defaultEndpoint) {
                  treeRootsDatasource = Datasources.DATASOURCES_CONFIG.get(
                    Datasources.TREE_ROOT_SKOSTOPCONCEPT
                  );
                }
              }
      
              // determine custom children datasource
              var treeChildrenDatasource =
                this.specProvider.getTreeChildrenDatasource(objectPropVal.type);
              if (treeChildrenDatasource == null) {
                // try to read it on the class
                treeChildrenDatasource =
                  this.specProvider.getTreeChildrenDatasource(endClassVal.type);
              }
              if (treeChildrenDatasource == null) {
                // datasource still null
                // if a default endpoint was provided, provide default datasource
                if (getSettings().defaultEndpoint) {
                  treeChildrenDatasource = Datasources.DATASOURCES_CONFIG.get(
                    Datasources.TREE_CHILDREN_SKOSNARROWER
                  );
                }
              }
      
              if (treeRootsDatasource != null && treeChildrenDatasource != null) {
                // if we have a datasource, possibly the default one, provide a config based
                // on a SparqlTemplate, otherwise use the handler provided
      
                let handler = new SparqlTreeHandler(
                  // endpoint URL
                  // we read it on the roots datasource
                  treeRootsDatasource.sparqlEndpointUrl != null
                    ? treeRootsDatasource.sparqlEndpointUrl
                    : getSettings().defaultEndpoint,
      
                  this.defaultSparqlPostProcess,
      
                  // IMPORTANT is this deletable?
                  language,
      
                  // sparql strings
                  this.getFinalQueryString(treeRootsDatasource),
                  this.getFinalQueryString(treeChildrenDatasource)
                );
      
                return new TreeWidget(
                  this.widgetWrapper,
                  handler,
                  getSettings(),
                  getSettings().langSearch,
                  startClassVal,
                  objectPropVal,
                  endClassVal,
                  !(treeChildrenDatasource.noSort == true)
                );
              }
      
            case Config.MAP_PROPERTY:
              return new MapWidget(
                this.widgetWrapper,
                startClassVal,
                objectPropVal,
                endClassVal
              ).render();
            default:
              throw new Error(`WidgetType for ${widgetType} not recognized`);
          }
    }
    
  /**
   * Builds the final query string from a query source, by injecting
   * labelPath/property and childrenPath/property
  **/
  getFinalQueryString(datasource: any) {
    if (datasource.queryString != null) {
      return datasource.queryString;
    } else {
      var sparql = datasource.queryTemplate;

      if (datasource.labelPath != null || datasource.labelProperty) {
        var theLabelPath = datasource.labelPath
          ? datasource.labelPath
          : "<" + datasource.labelProperty + ">";
        var reLabelPath = new RegExp("\\$labelPath", "g");
        sparql = sparql.replace(reLabelPath, theLabelPath);
      }

      if (datasource.childrenPath != null || datasource.childrenProperty) {
        var theChildrenPath = datasource.childrenPath
          ? datasource.childrenPath
          : "<" + datasource.childrenProperty + ">";
        var reChildrenPath = new RegExp("\\$childrenPath", "g");
        sparql = sparql.replace(reChildrenPath, theChildrenPath);
      }

      return sparql;
    }
  }

  #getDataSource(objectPropVal:SelectedVal,endClassVal:SelectedVal){
    let datasource = this.specProvider.getDatasource(objectPropVal.type);
    if(!datasource)
    datasource = this.specProvider.getDatasource(endClassVal.type)
    return datasource
  }
}