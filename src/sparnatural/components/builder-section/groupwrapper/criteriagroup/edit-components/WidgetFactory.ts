import { Config } from "../../../../../ontologies/SparnaturalConfig";
import Datasources from "../../../../../ontologies/SparnaturalConfigDatasources";
import { Catalog } from "../../../../../settings/Catalog";
import HTMLComponent from "../../../../HtmlComponent";
import { SelectedVal } from "../../../../SelectedVal";
import { AbstractWidget } from "../../../../widgets/AbstractWidget";
import { AutocompleteConfiguration, AutoCompleteWidget } from "../../../../widgets/AutoCompleteWidget";
import { BooleanWidget } from "../../../../widgets/BooleanWidget";
import { ListDataProviderIfc, NoOpListDataProvider, SparqlListDataProvider, SortListDataProvider, AutocompleteDataProviderIfc, NoOpAutocompleteProvider, SparqlAutocompleDataProvider, TreeDataProviderIfc, NoOpTreeDataProvider, SparqlTreeDataProvider, SortTreeDataProvider } from "../../../../widgets/data/DataProviders";
import { ListSparqlTemplateQueryBuilder, AutocompleteSparqlTemplateQueryBuilder, TreeSparqlTemplateQueryBuilder } from "../../../../widgets/data/SparqlBuilders";
import { SparqlHandlerFactory, SparqlHandlerIfc } from "../../../../widgets/data/SparqlHandler";
import { ListConfiguration, ListWidget } from "../../../../widgets/ListWidget";
import MapWidget, { MapConfiguration } from "../../../../widgets/MapWidget";
import { NoWidget } from "../../../../widgets/NoWidget";
import { NumberConfiguration, NumberWidget } from "../../../../widgets/NumberWidget";
import { SearchConfiguration, SearchRegexWidget } from "../../../../widgets/SearchRegexWidget";
import { TimeDatePickerWidget } from "../../../../widgets/timedatepickerwidget/TimeDatePickerWidget";
import { TreeConfiguration, TreeWidget } from "../../../../widgets/treewidget/TreeWidget";

/**
 * Inversion of coupling : we don't want to depend on ISettings as this class is meant to be reused
 * elsewhere than in Sparnatural, hence we define our own interface of what we depend on.
 */
export class WidgetFactorySettings {

    language: string;
    defaultLanguage: string;
    typePredicate: string;
    maxOr: number;
    
    sparqlPrefixes?: { [key: string]: string };
    endpoints?: string[];
    catalog?: string;
    localCacheDataTtl?: number;
    
    customization? : {
      autocomplete?: Partial<AutocompleteConfiguration>,
      list?: Partial<ListConfiguration>,   
      tree?: Partial<TreeConfiguration>,
      number?: Partial<NumberConfiguration>,
      map?: Partial<MapConfiguration>,
      headers?: Map<string,string>,
      sparqlHandler?: SparqlHandlerIfc
    }
}



export class WidgetFactory {

    parentComponent:HTMLComponent;
    specProvider: any;
    settings: WidgetFactorySettings;
    catalog:Catalog;

    private sparqlFetcherFactory:SparqlHandlerFactory;
    private sparqlPostProcessor:{ semanticPostProcess: (sparql:string)=>string };

    constructor(
        parentComponent:HTMLComponent,
        specProvider: any,
        settings: WidgetFactorySettings,
        catalog:Catalog,
    ) {
        this.parentComponent = parentComponent;
        this.specProvider = specProvider;
        this.settings = settings;
        this.catalog = catalog;

        // how to fetch a SPARQL query
        this.sparqlFetcherFactory = new SparqlHandlerFactory(
            this.catalog,
            this.settings.language,
            this.settings.localCacheDataTtl,
            this.settings.customization.headers,
            this.settings.customization.sparqlHandler
        );

        // how to post-process the generated SPARQL after it is constructed and before it is send
        this.sparqlPostProcessor = { semanticPostProcess: (sparql: any) => {
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
            return this.specProvider.expandSparql(sparql, this.settings.sparqlPrefixes);
          }
        }
    }


