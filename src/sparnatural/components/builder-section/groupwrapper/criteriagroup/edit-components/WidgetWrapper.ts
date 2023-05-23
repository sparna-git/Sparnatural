import ISettings from "../../../../../../sparnatural/settings/ISettings";
import { Config } from "../../../../../ontologies/SparnaturalConfig";
import Datasources from "../../../../../ontologies/SparnaturalConfigDatasources";
import { SparqlTreeHandler } from "../../../../widgets/treewidget/TreeHandlers";
import ISparnaturalSpecification from "../../../../../spec-providers/ISparnaturalSpecification";
import HTMLComponent from "../../../../HtmlComponent";
import { SelectedVal } from "../../../../../generators/ISparJson";
import EditComponents from "./EditComponents";
import MapWidget from "../../../../widgets/MapWidget";
import { AbstractWidget } from "../../../../widgets/AbstractWidget";
import { BooleanWidget } from "../../../../widgets/BooleanWidget";
import { DatesWidget } from "../../../../widgets/DatesWidget";
import { SearchRegexWidget } from "../../../../widgets/SearchRegexWidget";
import { TimeDatePickerWidget } from "../../../../widgets/timedatepickerwidget/TimeDatePickerWidget";
import { NoWidget } from "../../../../widgets/NoWidget";
import { TreeWidget } from "../../../../widgets/treewidget/TreeWidget";
import { AutoCompleteWidget } from "../../../../widgets/AutoCompleteWidget";
import { getSettings } from "../../../../../settings/defaultSettings";
import { AutocompleteSparqlTemplateQueryBuilder, ListSparqlTemplateQueryBuilder } from "../../../../widgets/data/SparqlBuilders";
import { SparqlAutocompleDataProvider, SparqlListDataProvider, SparqlLiteralListDataProvider } from "../../../../widgets/data/DataProviders";
import { ListWidget } from "../../../../widgets/ListWidget";


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

    this.widgetType = this.specProvider.getProperty(this.objectPropVal.type).getPropertyType();
  }

  render() {
    super.render();

    if (!this.widgetComponent) {
      this.#initWidgetComponent();
    }

    // always re-render the few labels before widget that can change depending if a value has already been selected or not
    $(this.html).find("#selectAllWrapper").remove();
    this.#addWidgetHTML(this.widgetType);

    //if there is already a widget component rendered, then only render it since we would like to keep the state
    if (this.widgetComponent) {
      // could still be null in case of non selectable property
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
    ${this.settings.langSearch.SelectAllValues}
    </span> 
    ${parenthesisLabel} 
    </span>`;

    let orSpan = `<span class="or">
      ${this.settings.langSearch.Or}
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
      return this.settings.langSearch.Select + " :";
    } else if (widgetType == Config.BOOLEAN_PROPERTY) {
      return "";
    } else {
      return this.settings.langSearch.Find + " :";
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
        // defaut handler to be used
        // TODO : change interface in settings
        var listDataProvider = this.settings.list;

        // to be passed in anonymous functions
        var theSpecProvider = this.specProvider;

        // determine custom datasource
        var datasource = this.specProvider.getProperty(objectPropertyId).getDatasource();

        if (datasource == null) {
          // datasource still null
          // if a default endpoint was provided, provide default datasource
          if (this.settings.defaultEndpoint) {
            // that datasource can work indifferently with URIs or Literals
            datasource = Datasources.DATASOURCES_CONFIG.get(
              // better use alphabetical ordering first since URIs will be segregated in the "h" letter and not mixed
              Datasources.LIST_URI_OR_LITERAL_ALPHA_WITH_COUNT
            );
          }
        }

        if (datasource != null) {
          // if we have a datasource, possibly the default one, provide a config based
          // on a SparqlTemplate, otherwise use the handler provided
          
          listDataProvider = new SparqlListDataProvider(

            // endpoint URL
            datasource.sparqlEndpointUrl != null
              ? datasource.sparqlEndpointUrl
              : this.#readDefaultEndpoint(this.settings.defaultEndpoint),

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

        return new ListWidget(
          this,
          listDataProvider,
          !(datasource.noSort == true),
          this.startClassVal,
          this.objectPropVal,
          this.endClassVal
        );

      case Config.AUTOCOMPLETE_PROPERTY:
        var autocompleteDataProvider = this.settings.autocomplete;

        // to be passed in anonymous functions
        var theSpecProvider = this.specProvider;

        // determine custom datasource
        var datasource = this.specProvider.getProperty(objectPropertyId).getDatasource();

        if (datasource == null) {
          // datasource still null
          // if a default endpoint was provided, provide default datasource
          if (this.settings.defaultEndpoint) {
            let range: Array<string> = this.specProvider.getProperty(objectPropertyId).getRange();
            if(range && range.length == 1 && this.specProvider.getEntity(range[0]).isLiteralEntity()) {
              datasource = Datasources.DATASOURCES_CONFIG.get(
                Datasources.SEARCH_LITERAL_CONTAINS
              );
            } else {
              datasource = Datasources.DATASOURCES_CONFIG.get(
                Datasources.SEARCH_URI_CONTAINS
              );
            }
            
          }
        }

        if (datasource != null) {

          autocompleteDataProvider = new SparqlAutocompleDataProvider(

            // endpoint URL
            datasource.sparqlEndpointUrl != null
              ? datasource.sparqlEndpointUrl
              : this.#readDefaultEndpoint(this.settings.defaultEndpoint),

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
        return new AutoCompleteWidget(
          this,
          autocompleteDataProvider,
          this.settings.langSearch,
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
          this.settings.dates,
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
          this.settings.dates,
          "day",
          this.startClassVal,
          this.objectPropVal,
          this.endClassVal,
          this.specProvider
        );
        break;
      case Config.TIME_PROPERTY_PERIOD:
        return new DatesWidget(
          this,
          this.settings.dates,
          this.startClassVal,
          this.objectPropVal,
          this.endClassVal
        );
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

        if (treeRootsDatasource != null && treeChildrenDatasource != null) {
          // if we have a datasource, possibly the default one, provide a config based
          // on a SparqlTemplate, otherwise use the handler provided

          let handler = new SparqlTreeHandler(
            // endpoint URL
            // we read it on the roots datasource
            treeRootsDatasource.sparqlEndpointUrl != null
              ? treeRootsDatasource.sparqlEndpointUrl
              : this.#readDefaultEndpoint(this.settings.defaultEndpoint),

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
            },

            this.settings.language,
            this.settings.defaultLanguage,

            // sparql strings
            this.getFinalQueryString(treeRootsDatasource),
            this.getFinalQueryString(treeChildrenDatasource)
          );

          return new TreeWidget(
            this,
            handler,
            this.settings,
            this.settings.langSearch,
            this.startClassVal,
            this.objectPropVal,
            this.endClassVal,
            !(treeChildrenDatasource.noSort == true)
          );
        }

      case Config.MAP_PROPERTY:
        return new MapWidget(
          this,
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
