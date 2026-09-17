import { SelectedVal } from "../SelectedVal";
import { AbstractWidget, ValueRepetition } from "./AbstractWidget";
import { DataFactory } from 'rdf-data-factory';
import "select2";
import "select2/dist/css/select2.css";
import { I18n } from "../../settings/I18n";
import { Term } from "@rdfjs/types/data-model";
import { HTMLComponent } from "../HtmlComponent";
import { ListDataProviderIfc, RdfTermDatasourceItem, ValuesListDataProviderIfc } from "../datasources/DataProviders";
import { NoOpListDataProvider } from "../datasources/NoOpDataProviders";
import { mergeDatasourceResults } from "../datasources/SparqlDataProviders";
import { RDFTerm, RdfTermCriteria, LabelledCriteria } from "../../SparnaturalQueryIfc";

const factory = new DataFactory();

export interface ListConfiguration {
  dataProvider: ListDataProviderIfc | ValuesListDataProviderIfc,
  values?: Term[]
}

export class ListWidget extends AbstractWidget {

  // The default implementation of ListConfiguration
  static defaultConfiguration: ListConfiguration = {
    dataProvider: new NoOpListDataProvider(),
    values: undefined
  }

  configuration: ListConfiguration;

  selectHtml: JQuery<HTMLElement>;

  // registered once on the root component, see #listenToQueryChanges
  private queryChangeListener: () => void;

  // incremented on every load, so that a late answer from a previous one is dropped
  private loadCounter = 0;

  // pending reload, so that several queryUpdated in a row trigger a single query
  private reloadTimer: ReturnType<typeof setTimeout>;

  constructor(
    parentComponent: HTMLComponent,
    config: ListConfiguration,
    startClassVal: SelectedVal,
    objectPropVal: SelectedVal,
    endClassVal: SelectedVal
  ) {
    super(
      "list-widget",
      parentComponent,
      null,
      startClassVal,
      objectPropVal,
      endClassVal,
      ValueRepetition.MULTIPLE
    );

    this.configuration = config;
    this.startClassVal = startClassVal;
    this.objectPropVal = objectPropVal;
    this.endClassVal = endClassVal;
  }

  render() {
    super.render();
    this.#listenToQueryChanges();
    this.#loadValues();
    return this;
  }

  /**
   * Reloads the list whenever the query changes, so that it keeps proposing only values
   * consistent with the filters set on the other lines.
   *
   * A widget is only displayed while its line has no value yet, so a reload never
   * discards a choice already made by the user.
   */
  #listenToQueryChanges() {
    // render() may be called several times on the same widget, register only once
    if (this.queryChangeListener) return;

    // kept so that the listener can remove itself from the very same element
    const root = this.getRootComponent().html[0];

    this.queryChangeListener = () => {
      // the widget is taken off the page as soon as its line gets a value : there is
      // nothing left to reload, and nothing left to listen for
      if (!this.html[0]?.isConnected) {
        clearTimeout(this.reloadTimer);
        root.removeEventListener("queryUpdated", this.queryChangeListener);
        this.queryChangeListener = null;
        return;
      }

      // queryUpdated fires several times for a single user action, only keep the last
      clearTimeout(this.reloadTimer);
      this.reloadTimer = setTimeout(() => this.#loadValues(), 150);
    };

    root.addEventListener("queryUpdated", this.queryChangeListener);
  }

  /**
   * Asks the datasource for the values, and fills the list with what comes back.
   */
  #loadValues() {
    // clear what a previous load left behind, keeping the spinner in place
    if (this.selectHtml) {
      try {
        (this.selectHtml as any).select2("destroy");
      } catch (e) {
        // select2 was never initialised on it, nothing to undo
      }
      this.selectHtml.remove();
    }
    this.html.find(".no-items").remove();

    // identifies this load, see the guard at the top of the callbacks below
    const loadId = ++this.loadCounter;

    this.selectHtml = $(`<select style="width:100%; min-width:200px;"></select>`);
    this.html.append(this.selectHtml);

    // an empty list is not a mishap here : it means the criteria set on the other lines
    // leave no possible value, which is worth telling the user
    let noItemsHtml =
      $(`<div class="no-items" style="font-style:italic;">
      ${I18n.labels.ListWidgetDeadEnd}
    </div>`);

    let errorHtml =
      $(`<div class="no-items" style="font-style:italic;">
      ${I18n.labels.ListWidgetNoItem}
    </div>`);

