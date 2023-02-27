import ISettings from "../../../../../../sparnatural/settings/ISettings";
import { Config } from "../../../../../ontologies/SparnaturalConfig";
import Datasources from "../../../../../ontologies/SparnaturalConfigDatasources";
import { SparqlTreeHandler } from "../../../../widgets/treewidget/TreeHandlers";
import ISpecProvider from "../../../../../spec-providers/ISpecProvider";
import HTMLComponent from "../../../../HtmlComponent";
import { SelectedVal } from "../../../../../generators/ISparJson";
import EditComponents from "./EditComponents";
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


/**
 *  creates the corresponding widget
 **/
class WidgetWrapper extends HTMLComponent {
  settings: ISettings = getSettings()
  widgetType: Config;
  widgetComponent: AbstractWidget;
  specProvider: ISpecProvider;
  objectPropVal: SelectedVal;
  startClassVal: SelectedVal;
  endClassVal: SelectedVal;
  add_or: boolean = true;

  constructor(
    ParentComponent: EditComponents,
    specProvider: ISpecProvider,
    startClassVal: SelectedVal,
    objectPropVal: SelectedVal,
    endClassVal: SelectedVal
  ) {
    super("WidgetWrapper", ParentComponent, null);
    this.specProvider = specProvider;
    this.startClassVal = startClassVal;
    this.objectPropVal = objectPropVal;
    this.endClassVal = endClassVal;

    this.widgetType = this.specProvider.getObjectPropertyType(
      this.objectPropVal.type
    );
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

  #addWidgetHTML(widgetType: string) {
    var parenthesisLabel =
      " (" + this.specProvider.getLabel(this.endClassVal.type) + ") ";
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

  #getEndLabel(widgetType: Config) {
    if (
      widgetType == Config.SEARCH_PROPERTY ||
      widgetType == Config.STRING_EQUALS_PROPERTY ||
      widgetType == Config.GRAPHDB_SEARCH_PROPERTY ||
      widgetType == Config.TREE_PROPERTY
    ) {
      // label of the "Search" pseudo-class is inserted alone in this case
      return this.specProvider.getLabel(this.endClassVal.type);
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
      case Config.LITERAL_LIST_PROPERTY: {
        // defaut handler to be used
        var handler = this.settings.list; //IMPORTANT: what is this list?

        // to be passed in anonymous functions
        var theSpecProvider = this.specProvider;

        // determine custom datasource
        var datasource = this.specProvider.getDatasource(objectPropertyId);

        if (datasource == null) {
          // try to read it on the class
          datasource = this.specProvider.getDatasource(endClassType);
        }

        if (datasource == null) {
          // datasource still null
          // if a default endpoint was provided, provide default datasource
          if (this.settings.defaultEndpoint) {
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

            // IMPORTANT is this deletable?
            this.settings.language,

            // sparql query (with labelPath interpreted)
            this.getFinalQueryString(datasource)
          );
        }
        return new LiteralListWidget(
          this,
          handler,
          !(datasource.noSort == true),
          this.startClassVal,
          this.objectPropVal,
          this.endClassVal
        );

      }
      case Config.LIST_PROPERTY:
        // defaut handler to be used
        var handler = this.settings.list;

        // to be passed in anonymous functions
        var theSpecProvider = this.specProvider;

        // determine custom datasource
        var datasource = this.specProvider.getDatasource(objectPropertyId);

        if (datasource == null) {
          // try to read it on the class
          datasource = this.specProvider.getDatasource(endClassType);
        }

        if (datasource == null) {
          // datasource still null
          // if a default endpoint was provided, provide default datasource
          if (this.settings.defaultEndpoint) {
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

            // language,
            this.settings.language,

            // sparql query (with labelPath interpreted)
            this.getFinalQueryString(datasource)
          );
        }
        return new ListWidget(
          this,
          handler,
          !(datasource.noSort == true),
          this.startClassVal,
          this.objectPropVal,
          this.endClassVal
        );

      case Config.AUTOCOMPLETE_PROPERTY:
        var handler = this.settings.autocomplete;
        // to be passed in anonymous functions
        var theSpecProvider = this.specProvider;

        // determine custom datasource
        var datasource = this.specProvider.getDatasource(objectPropertyId);

        if (datasource == null) {
          // try to read it on the class
          datasource = this.specProvider.getDatasource(endClassType);
        }

        if (datasource == null) {
          // datasource still null
          // if a default endpoint was provided, provide default datasource
          if (this.settings.defaultEndpoint) {
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

            // language,
            this.settings.language,

            // sparql query (with labelPath interpreted)
            this.getFinalQueryString(datasource)
          );
        }
        return new AutoCompleteWidget(
          this,
          handler,
          this.settings.langSearch,
          this.startClassVal,
          this.objectPropVal,
          this.endClassVal
        );

        break;
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
          this.specProvider.getTreeRootsDatasource(objectPropertyId);
        if (treeRootsDatasource == null) {
          // try to read it on the class
          treeRootsDatasource =
            this.specProvider.getTreeRootsDatasource(endClassType);
        }
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
          this.specProvider.getTreeChildrenDatasource(objectPropertyId);
        if (treeChildrenDatasource == null) {
          // try to read it on the class
          treeChildrenDatasource =
            this.specProvider.getTreeChildrenDatasource(endClassType);
        }
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

            // IMPORTANT is this deletable?
            this.settings.language,

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
