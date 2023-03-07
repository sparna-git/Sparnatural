import { BgpPattern, Pattern, Triple, ValuePatternRow, ValuesPattern } from "sparqljs";
import  { ListHook } from "../../../../sparnatural/settings/ISettings";
import { getSettings } from "../../../../sparnatural/settings/defaultSettings";
import LocalCacheData from "../../../datastorage/LocalCacheData";
import { SelectedVal } from "../../../generators/ISparJson";
import WidgetWrapper from "../../builder-section/groupwrapper/criteriagroup/edit-components/WidgetWrapper";
import { AbstractWidget, ValueRepetition, WidgetValue } from "./../AbstractWidget";
import * as DataFactory from "@rdfjs/data-model" ;
import "select2";
import "select2/dist/css/select2.css";
import SparqlFactory from "../../../generators/SparqlFactory";
import { AbstractSparqlListHandler } from "./ListHandler";

export class ListWidgetValue implements WidgetValue {
  value: {
    label: string;
    uri?: string;
  };

  key():string {
    return this.value.uri;
  }

  constructor(v:ListWidgetValue["value"]) {
    this.value = v;
  }
}

export class ListWidget extends AbstractWidget {
  protected widgetValues: WidgetValue[];
  datasourceHandler: AbstractSparqlListHandler | ListHook;
  sort: boolean;
  selectHtml: JQuery<HTMLElement>;
  constructor(
    parentComponent: WidgetWrapper,
    listHandler: AbstractSparqlListHandler | ListHook,
    sort: boolean,
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
    this.datasourceHandler = listHandler;
    this.sort = sort;
    this.startClassVal = startClassVal;
    this.objectPropVal = objectPropVal;
    this.endClassVal = endClassVal;
  }

  render() {
    super.render();
    this.selectHtml = $(`<select></select>`);
    this.html.append(this.selectHtml);
    this.toggleSpinner(getSettings().langSearch.AutocompleteSpinner_Searching)
    if (this.datasourceHandler instanceof AbstractSparqlListHandler) {
      // asyncHandler requesting list from sparql endpoint
      this.#getDatasourceViaHandler(this.datasourceHandler,this.#renderItems).then((items)=>{
        this.#renderItems(items)
      })
    } else {
      // local listhandler provided by the settings
      const items = this.#getDatasourceViaHook(this.datasourceHandler)
      this.#renderItems(items)
    }
   
    return this;
  }

  async #getDatasourceViaHandler(datasourceHandler:AbstractSparqlListHandler, cb:(items: any, sort:boolean)=> void) {
    // Request building MUST come before listUrl method
    // endpoint for url will change
    const requestOpt = datasourceHandler.buildHttpRequest()

    let url = datasourceHandler.listUrl(
      this.startClassVal.type,
      this.objectPropVal.type,
      this.endClassVal.type
    );
    let temp = new LocalCacheData();
    //this.toggleSpinner()
    let fetchpromise = await temp.fetch(url, requestOpt, getSettings().localCacheDataTtl);
    console.log('databack')
    let data = await fetchpromise.json()
    console.log('return data')
    const items = datasourceHandler.listLocation(
      this.startClassVal.type,
      this.objectPropVal.type,
      this.endClassVal.type,
      data
    );
    return items
  }

  #getDatasourceViaHook (datasourceHandler:ListHook) {
    const items = datasourceHandler.listLocation(
      this.startClassVal.type,
      this.objectPropVal.type,
      this.endClassVal.type,
      null
    );
   return items
  }

  #renderItems(items:any) {
    console.log('render Items')
    console.log(items.length)
    if (items.length > 0) {
      this.toggleSpinner('')
      if (this.sort) {
        // here, if we need to sort, then sort according to lang
        var collator = new Intl.Collator(getSettings().language);
        items.sort((a: any, b: any) => {
          return collator.compare(
            this.datasourceHandler.elementLabel(a),
            this.datasourceHandler.elementLabel(b)
          );
        });
      }

      $.each(items, (key, val) => {
        var label = this.datasourceHandler.elementLabel(val);
        var uri = this.datasourceHandler.elementUri(val);
        this.selectHtml.append(
          $("<option value='" + uri + "'>" + label + "</option>")
        );
      });
      if (items.length < 20) {
        this.selectHtml.niceSelect();
        this.selectHtml.on("change", (e: Event) => {
          let option = (e.currentTarget as HTMLSelectElement)
            .selectedOptions;
          if (option.length > 1)
            throw Error(
              "List widget should allow only for one el to be selected!"
            );
          let listWidgetValue: WidgetValue = this.buildValue(option[0].value, option[0].label);
          this.renderWidgetVal(listWidgetValue);
        });
      } else {
        this.selectHtml = this.selectHtml.select2();
        this.selectHtml.on("select2:close", (e: any) => {
          let option = (e.currentTarget as HTMLSelectElement)
            .selectedOptions;
          if (option.length > 1)
            throw Error(
              "List widget should allow only for one el to be selected!"
            );

            let listWidgetValue: WidgetValue = this.buildValue(option[0].value, option[0].label);
            this.renderWidgetVal(listWidgetValue);
        });
      }
    } else {
      console.log('else')
      this.toggleSpinner(getSettings().langSearch.ListWidgetNoItem)
    }
  }

  // separate the creation of the value from the widget code itself
  // so that it can be overriden by LiteralListWidget
  buildValue(uri:string,label:string): WidgetValue {
    return new ListWidgetValue({
      label: label,
      uri: uri,
    });
  }

  parseInput(input:ListWidgetValue["value"]): WidgetValue { return new ListWidgetValue(input) }


  /**
   * @returns  true if the number of values is 1, in which case the widget will handle the generation of the triple itself,
   * not using a VALUES clause; returns false otherwise.
   */
  isBlockingObjectProp() {
    return (this.widgetValues.length == 1);
  }

  /**
   * @returns  true if at least one value is selected, in which case we don't need to insert an rdf:type constraint
   * on the end class
   */
   isBlockingEnd(): boolean {
    return (this.widgetValues.length > 0);
   }


   getRdfJsPattern(): Pattern[] {
    if(this.widgetValues.length == 1) {
      let singleTriple: Triple = SparqlFactory.buildTriple(
        DataFactory.variable(this.getVariableValue(this.startClassVal)),
        DataFactory.namedNode(this.objectPropVal.type),
        DataFactory.namedNode((this.widgetValues[0] as ListWidgetValue).value.uri)
      );

      let ptrn: BgpPattern = {
        type: "bgp",
        triples: [singleTriple],
      };
      return [ptrn];
    } else {
      let vals = (this.widgetValues as ListWidgetValue[]).map((v) => {
        let vl: ValuePatternRow = {};
        vl[this.endClassVal.variable] = DataFactory.namedNode(v.value.uri);
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