    let callback = (items:RdfTermDatasourceItem[]) => {

      // a newer load was started in the meantime, this answer is obsolete : appending it
      // would duplicate the entries of the list
      if (loadId !== this.loadCounter) return;

      // tell the line whether this datasource returned anything : an empty list means
      // no value can lead to a result, so the line is a dead end
      this.html[0].dispatchEvent(
        new CustomEvent("datasourceHasValues", {
          bubbles: true,
          detail: { hasValues: items.length > 0 },
        })
      );

      if (items.length > 0) {

        this.selectHtml.append(
          $("<option value=''>" + I18n.labels.ListWidgetSelectValue + "</option>")
        );

        // find distinct values of the 'group' binding
        const groups = [...new Set(items.map(item => item.group))];

        if(groups.length == 1 && groups[0] == undefined) {
          // no groups were defined at all
          items.forEach(item => {
            // select item label : either displayed label, or itemLabel if provided
            let itemLabel = item.itemLabel?item.itemLabel:item.label;
            this.selectHtml.append(
              $("<option value='" + JSON.stringify(item.term) + "' data-itemLabel='"+itemLabel+"'>" + item.label + "</option>")
            );
          });
        } else {
          // we found some groups, organise the list content with optgroup

          let mergedResult = mergeDatasourceResults(items);
          const groupsAfterMerge = [...new Set(mergedResult.map(item => item.group))];

          groupsAfterMerge.forEach(group => {
            let html = "<optgroup label=\""+group+"\">";
            mergedResult.filter(item => (item.group == group)).forEach(item => {
              // select item label : either displayed label, or itemLabel if provided
              let itemLabel = item.itemLabel?item.itemLabel:item.label;
              
              html += "<option value='" + JSON.stringify(item.term) + "' data-itemLabel='"+itemLabel+"'>" + item.label + "</option>";
            });
            html += "</optgroup>"
            this.selectHtml.append($(html));
          })
        }


        this.selectHtml = this.selectHtml.select2({
          // use the minimumResultsForSearch parameter to avoid using a search box when only a few items are present
          minimumResultsForSearch: 20,
          // pass a JQUery object so that HTML markup is preserved
          // TODO : this does not work ATM
          // templateResult: function formatLabel(label:any) {return $(label)},
          width: "style"
        });

        // set a listener for when a value is selected
        this.selectHtml.on("select2:close", (e: any) => {
          let option = (e.currentTarget as HTMLSelectElement).selectedOptions;
          if (option.length > 1)
            throw Error("List widget should allow only for one el to be selected!");

          // this is the placeholder
          if(option[0].value == "")
            return;

          let itemLabel = option[0].getAttribute("data-itemLabel");
          let listWidgetValue: LabelledCriteria<RdfTermCriteria> = this.buildValue(option[0].value, itemLabel);
          this.triggerRenderWidgetVal(listWidgetValue);
        });

      } else {
        // there is nothing to choose from, an empty dropdown would only be misleading
        this.selectHtml.remove();
        this.html.append(noItemsHtml);
      }  

      // switch off spinner
      this.toggleSpinner('')
    }

    // TODO : this is not working for now
    let errorCallback = (payload:any) => {
      if (loadId !== this.loadCounter) return;
      this.html.append(errorHtml);
    }

    // toggle spinner before loading
    this.toggleSpinner(I18n.labels.AutocompleteSpinner_Searching);

    // if there are some provided values like in sh:in...
    if(this.configuration.values?.length > 0) {
      (this.configuration.dataProvider as ValuesListDataProviderIfc).getListContent(
        this.configuration.values,
        callback,
        errorCallback
      );
    } else {
      (this.configuration.dataProvider as ListDataProviderIfc).getListContent(
        this.startClassVal.type,
        this.objectPropVal.type,
        this.endClassVal.type,
        callback,
        errorCallback
      );
    }
  }

  // separate the creation of the value from the widget code itself
  // so that it can be overriden by LiteralListWidget
  buildValue(termString:string,label:string): LabelledCriteria<RdfTermCriteria> {
    let term = (JSON.parse(termString) as RDFTerm);
    return {
      label: label,
      criteria: { rdfTerm: term }
    };
  }

  parseInput(input:LabelledCriteria<RdfTermCriteria>): LabelledCriteria<RdfTermCriteria> { return input }


}
