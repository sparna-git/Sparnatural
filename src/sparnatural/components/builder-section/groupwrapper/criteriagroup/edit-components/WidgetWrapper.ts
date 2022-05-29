import ISettings from "../../../../../../configs/client-configs/ISettings";
import { Config } from "../../../../../../configs/fixed-configs/SparnaturalConfig";
import Datasources from "../../../../../../configs/fixed-configs/SparnaturalConfigDatasources";
import { SparqlTreeHandler } from "./handlers/TreeHandlers";
import ISpecProvider from "../../../../../spec-providers/ISpecProviders";
import {
  AutoCompleteWidget,
  BooleanWidget,
  DatesWidget,
  ListWidget,
  NoWidget,
  SearchWidget,
  TimeDatePickerWidget,
  //TreeWidget,
} from "./Widgets";
import HTMLComponent from "../../../../HtmlComponent";
import { AutocompleteValue, DateValue, IWidget, ListWidgetValue } from "./IWidget";
import { SelectedVal } from "../../../../../sparql/ISparJson";
import EditComponents from "./EditComponents";
import { SparqlTemplateAutocompleteHandler, SparqlTemplateListHandler } from "./handlers/AutocompleteAndListHandlers";

/**
 *  creates the corresponding widget
 **/
class WidgetWrapper extends HTMLComponent {
  settings: ISettings;
  widgetType: Config
  objectPropertype: string;
  rangeClassId: string;
  classLabel: string;
  widgetComponent: IWidget;
  widgetVal: ListWidgetValue | DateValue | AutocompleteValue
  specProvider: ISpecProvider;
  objectPropVal: SelectedVal;
  startClassVal: SelectedVal;
  endClassVal: SelectedVal;
  add_or:boolean
  add_all = true; // render only when widgets allows it AND no widgetvalue is already selected

  constructor(
    ParentComponent: EditComponents,
    specProvider: ISpecProvider,
    startClassVal:SelectedVal,
    objectPropVal: SelectedVal,
    endClassVal: SelectedVal,
    add_all:boolean //if the add_all option should be rendered
  ) {
    super("WidgetWrapper", ParentComponent, null);
    this.specProvider = specProvider;
    this.startClassVal = startClassVal;
    this.objectPropVal = objectPropVal;
    this.endClassVal = endClassVal;
    this.add_all=add_all
  }

  render() {
    super.render();
    this.widgetHtml = null;
    this.objectPropertype = this.objectPropVal.type; // shows which objectproperty got chosen for which subject object combination

    this.widgetType = this.specProvider.getObjectPropertyType(
      this.objectPropertype
    );
    this.rangeClassId = this.endClassVal.type;
    this.classLabel = this.specProvider.getLabel(this.rangeClassId);
    let endLabel: string;
    // if non selectable, simply exit
    if (this.widgetType == Config.NON_SELECTABLE_PROPERTY) {
      if (this.specProvider.isLiteralClass(this.endClassVal.type)) {
        //this.GrandParent.initCompleted();

        //Add variable on results view
        /* STILL NECESSARY?
        if (!this.GrandParent.notSelectForview) {
          this.GrandParent.onchangeViewVariable();
        }*/
        this.add_all = false;
        this.html[0].dispatchEvent(
          new CustomEvent("initGeneralEvent", { bubbles: true })
        );
      }
      //var endLabel = null ; //Imporant is this still necessary?
      this.add_or = false;

      //return true;
    } else {
      // pour les autres type de widgets
      if (
        this.widgetType == Config.SEARCH_PROPERTY ||
        this.widgetType == Config.STRING_EQUALS_PROPERTY ||
        this.widgetType == Config.GRAPHDB_SEARCH_PROPERTY ||
        this.widgetType == Config.TREE_PROPERTY
      ) {
        // label of the "Search" pseudo-class is inserted alone in this case
        endLabel = this.classLabel;
      } else if (
        this.widgetType == Config.LIST_PROPERTY ||
        this.widgetType == Config.TIME_PROPERTY_DATE ||
        this.widgetType == Config.TIME_PROPERTY_YEAR
      ) {
        endLabel = this.settings.langSearch.Select + " :";
      } else if (this.widgetType == Config.BOOLEAN_PROPERTY) {
        endLabel = "";
      } else {
        endLabel = this.settings.langSearch.Find + " :";
      }
    }
    var parenthesisLabel = " (" + this.classLabel + ") ";
    if (this.widgetType == Config.BOOLEAN_PROPERTY) {
      parenthesisLabel = " ";
    }

    //Ajout de l'option all si pas de valeur déjà selectionées
    var selectAll = "";

      if (this.add_all) {
        selectAll =
          '<span class="selectAll"><span class="underline">' +
          this.settings.langSearch.SelectAllValues +
          "</span>" +
          parenthesisLabel +
          "</span>";

      }
      if (this.add_all && this.add_or) {
        selectAll +=
          '<span class="or">' + this.settings.langSearch.Or + "</span> ";
      }


    var widgetLabel =
      '<span class="edit-trait first"><span class="edit-trait-top"></span><span class="edit-num">1</span></span>' +
      selectAll;

    if (endLabel) {
      widgetLabel += "<span>" + endLabel + "</span>";
    }

    // init HTML by concatenating bit of HTML + widget HTML
    this.widgetComponent = this.createWidgetComponent(
      this.widgetType,
      this.objectPropertype,
      this.rangeClassId
    );

    if (this.widgetType == Config.NON_SELECTABLE_PROPERTY) {
      this.widgetHtml = $(widgetLabel);
    } else {
      this.widgetHtml = $(widgetLabel + this.widgetComponent.html);
    }
    this.html.append(this.widgetHtml)


    this.widgetComponent.render();
    $(this.html)
      .find(".selectAll")
      .first()
      .on("click", () => {
        this.html[0].dispatchEvent(new CustomEvent('selectAll',{bubbles:true}))
      });
    return this;
  }

