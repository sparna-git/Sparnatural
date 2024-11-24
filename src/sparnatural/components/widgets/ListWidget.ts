import { BgpPattern, Pattern, Triple, ValuePatternRow, ValuesPattern } from "sparqljs";
import { SelectedVal } from "../SelectedVal";
import { AbstractWidget, RDFTerm, RdfTermValue, ValueRepetition, WidgetValue } from "./AbstractWidget";
import { DataFactory } from 'rdf-data-factory';
import "select2";
import "select2/dist/css/select2.css";
import SparqlFactory from "../../generators/sparql/SparqlFactory";
import EndClassGroup from "../builder-section/groupwrapper/criteriagroup/startendclassgroup/EndClassGroup";
import { ListDataProviderIfc, RdfTermDatasourceItem, NoOpListDataProvider } from "./data/DataProviders";
import { I18n } from "../../settings/I18n";
import { Term } from "@rdfjs/types/data-model";
import HTMLComponent from "../HtmlComponent";

const factory = new DataFactory();

export interface ListConfiguration {
  dataProvider: ListDataProviderIfc,
  values?: Term[]
}

export class ListWidget extends AbstractWidget {

  // The default implementation of ListConfiguration
  static defaultConfiguration: ListConfiguration = {
    dataProvider: new NoOpListDataProvider(),
    values: undefined
  }

  configuration: ListConfiguration;

  protected widgetValues: WidgetValue[];
  selectHtml: JQuery<HTMLElement>;

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
    this.selectHtml = $(`<select style="width:100%; min-width:200px;"></select>`);    
    this.html.append(this.selectHtml);

    let noItemsHtml =
      $(`<div class="no-items" style="display: none; font-style:italic;">
      ${I18n.labels.ListWidgetNoItem}
    </div>`);

    let errorHtml =
      $(`<div class="no-items" style="display: none; font-style:italic;">
      ${I18n.labels.ListWidgetNoItem}
    </div>`);

    let callback = (items:RdfTermDatasourceItem[]) => {

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
          // we found some group, organise the list content with optgroup
          groups.forEach(group => {
            let html = "<optgroup label=\""+group+"\">";
            items.filter(item => (item.group == group)).forEach(item => {
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
          let listWidgetValue: WidgetValue = this.buildValue(option[0].value, itemLabel);
          this.renderWidgetVal(listWidgetValue);
        });

      } else {
        this.html.append(noItemsHtml);
      }  

      // switch off spinner
      this.toggleSpinner('')
    }

    // TODO : this is not working for now
    let errorCallback = (payload:any) => {
      this.html.append(errorHtml);
    }

    // toggle spinner before loading
    this.toggleSpinner(I18n.labels.AutocompleteSpinner_Searching);

    // if there are some provided values...
    if(this.configuration.values?.length > 0) {
      // convert the provided list of terms to RDFTerm[]
      let items: {term:RDFTerm;label:string;group?:string}[] = [];
      this.configuration.values.forEach(v => {
        items.push({
          term: new RDFTerm(v),
          label:v.value
        });
      });
      // then call the callback with it
      callback(items);
    } else {
      this.configuration.dataProvider.getListContent(
        this.startClassVal.type,
        this.objectPropVal.type,
        this.endClassVal.type,
        callback,
        errorCallback
      );
    }


    return this;
  }

  // separate the creation of the value from the widget code itself
  // so that it can be overriden by LiteralListWidget
  buildValue(termString:string,label:string): WidgetValue {
    let term = (JSON.parse(termString) as RDFTerm);
    return new RdfTermValue({
      label: label,
      rdfTerm: term
    });
  }

  parseInput(input:RdfTermValue["value"]): WidgetValue { return new RdfTermValue(input) }


}
