import { Config } from "../../../../../ontologies/SparnaturalConfig";
import Datasources from "../../../../../ontologies/SparnaturalConfigDatasources";
import ISparnaturalSpecification from "../../../../../spec-providers/ISparnaturalSpecification";
import HTMLComponent from "../../../../HtmlComponent";
import SparnaturalComponent from "../../../../SparnaturalComponent";
import { AbstractWidget } from "../../../../widgets/AbstractWidget";
import { AutocompleteConfiguration, AutoCompleteWidget } from "../../../../widgets/AutoCompleteWidget";
import { BooleanWidget } from "../../../../widgets/BooleanWidget";
import { ListDataProviderIfc, NoOpListDataProvider, SparqlListDataProvider, AutocompleteDataProviderIfc, NoOpAutocompleteProvider, SparqlAutocompleDataProvider, TreeDataProviderIfc, NoOpTreeDataProvider, SparqlTreeDataProvider } from "../../../../widgets/data/DataProviders";
import { ListSparqlTemplateQueryBuilder, AutocompleteSparqlTemplateQueryBuilder, TreeSparqlTemplateQueryBuilder } from "../../../../widgets/data/SparqlBuilders";
import { SparqlFetcherFactory } from "../../../../widgets/data/UrlFetcher";
import { ListConfiguration, ListWidget } from "../../../../widgets/ListWidget";
import MapWidget, { MapConfiguration } from "../../../../widgets/MapWidget";
import { NoWidget } from "../../../../widgets/NoWidget";
import { NumberConfiguration, NumberWidget } from "../../../../widgets/NumberWidget";
import { SearchRegexWidget } from "../../../../widgets/SearchRegexWidget";
import { TimeDatePickerWidget } from "../../../../widgets/timedatepickerwidget/TimeDatePickerWidget";
import { TreeConfiguration, TreeWidget } from "../../../../widgets/treewidget/TreeWidget";

export class WidgetFactory {

