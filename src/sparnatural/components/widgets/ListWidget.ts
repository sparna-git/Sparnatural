import { BgpPattern, Pattern, Triple, ValuePatternRow, ValuesPattern } from "sparqljs";
import { SelectedVal } from "../SelectedVal";
import { AbstractWidget, RDFTerm, ValueRepetition, WidgetValue } from "./AbstractWidget";
import { DataFactory } from 'rdf-data-factory';
import "select2";
import "select2/dist/css/select2.css";
import SparqlFactory from "../../generators/sparql/SparqlFactory";
import EndClassGroup from "../builder-section/groupwrapper/criteriagroup/startendclassgroup/EndClassGroup";
import { ListDataProviderIfc, NoOpListDataProvider } from "./data/DataProviders";
import { I18n } from "../../settings/I18n";
import { Term } from "@rdfjs/types/data-model";
import HTMLComponent from "../HtmlComponent";

const factory = new DataFactory();

export class ListWidgetValue implements WidgetValue {
  value: {
    label: string;
    rdfTerm: RDFTerm
  };

  key():string {
    return this.value.rdfTerm.value;
  }

  constructor(v:ListWidgetValue["value"]) {
    this.value = v;
  }
}

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

    let callback = (items:{term:RDFTerm;label:string;group?:string}[]) => {

      if (items.length > 0) {
  
        // find distinct values of the 'group' binding
        const groups = [...new Set(items.map(item => item.group))];

        if(groups.length == 1 && groups[0] == undefined) {
          // no groups were defined at all
          items.forEach(item => {
            this.selectHtml.append(
              $("<option value='" + JSON.stringify(item.term) + "'>" + item.label + "</option>")
            );
          });
        } else {
          // we found some group, organise the list content with optgroup
          groups.forEach(group => {
            let html = "<optgroup label=\""+group+"\">";
            items.filter(item => (item.group == group)).forEach(item => {
              html += "<option value='" + JSON.stringify(item.term) + "'>" + item.label + "</option>";
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

            let listWidgetValue: WidgetValue = this.buildValue(option[0].value, option[0].label);
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
    return new ListWidgetValue({
      label: label,
      rdfTerm: term
    });
  }

  parseInput(input:ListWidgetValue["value"]): WidgetValue { return new ListWidgetValue(input) }

  /**
   * @returns  true if the number of values is 1, in which case the widget will handle the generation of the triple itself,
   * not using a VALUES clause; returns false otherwise.
   */
  isBlockingObjectProp() {
    return (
      this.widgetValues.length == 1
      &&
      !((this.ParentComponent.ParentComponent.ParentComponent as EndClassGroup).isVarSelected())
    );
  }

  /**
   * @returns  true if at least one value is selected, in which case we don't need to insert an rdf:type constraint
   * on the end class
   */
   isBlockingEnd(): boolean {
    return (
      this.widgetValues.length > 0
    );
   }


   getRdfJsPattern(): Pattern[] {
    if(this.isBlockingObjectProp()) {
      let singleTriple: Triple = SparqlFactory.buildTriple(
        factory.variable(this.startClassVal.variable),
        factory.namedNode(this.objectPropVal.type),
        this.rdfTermToSparqlQuery((this.widgetValues[0] as ListWidgetValue).value.rdfTerm)
      );

      let ptrn: BgpPattern = {
        type: "bgp",
        triples: [singleTriple],
      };
  

      return [ptrn];
    } else {
      let vals = (this.widgetValues as ListWidgetValue[]).map((v) => {
        let vl: ValuePatternRow = {};
        vl["?"+this.endClassVal.variable] = this.rdfTermToSparqlQuery(v.value.rdfTerm);
        return vl;
      });
      let valuePattern: ValuesPattern = {
        type: "values",
        values: vals,
      };
      return [valuePattern];
    }
  }




}