    buildWidget(
        widgetType: string,
        startClassVal: SelectedVal,
        objectPropVal: SelectedVal,
        endClassVal: SelectedVal,
    ): AbstractWidget {
        switch (widgetType) {
          case Config.LITERAL_LIST_PROPERTY:
          case Config.LIST_PROPERTY:
            // to be passed in anonymous functions
            var theSpecProvider = this.specProvider;
    
            // determine custom datasource
            var datasource = this.specProvider.getProperty(objectPropVal.type).getDatasource();
    
            if (datasource == null) {
              // datasource still null
              // if a default endpoint was provided, provide default datasource
              if (this.settings.endpoints || this.settings.catalog) {
    
                // if there is a default label property on the end class, use it to populate the dropdown
                if(this.specProvider.getEntity(endClassVal.type).getDefaultLabelProperty()) {
                  datasource = {
                    queryTemplate: Datasources.QUERY_STRINGS_BY_QUERY_TEMPLATE.get(
                      Datasources.QUERY_LIST_LABEL_ALPHA
                    ),
                    labelProperty: this.specProvider.getEntity(endClassVal.type).getDefaultLabelProperty(),
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
                this.sparqlFetcherFactory.buildSparqlHandler(
                    datasource.sparqlEndpointUrl != null
                    ? [datasource.sparqlEndpointUrl]
                    : this.settings.endpoints
                ), 
    
                new ListSparqlTemplateQueryBuilder(
                  // sparql query (with labelPath interpreted)
                  this.#getFinalQueryString(datasource),
    
                  // sparqlPostProcessor
                  this.sparqlPostProcessor
                )
              );
            }
    
            // if we need to sort things, add an explicit wrapper around the data provider
            if(!(datasource.noSort == true)) {
              listDataProvider = new SortListDataProvider(listDataProvider);
            }
    
            // create the configuration object : use the default configuration, then the generated data provider, then overwrite with 
            // what is set in the provided configuration object for the corresponding section
            let listConfig:ListConfiguration = {
              ...ListWidget.defaultConfiguration,
              ...{
                dataProvider: listDataProvider,
                values:this.specProvider.getProperty(objectPropVal.type).getValues(),
              },          
              ...this.settings.customization?.list
            };
    
            // init data provider
            listConfig.dataProvider.init(
              this.settings.language,
              this.settings.defaultLanguage,
              this.settings.typePredicate
            );
    
            return new ListWidget(
              this.parentComponent,
              listConfig,
              startClassVal,
              objectPropVal,
              endClassVal
            );
    
          case Config.AUTOCOMPLETE_PROPERTY:
    
            // to be passed in anonymous functions
            var theSpecProvider = this.specProvider;
    
            // determine custom datasource
            var datasource = this.specProvider.getProperty(objectPropVal.type).getDatasource();
    
            if (datasource == null) {
              // datasource still null
              // if a default endpoint was provided, provide default datasource
              if (this.settings.endpoints) {
                if(this.specProvider.getEntity(endClassVal.type).isLiteralEntity()) {
                  datasource = Datasources.DATASOURCES_CONFIG.get(
                    Datasources.SEARCH_LITERAL_CONTAINS
                  );
                } else {
    
                  // if there is a default label property on the end class, use it to search in the autocomplete
                  if(this.specProvider.getEntity(endClassVal.type).getDefaultLabelProperty()) {
                    datasource = {
                      queryTemplate: Datasources.QUERY_STRINGS_BY_QUERY_TEMPLATE.get(
                        Datasources.QUERY_SEARCH_LABEL_CONTAINS
                      ),
                      labelProperty: this.specProvider.getEntity(endClassVal.type).getDefaultLabelProperty(),
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
                this.sparqlFetcherFactory.buildSparqlHandler(
                    datasource.sparqlEndpointUrl != null
                    ? [datasource.sparqlEndpointUrl]
                    : this.settings.endpoints
                ), 
    
                new AutocompleteSparqlTemplateQueryBuilder(
                  // sparql query (with labelPath interpreted)
                  this.#getFinalQueryString(datasource),
    
                  // sparqlPostProcessor
                  this.sparqlPostProcessor
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
    
            // init data provider
            autocompleteConfig.dataProvider.init(
              this.settings.language,
              this.settings.defaultLanguage,
              this.settings.typePredicate
            );
    
            return new AutoCompleteWidget(
              this.parentComponent,
              autocompleteConfig,
              startClassVal,
              objectPropVal,
              endClassVal
            );
    
            break;
          case Config.VIRTUOSO_SEARCH_PROPERTY:
          case Config.GRAPHDB_SEARCH_PROPERTY:
          case Config.STRING_EQUALS_PROPERTY:
          case Config.SEARCH_PROPERTY:
    
            let configuration:SearchConfiguration = {
              widgetType: widgetType
            }
    
            return new SearchRegexWidget(
              configuration,
              this.parentComponent,
              startClassVal,
              objectPropVal,
              endClassVal
            );
            break;
          case Config.TIME_PROPERTY_YEAR:
            return new TimeDatePickerWidget(
              this.parentComponent,
              "year",
              startClassVal,
              objectPropVal,
              endClassVal,
              this.specProvider
            );
            break;
          case Config.TIME_PROPERTY_DATE:
            return new TimeDatePickerWidget(
              this.parentComponent,
              "day",
              startClassVal,
              objectPropVal,
              endClassVal,
              this.specProvider
            );
            break;
          case Config.TIME_PROPERTY_PERIOD:
            console.warn(Config.TIME_PROPERTY_PERIOD+" is not implement yet");
            break;
          case Config.NON_SELECTABLE_PROPERTY:
            return new NoWidget(this.parentComponent);
            break;
          case Config.BOOLEAN_PROPERTY:
            return new BooleanWidget(
              this.parentComponent,
              startClassVal,
              objectPropVal,
              endClassVal
            );
            break;
          case Config.TREE_PROPERTY:
            var theSpecProvider = this.specProvider;
    
            // determine custom roots datasource
            var treeRootsDatasource =
              this.specProvider.getProperty(objectPropVal.type).getTreeRootsDatasource();
    
            if (treeRootsDatasource == null) {
              // datasource still null
              // if a default endpoint was provided, provide default datasource
              if (this.settings.endpoints) {
                treeRootsDatasource = Datasources.DATASOURCES_CONFIG.get(
                  Datasources.TREE_ROOT_SKOSTOPCONCEPT
                );
              }
            }
    
            // determine custom children datasource
            var treeChildrenDatasource =
              this.specProvider.getProperty(objectPropVal.type).getTreeChildrenDatasource();
    
            if (treeChildrenDatasource == null) {
              // datasource still null
              // if a default endpoint was provided, provide default datasource
              if (this.settings.endpoints) {
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
                this.sparqlFetcherFactory.buildSparqlHandler(
                    treeRootsDatasource.sparqlEndpointUrl != null
                    ? [treeRootsDatasource.sparqlEndpointUrl]
                    : this.settings.endpoints
                ),
    
                new TreeSparqlTemplateQueryBuilder(
                  // sparql query (with labelPath interpreted)
                  this.#getFinalQueryString(treeRootsDatasource),
                  this.#getFinalQueryString(treeChildrenDatasource),
    
                  // sparqlPostProcessor
                  this.sparqlPostProcessor
                )
    
              );
            }
    
            // create the configuration object : use the default data provider, then the default configuration, then overwrite with is set in 
            // the provided configuration object for the corresponding section
            let treeConfig:TreeConfiguration = {
              ...TreeWidget.defaultConfiguration,
              ...{
                  dataProvider: treeDataProvider,
                  maxSelectedItems: this.settings.maxOr
              },
              ...this.settings.customization?.tree
            };
    
            // wrap inside a sort data provider if needed
            if(!(treeChildrenDatasource.noSort == true)) {
              treeConfig.dataProvider = new SortTreeDataProvider(treeConfig.dataProvider);
            }
    
            // init data provider
            treeConfig.dataProvider.init(
              this.settings.language,
              this.settings.defaultLanguage,
              this.settings.typePredicate
            );
          
            return new TreeWidget(
              this.parentComponent,
              treeConfig,
              startClassVal,
              objectPropVal,
              endClassVal
            );
    
          case Config.MAP_PROPERTY:
            let mapConfig:MapConfiguration = {
              ...MapWidget.defaultConfiguration,
              ...this.settings.customization?.map
            };
    
            return new MapWidget(
              mapConfig,
              this.parentComponent,
              startClassVal,
              objectPropVal,
              endClassVal
            ).render();
          
          case Config.NUMBER_PROPERTY:
    
            // TODO : determine min and max based on datatypes
            let thisNumberConfig:NumberConfiguration = {
              min: this.specProvider.getProperty(objectPropVal.type).getMinValue(),
              max: this.specProvider.getProperty(objectPropVal.type).getMaxValue(),
            }
    
            let numberConfig:NumberConfiguration = {
              ...NumberWidget.defaultConfiguration,
              ...thisNumberConfig,
              ...this.settings.customization?.number
            };
    
            return new NumberWidget(
              this.parentComponent,
              numberConfig,
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
    #getFinalQueryString(datasource: any) {
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