    private specProvider:ISparnaturalSpecification;
    private parentComponent:HTMLComponent;

    
    #createWidgetComponent(
        widgetType: string,
        objectPropertyId: any,
        endClassType: any
      ): AbstractWidget {
        switch (widgetType) {
          case Config.LITERAL_LIST_PROPERTY:
          case Config.LIST_PROPERTY:
            // to be passed in anonymous functions
            var theSpecProvider = this.specProvider;
    
            // determine custom datasource
            var datasource = this.specProvider.getProperty(objectPropertyId).getDatasource();
    
            if (datasource == null) {
              // datasource still null
              // if a default endpoint was provided, provide default datasource
              if (this.settings.defaultEndpoint || this.settings.catalog) {
    
                // if there is a default label property on the end class, use it to populate the dropdown
                if(this.specProvider.getEntity(endClassType).getDefaultLabelProperty()) {
                  datasource = {
                    queryTemplate: Datasources.QUERY_STRINGS_BY_QUERY_TEMPLATE.get(
                      Datasources.QUERY_LIST_LABEL_ALPHA
                    ),
                    labelProperty: this.specProvider.getEntity(endClassType).getDefaultLabelProperty(),
                  }
                } else {
                  // that datasource can work indifferently with URIs or Literals
                  datasource = Datasources.DATASOURCES_CONFIG.get(
                    // better use alphabetical ordering first since URIs will be segregated in the "h" letter and not mixed
                    // Datasources.LIST_URI_OR_LITERAL_ALPHA_WITH_COUNT
                    Datasources.LIST_URI_OR_LITERAL_ALPHA
                  );
                }
    
              }
            }
    
            let listDataProvider:ListDataProviderIfc = new NoOpListDataProvider();
            if (datasource != null) {
              // if we have a datasource, possibly the default one, provide a config based
              // on a SparqlTemplate, otherwise use the handler provided
              listDataProvider = new SparqlListDataProvider(
    
                // endpoint URL
                new SparqlFetcherFactory(
                  datasource.sparqlEndpointUrl != null
                  ? datasource.sparqlEndpointUrl
                  : this.#readDefaultEndpoint(this.settings.defaultEndpoint),
                  (this.getRootComponent() as SparnaturalComponent).catalog,
                  this.settings
                ),            
    
                new ListSparqlTemplateQueryBuilder(
                  // sparql query (with labelPath interpreted)
                  this.getFinalQueryString(datasource),
    
                  // sparqlPostProcessor
                  {
                    semanticPostProcess: (sparql: any) => {
                      // also add prefixes
                      for (let key in this.settings.sparqlPrefixes) {
                        sparql = sparql.replace(
                          "SELECT ",
                          "PREFIX " +
                            key +
                            ": <" +
                            this.settings.sparqlPrefixes[key] +
                            "> \nSELECT "
                        );
                      }
                      return theSpecProvider.expandSparql(sparql, this.settings.sparqlPrefixes);
                    },
                  }
                )
              );
            }
    
            // create the configuration object : use the default configuration, then the generated data provider, then overwrite with 
            // what is set in the provided configuration object for the corresponding section
            let listConfig:ListConfiguration = {
              ...ListWidget.defaultConfiguration,
              ...{
                dataProvider: listDataProvider,
                values:this.specProvider.getProperty(objectPropertyId).getValues(),
              },          
              ...this.settings.customization?.list
            };
    
            return new ListWidget(
              this.parentComponent,
              listConfig,
              !(datasource.noSort == true),
              this.startClassVal,
              this.objectPropVal,
              this.endClassVal
            );
    
          case Config.AUTOCOMPLETE_PROPERTY:
    
            // to be passed in anonymous functions
            var theSpecProvider = this.specProvider;
    
            // determine custom datasource
            var datasource = this.specProvider.getProperty(objectPropertyId).getDatasource();
    
            if (datasource == null) {
              // datasource still null
              // if a default endpoint was provided, provide default datasource
              if (this.settings.defaultEndpoint) {
                if(this.specProvider.getEntity(endClassType).isLiteralEntity()) {
                  datasource = Datasources.DATASOURCES_CONFIG.get(
                    Datasources.SEARCH_LITERAL_CONTAINS
                  );
                } else {
    
                  // if there is a default label property on the end class, use it to search in the autocomplete
                  if(this.specProvider.getEntity(endClassType).getDefaultLabelProperty()) {
                    datasource = {
                      queryTemplate: Datasources.QUERY_STRINGS_BY_QUERY_TEMPLATE.get(
                        Datasources.QUERY_SEARCH_LABEL_CONTAINS
                      ),
                      labelProperty: this.specProvider.getEntity(endClassType).getDefaultLabelProperty(),
                    }
                  } else {
                    // otherwise just search on the URI 
                    datasource = Datasources.DATASOURCES_CONFIG.get(
                      Datasources.SEARCH_URI_CONTAINS
                    );
                  }              
                }
              }
            }
    
            let autocompleteDataProvider:AutocompleteDataProviderIfc = new NoOpAutocompleteProvider();
            if (datasource != null) {
              // build a SPARQL data provider function using the SPARQL query of the datasource
              autocompleteDataProvider = new SparqlAutocompleDataProvider(
    
                // endpoint URL
                new SparqlFetcherFactory(
                  datasource.sparqlEndpointUrl != null
                  ? datasource.sparqlEndpointUrl
                  : this.#readDefaultEndpoint(this.settings.defaultEndpoint),
                  (this.getRootComponent() as SparnaturalComponent).catalog,
                  this.settings
                ), 
    
                new AutocompleteSparqlTemplateQueryBuilder(
                  // sparql query (with labelPath interpreted)
                  this.getFinalQueryString(datasource),
    
                  // sparqlPostProcessor
                  {
                    semanticPostProcess: (sparql: any) => {
                      // also add prefixes
                      for (let key in this.settings.sparqlPrefixes) {
                        sparql = sparql.replace(
                          "SELECT ",
                          "PREFIX " +
                            key +
                            ": <" +
                            this.settings.sparqlPrefixes[key] +
                            "> \nSELECT "
                        );
                      }
                      return theSpecProvider.expandSparql(sparql, this.settings.sparqlPrefixes);
                    },
                  }
                )
              );
            }
    
            // create the configuration object : use the default data provider, then the default configuration, then overwrite with is set in 
            // the provided configuration object for the corresponding section
            let autocompleteConfig:AutocompleteConfiguration = {
              ...AutoCompleteWidget.defaultConfiguration,
              ...{dataProvider: autocompleteDataProvider},
              ...this.settings.customization?.autocomplete
            };
    
            return new AutoCompleteWidget(
              this.parentComponent,
              autocompleteConfig,
              this.startClassVal,
              this.objectPropVal,
              this.endClassVal
            );
    
            break;
          case Config.VIRTUOSO_SEARCH_PROPERTY:
          case Config.GRAPHDB_SEARCH_PROPERTY:
          case Config.STRING_EQUALS_PROPERTY:
          case Config.SEARCH_PROPERTY:
            return new SearchRegexWidget(
              this.parentComponent,
              this.startClassVal,
              this.objectPropVal,
              this.endClassVal
            );
            break;
          case Config.TIME_PROPERTY_YEAR:
            return new TimeDatePickerWidget(
              this,
              "year",
              this.startClassVal,
              this.objectPropVal,
              this.endClassVal,
              this.specProvider
            );
            break;
          case Config.TIME_PROPERTY_DATE:
            return new TimeDatePickerWidget(
              this,
              "day",
              this.startClassVal,
              this.objectPropVal,
              this.endClassVal,
              this.specProvider
            );
            break;
          case Config.TIME_PROPERTY_PERIOD:
            console.warn(Config.TIME_PROPERTY_PERIOD+" is not implement yet");
            break;
          case Config.NON_SELECTABLE_PROPERTY:
            return new NoWidget(this);
            break;
          case Config.BOOLEAN_PROPERTY:
            return new BooleanWidget(
              this,
              this.startClassVal,
              this.objectPropVal,
              this.endClassVal
            );
            break;
          case Config.TREE_PROPERTY:
            var theSpecProvider = this.specProvider;
    
            // determine custom roots datasource
            var treeRootsDatasource =
              this.specProvider.getProperty(objectPropertyId).getTreeRootsDatasource();
    
            if (treeRootsDatasource == null) {
              // datasource still null
              // if a default endpoint was provided, provide default datasource
              if (this.settings.defaultEndpoint) {
                treeRootsDatasource = Datasources.DATASOURCES_CONFIG.get(
                  Datasources.TREE_ROOT_SKOSTOPCONCEPT
                );
              }
            }
    
            // determine custom children datasource
            var treeChildrenDatasource =
              this.specProvider.getProperty(objectPropertyId).getTreeChildrenDatasource();
    
            if (treeChildrenDatasource == null) {
              // datasource still null
              // if a default endpoint was provided, provide default datasource
              if (this.settings.defaultEndpoint) {
                treeChildrenDatasource = Datasources.DATASOURCES_CONFIG.get(
                  Datasources.TREE_CHILDREN_SKOSNARROWER
                );
              }
            }
    
            let treeDataProvider:TreeDataProviderIfc = new NoOpTreeDataProvider();
    
            if (treeRootsDatasource != null && treeChildrenDatasource != null) {
              // if we have a datasource, possibly the default one, provide a config based
              // on a SparqlTemplate, otherwise use the handler provided
    
              treeDataProvider = new SparqlTreeDataProvider(
    
                // endpoint URL
                // we read it on the roots datasource
                new SparqlFetcherFactory(
                  treeRootsDatasource.sparqlEndpointUrl != null
                  ? treeRootsDatasource.sparqlEndpointUrl
                  : this.#readDefaultEndpoint(this.settings.defaultEndpoint),
                  (this.getRootComponent() as SparnaturalComponent).catalog,
                  this.settings
                ),
    
                new TreeSparqlTemplateQueryBuilder(
                  // sparql query (with labelPath interpreted)
                  this.getFinalQueryString(treeRootsDatasource),
                  this.getFinalQueryString(treeChildrenDatasource),
    
                  // sparqlPostProcessor
                  {
                    semanticPostProcess: (sparql: any) => {
                      // also add prefixes
                      for (let key in this.settings.sparqlPrefixes) {
                        sparql = sparql.replace(
                          "SELECT ",
                          "PREFIX " +
                            key +
                            ": <" +
                            this.settings.sparqlPrefixes[key] +
                            "> \nSELECT "
                        );
                      }
                      return theSpecProvider.expandSparql(sparql, this.settings.sparqlPrefixes);
                    },
                  }
                )
    
              );
            }
    
            // create the configuration object : use the default data provider, then the default configuration, then overwrite with is set in 
            // the provided configuration object for the corresponding section
            let treeConfig:TreeConfiguration = {
              ...TreeWidget.defaultConfiguration,
              ...{dataProvider: treeDataProvider},
              ...this.settings.customization?.tree
            };
          
            return new TreeWidget(
              this,
              treeConfig,
              this.startClassVal,
              this.objectPropVal,
              this.endClassVal,
              !(treeChildrenDatasource.noSort == true)
            );
    
          case Config.MAP_PROPERTY:
            let mapConfig:MapConfiguration = {
              ...MapWidget.defaultConfiguration,
              ...this.settings.customization?.map
            };
    
            return new MapWidget(
              mapConfig,
              this,
              this.startClassVal,
              this.objectPropVal,
              this.endClassVal
            ).render();
          
          case Config.NUMBER_PROPERTY:
    
            // TODO : determine min and max based on datatypes
            let thisNumberConfig:NumberConfiguration = {
              min: this.specProvider.getProperty(objectPropertyId).getMinValue(),
              max: this.specProvider.getProperty(objectPropertyId).getMaxValue(),
            }
    
            let numberConfig:NumberConfiguration = {
              ...NumberWidget.defaultConfiguration,
              ...thisNumberConfig,
              ...this.settings.customization?.number
            };
    
            return new NumberWidget(
              this,
              numberConfig,
              this.startClassVal,
              this.objectPropVal,
              this.endClassVal
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
      
}

