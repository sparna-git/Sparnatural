import ISettings from "../../../configs/client-configs/ISettings";
import { Config } from "../../../configs/fixed-configs/SparnaturalConfig";
import Datasources from "../../../configs/fixed-configs/SparnaturalConfigDatasources";
import { SparqlTreeHandler } from "./handlers/TreeHandlers";
import IWidget from "./IWidget";
import { initGeneralEvent } from "../../globals/globalfunctions";
import ISpecProvider from "../../spec-providers/ISpecProviders";
import CriteriaGroup from "../criterialist/CriteriaGroup";
import HTMLComponent from "../../HtmlComponent";
import {
  SparqlTemplateAutocompleteHandler,
  SparqlTemplateListHandler,
} from "./handlers/AutocompleteAndListHandlers";
import {
  AutoCompleteWidget,
  BooleanWidget,
  DatesWidget,
  ListWidget,
  NoWidget,
  SearchWidget,
  TimeDatePickerWidget,
  TreeWidget,
} from "./Widgets";

/**
 *  Selects the value for a range in a criteria/line, using a value selection widget
 **/
class ObjectPropertyTypeWidget extends HTMLComponent {
  GrandParent: CriteriaGroup;
  settings: ISettings;
  widgetType: string | null = null;
  objectPropertyId: any;
  rangeClassId: any;
  classLabel: string;
  widgetComponent: IWidget;
  needTriggerClick: boolean = false; // IMPORTANT Cheating here a little bit. useless class var but neeted to fit inputTypeComponent
  loadedValue: {
    key?: any;
    label?: any;
    uri?: any;
    start?: any;
    stop?: any;
    search?: any;
    boolean?: any;
  } | null = null;
  specProvider: ISpecProvider;

  constructor(
    ParentComponent: HTMLComponent,
    settings: ISettings,
    specProvider: ISpecProvider
  ) {
    super("ObjectPropertyTypeWidget", ParentComponent, null);
    this.settings = settings;
    this.GrandParent = ParentComponent.ParentComponent as CriteriaGroup;
    this.specProvider = specProvider
  }

  render() {
    this.widgetHtml = null;
    this.objectPropertyId = this.GrandParent.ObjectPropertyGroup.value_selected; // shows which objectproperty got chosen for which subject object combination
    this.widgetType = this.specProvider.getObjectPropertyType(
      this.objectPropertyId
    );
    this.rangeClassId = this.GrandParent.EndClassGroup.value_selected;
    this.classLabel = this.specProvider.getLabel(this.rangeClassId);
    let endLabel: string;
    let add_all = true;
    let add_or = true;
    // if non selectable, simply exit
    if (this.widgetType == Config.NON_SELECTABLE_PROPERTY) {
      if (
        this.specProvider.isLiteralClass(
          this.GrandParent.EndClassGroup.value_selected
        )
      ) {
        this.GrandParent.initCompleted();

        //Add variable on results view
        if (!this.GrandParent.EndClassGroup.notSelectForview) {
          this.GrandParent.EndClassGroup.onchangeViewVariable();
        }
        add_all = false;

        //$(this.ParentComponent.ParentCriteriaGroup).trigger( {type:"EndClassWidgetGroupSelected" } ) ;
        $(this.GrandParent.thisForm_.sparnatural).trigger("submit");
        initGeneralEvent(this, this.GrandParent.thisForm_);
      }
      //var endLabel = null ; //Imporant is this still necessary?
      add_or = false;

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
    var selcetAll = "";
    // explain this if
    if (this.GrandParent.EndClassWidgetGroup.selectedValues?.length == 0) {
      if (add_all) {
        selcetAll =
          '<span class="selectAll"><span class="underline">' +
          this.settings.langSearch.SelectAllValues +
          "</span>" +
          parenthesisLabel +
          "</span>";
      }
      if (add_all && add_or) {
        selcetAll +=
          '<span class="or">' + this.settings.langSearch.Or + "</span> ";
      }
    }

    var widgetLabel =
      '<span class="edit-trait first"><span class="edit-trait-top"></span><span class="edit-num">1</span></span>' +
      selcetAll;

    if (endLabel) {
      widgetLabel += "<span>" + endLabel + "</span>";
    }

    // init HTML by concatenating bit of HTML + widget HTML
    this.widgetComponent = this.createWidgetComponent(
      this.widgetType,
      this.objectPropertyId,
      this.rangeClassId
    );

    if (this.widgetType == Config.NON_SELECTABLE_PROPERTY) {
      this.widgetHtml = $(widgetLabel);
    } else {
      this.widgetHtml = $(widgetLabel + this.widgetComponent.html);
    }
    this.htmlParent =
      this.GrandParent.EndClassGroup.html.find(".EditComponents");
    super.render()

    this.widgetComponent.render();
    $(this.html)
      .find(".selectAll")
      .first()
      .on("click", () => {
        $(this).trigger("selectAll");
      });
      return this
  }

  canHaveSelectAll() {
    if (
      this.widgetType == Config.NON_SELECTABLE_PROPERTY &&
      this.specProvider.isLiteralClass(
        this.GrandParent.EndClassGroup.value_selected
      )
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
        this.cssClasses.ListeWidget = true;
        return new ListWidget(
          this,
          handler,
          this.settings.langSearch,
          this.settings,
          !(datasource.noSort == true)
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
        this.cssClasses.ListeWidget = true;
        return new ListWidget(
          this,
          handler,
          this.settings.langSearch,
          this.settings,
          !(datasource.noSort == true)
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
        this.cssClasses.AutocompleteWidget = true;
        return new AutoCompleteWidget(this, handler);

        break;
      case Config.GRAPHDB_SEARCH_PROPERTY:
      case Config.STRING_EQUALS_PROPERTY:
      case Config.SEARCH_PROPERTY:
        this.cssClasses.SearchWidget = true;
        return new SearchWidget(this, this.settings.langSearch);
        break;
      case Config.TIME_PROPERTY_YEAR:
        this.cssClasses.TimeDatePickerWidget = true;
        return new TimeDatePickerWidget(
          this,
          this.settings.dates,
          false,
          this.settings.langSearch
        );
        break;
      case Config.TIME_PROPERTY_DATE:
        this.cssClasses.TimeDatePickerWidget = true;
        return new TimeDatePickerWidget(
          this,
          this.settings.dates,
          "day",
          this.settings.langSearch
        );
        break;
      case Config.TIME_PROPERTY_PERIOD:
        this.cssClasses.DatesWidget = true;
        return new DatesWidget(
          this,
          this.settings.dates,
          this.settings.langSearch
        );
        break;
      case Config.NON_SELECTABLE_PROPERTY:
        this.cssClasses.NoWidget = true;
        return new NoWidget(this);
        break;
      case Config.BOOLEAN_PROPERTY:
        this.cssClasses.BooleanWidget = true;
        return new BooleanWidget(this, this.settings.langSearch);
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
        this.cssClasses.TreeWidget = true;
        return new TreeWidget(
          this,
          handler,
          this.settings,
          this.settings.langSearch
        );

        break;
      default:
        // TODO : throw Exception
        console.error("Unexpected Widget Type " + widgetType);
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
  getValue() {
    if (this.loadedValue !== null) {
      return this.loadedValue;
    } else {
      return this.widgetComponent.getValue();
    }
  }
}

export default ObjectPropertyTypeWidget;
