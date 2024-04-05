import ISettings from "../../../../../../sparnatural/settings/ISettings";
import { Config } from "../../../../../ontologies/SparnaturalConfig";
import Datasources from "../../../../../ontologies/SparnaturalConfigDatasources";
import ISparnaturalSpecification from "../../../../../spec-providers/ISparnaturalSpecification";
import HTMLComponent from "../../../../HtmlComponent";
import { SelectedVal } from "../../../../SelectedVal";
import EditComponents from "./EditComponents";
import MapWidget, { MapConfiguration } from "../../../../widgets/MapWidget";
import { AbstractWidget } from "../../../../widgets/AbstractWidget";
import { BooleanWidget } from "../../../../widgets/BooleanWidget";
import { DatesWidget } from "../../../../widgets/DatesWidget";
import { SearchRegexWidget } from "../../../../widgets/SearchRegexWidget";
import { TimeDatePickerWidget } from "../../../../widgets/timedatepickerwidget/TimeDatePickerWidget";
import { NoWidget } from "../../../../widgets/NoWidget";
import { TreeConfiguration, TreeWidget } from "../../../../widgets/treewidget/TreeWidget";
import { AutoCompleteWidget, AutocompleteConfiguration } from "../../../../widgets/AutoCompleteWidget";
import { getSettings } from "../../../../../settings/defaultSettings";
import { AutocompleteSparqlTemplateQueryBuilder, ListSparqlTemplateQueryBuilder, TreeSparqlTemplateQueryBuilder } from "../../../../widgets/data/SparqlBuilders";
import { AutocompleteDataProviderIfc, ListDataProviderIfc, NoOpAutocompleteProvider, NoOpListDataProvider, NoOpTreeDataProvider, SparqlAutocompleDataProvider, SparqlListDataProvider, SparqlLiteralListDataProvider, SparqlTreeDataProvider, TreeDataProviderIfc } from "../../../../widgets/data/DataProviders";
import { ListConfiguration, ListWidget } from "../../../../widgets/ListWidget";
import { SparqlFetcherFactory } from "../../../../widgets/data/UrlFetcher";
import SparnaturalComponent from "../../../../SparnaturalComponent";
import { I18n } from "../../../../../settings/I18n";
import { AutocompleteWidget } from "../../../../../spec-providers/shacl/SHACLSearchWidgets";
import { NumberConfiguration, NumberWidget } from "../../../../widgets/NumberWidget";


/**
 *  creates the corresponding widget
 **/
class WidgetWrapper extends HTMLComponent {
  settings: ISettings = getSettings()
  widgetType?: string;
  widgetComponent: AbstractWidget;
  specProvider: ISparnaturalSpecification;
  objectPropVal: SelectedVal;
  startClassVal: SelectedVal;
  endClassVal: SelectedVal;
  add_or: boolean = true;

  constructor(
    ParentComponent: EditComponents,
    specProvider: ISparnaturalSpecification,
    startClassVal: SelectedVal,
    objectPropVal: SelectedVal,
    endClassVal: SelectedVal
  ) {
    super("WidgetWrapper", ParentComponent, null);
    this.specProvider = specProvider;
    this.startClassVal = startClassVal;
    this.objectPropVal = objectPropVal;
    this.endClassVal = endClassVal;

    this.widgetType = this.specProvider.getProperty(this.objectPropVal.type).getPropertyType(this.endClassVal.type);
  }

  render() {
    super.render();

    if (!this.widgetComponent) {
      this.#initWidgetComponent();
    }

    // always re-render the few labels before widget that can change depending if a value has already been selected or not
    $(this.html).find("#selectAllWrapper").remove();
    this.#addWidgetHTML(this.widgetType);

    // if there is already a widget component rendered, then only render it since we would like to keep the state
    if (this.widgetComponent) {
      // could still be null in case of non selectable property
      console.log("widget component already there, rendering widget component");
      this.widgetComponent.render();
    }

    this.#addSelectAllListener();
    return this;
  }

  #addSelectAllListener() {
    $(this.html)
      .find(".selectAll")
      .first()
      .on("click", () => {
        this.html[0].dispatchEvent(
          new CustomEvent("selectAll", { bubbles: true })
        );
      });
  }

  #initWidgetComponent() {
    // if non selectable, simply exit
    if (this.widgetType == Config.NON_SELECTABLE_PROPERTY) {
      this.html[0].dispatchEvent(
        new CustomEvent("redrawBackgroundAndLinks", { bubbles: true })
      );
      return this;
    }

    this.widgetComponent = this.#createWidgetComponent(
      this.widgetType,
      this.objectPropVal.type,
      this.endClassVal.type
    );
  }

  #addWidgetHTML(widgetType?: string) {
    var parenthesisLabel =
      " (" + this.specProvider.getEntity(this.endClassVal.type).getLabel() + ") ";
    if (this.widgetType == Config.BOOLEAN_PROPERTY) {
      parenthesisLabel = " ";
    }

    let lineSpan = `<span class="edit-trait first">
    <span class="edit-trait-top"></span>
    <span class="edit-num">
      1
    </span>
    </span>`;

    let selectAnySpan = `<span class="selectAll" id="selectAll">
    <span class="underline">
    ${I18n.labels.SelectAllValues}
    </span> 
    ${parenthesisLabel} 
    </span>`;

    let orSpan = `<span class="or">
      ${I18n.labels.Or}
    </span> `;
    
    let endLabel = this.#getEndLabel(this.widgetType);
    let endLabelSpan = `<span>
      ${endLabel}
    </span>
    `;

    let htmlString = '';
    widgetType == Config.NON_SELECTABLE_PROPERTY
    ? (htmlString = lineSpan + selectAnySpan)
    // if there is a value, do not propose the "Any" selection option
    : (this.widgetComponent.getwidgetValues().length > 0)
      ?(htmlString = lineSpan + endLabelSpan) 
      :(htmlString = lineSpan + selectAnySpan + orSpan + endLabelSpan);

    this.widgetHtml = $(`<span id="selectAllWrapper">${htmlString}</span>`);

    this.html.append(this.widgetHtml);
  }

  #getEndLabel(widgetType: string) {
    if (
      widgetType == Config.SEARCH_PROPERTY ||
      widgetType == Config.STRING_EQUALS_PROPERTY ||
      widgetType == Config.GRAPHDB_SEARCH_PROPERTY ||
      widgetType == Config.VIRTUOSO_SEARCH_PROPERTY ||
      widgetType == Config.TREE_PROPERTY
    ) {
      // label of the "Search" pseudo-class is inserted alone in this case
      return this.specProvider.getEntity(this.endClassVal.type).getLabel();
    } else if (
      widgetType == Config.LIST_PROPERTY ||
      widgetType == Config.TIME_PROPERTY_DATE ||
      widgetType == Config.TIME_PROPERTY_YEAR
    ) {
      return I18n.labels.Select + " :";
    } else if (widgetType == Config.BOOLEAN_PROPERTY) {
      return "";
    } else if (widgetType == Config.NUMBER_PROPERTY) {
      return I18n.labels.Range + " :";
    } else {
      return I18n.labels.Find + " :";
    }
  }

  #readDefaultEndpoint(defaultEndpoint:string | (() => string) | undefined):string{
    if(defaultEndpoint instanceof Function) {
      return (defaultEndpoint as (()=> string))();
    } else if(defaultEndpoint) {
      return defaultEndpoint as string;
    } else {
      return undefined;
    }
  }

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
          this,
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
          this,
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
          this,
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

  getWidgetType() {
    return this.widgetType;
  }
}

export default WidgetWrapper;