  canHaveSelectAll() {
    if (
      this.widgetType == Config.NON_SELECTABLE_PROPERTY &&
      this.specProvider.isLiteralClass(this.endClassVal.type)
    ) {
      return false;
    }
    return true;
  }

  createWidgetComponent(
    widgetType: string,
    objectPropertyId: any,
    rangeClassId: any
  ): IWidget {
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
          datasource = this.specProvider.getDatasource(rangeClassId);
        }

        if (datasource == null) {
          // datasource still null
          // if a default endpoint was provided, provide default datasource
          if (this.settings.defaultEndpoint != null) {
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
              : this.settings.defaultEndpoint,

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
                return theSpecProvider.expandSparql(sparql);
              },
            },

            // IMPORTANT is this deletable?
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

        break;
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
          datasource = this.specProvider.getDatasource(rangeClassId);
        }

        if (datasource == null) {
          // datasource still null
          // if a default endpoint was provided, provide default datasource
          if (this.settings.defaultEndpoint != null) {
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
              : this.settings.defaultEndpoint,

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
                return theSpecProvider.expandSparql(sparql);
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
        break;
      case Config.AUTOCOMPLETE_PROPERTY:
        var handler = this.settings.autocomplete;
        // to be passed in anonymous functions
        var theSpecProvider = this.specProvider;

        // determine custom datasource
        var datasource = this.specProvider.getDatasource(objectPropertyId);

        if (datasource == null) {
          // try to read it on the class
          datasource = this.specProvider.getDatasource(rangeClassId);
        }

        if (datasource == null) {
          // datasource still null
          // if a default endpoint was provided, provide default datasource
          if (this.settings.defaultEndpoint != null) {
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
              : this.settings.defaultEndpoint,

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
                return theSpecProvider.expandSparql(sparql);
              },
            },

            // language,
            this.settings.language,

            // sparql query (with labelPath interpreted)
            this.getFinalQueryString(datasource)
          );
        }
        return new AutoCompleteWidget(this, handler, this.startClassVal,this.objectPropVal,this.endClassVal);

        break;
      case Config.GRAPHDB_SEARCH_PROPERTY:
      case Config.STRING_EQUALS_PROPERTY:
      case Config.SEARCH_PROPERTY:
        return new SearchWidget(this);
        break;
      case Config.TIME_PROPERTY_YEAR:
        return new TimeDatePickerWidget(
          this,
          this.settings.dates,
          false
        );
        break;
      case Config.TIME_PROPERTY_DATE:
        return new TimeDatePickerWidget(
          this,
          this.settings.dates,
          "day"
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
        return new BooleanWidget(this);
        break;
      case Config.TREE_PROPERTY:
        var theSpecProvider = this.specProvider;

        // determine custom roots datasource
        var treeRootsDatasource =
          this.specProvider.getTreeRootsDatasource(objectPropertyId);
        if (treeRootsDatasource == null) {
          // try to read it on the class
          treeRootsDatasource =
            this.specProvider.getTreeRootsDatasource(rangeClassId);
        }
        if (treeRootsDatasource == null) {
          // datasource still null
          // if a default endpoint was provided, provide default datasource
          if (this.settings.defaultEndpoint != null) {
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
            this.specProvider.getTreeChildrenDatasource(rangeClassId);
        }
        if (treeChildrenDatasource == null) {
          // datasource still null
          // if a default endpoint was provided, provide default datasource
          if (this.settings.defaultEndpoint != null) {
            treeChildrenDatasource = Datasources.DATASOURCES_CONFIG.get(
              Datasources.TREE_CHILDREN_SKOSNARROWER
            );
          }
        }

        if (treeRootsDatasource != null && treeChildrenDatasource != null) {
          // if we have a datasource, possibly the default one, provide a config based
          // on a SparqlTemplate, otherwise use the handler provided

          handler = new SparqlTreeHandler(
            // endpoint URL
            // we read it on the roots datasource
            treeRootsDatasource.sparqlEndpointUrl != null
              ? treeRootsDatasource.sparqlEndpointUrl
              : this.settings.defaultEndpoint,

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
                return theSpecProvider.expandSparql(sparql);
              },
            },

            // IMPORTANT is this deletable?
            this.settings.language,

            // sparql strings
            this.getFinalQueryString(treeRootsDatasource),
            this.getFinalQueryString(treeChildrenDatasource)
          );
        }
        /*
        return new TreeWidget(
          this,
          handler,
          this.settings,
          this.settings.langSearch
        );*/
        return new NoWidget(this)

        break;
      default:
        throw new Error(`WidgetType for ${widgetType} not recognized`)
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

  getWidgetType(){
    return this.widgetType
  }
}

export default WidgetWrapper;
