import * as DataFactory from "@rdfjs/data-model" ;
import { BgpPattern, Pattern, ValuePatternRow, ValuesPattern } from "sparqljs";
import { SelectedVal } from "../../../../../../sparql/ISparJson";
import WidgetWrapper from "../WidgetWrapper";
import { AbstractWidget, ValueType, WidgetValue } from "./AbstractWidget";
require("easy-autocomplete");

interface AutoCompleteWidgetValue extends WidgetValue {
  value: {
    label: string;
    key: string;
    uri: string;
  };
}

export class AutoCompleteWidget extends AbstractWidget {
  protected widgetValues: AutoCompleteWidgetValue[];
  autocompleteHandler: any;

  constructor(
    parentComponent: WidgetWrapper,
    autocompleteHandler: any,
    startClassValue: SelectedVal,
    objectPropVal: SelectedVal,
    endClassValue: SelectedVal
  ) {
    super(
      "autocomplete-widget",
      parentComponent,
      null,
      startClassValue,
      objectPropVal,
      endClassValue
    );
    this.autocompleteHandler = autocompleteHandler;
  }

  render() {
    super.render();
    let inputHtml = $(`<input class="autocompleteinput"/>`);
    let listHtml = $(`<input class="inputvalue" type="hidden"/>`);
    this.html.append(inputHtml);
    this.html.append(listHtml);

    var isMatch = this.autocompleteHandler.enableMatch(
      this.startClassVal.type,
      this.objectPropVal.type,
      this.endClassVal.type
    );

    let that=this;
    let options = {
      // ajaxSettings: {crossDomain: true, type: 'GET'} ,
      url: function (phrase: any) {
        return that.autocompleteHandler.autocompleteUrl(
          that.startClassVal.type,
          that.objectPropVal.type,
          that.endClassVal.type,
          phrase
        );
      },
      listLocation: function (data: any) {
        return that.autocompleteHandler.listLocation(
          that.startClassVal.type,
          that.objectPropVal.type,
          that.endClassVal.type,
          data
        );
      },
      getValue: function (element: any) {
        return that.autocompleteHandler.elementLabel(element);
      },

      adjustWidth: false,

      ajaxSettings: {
        crossDomain: true,
        dataType: "json",
        method: "GET",
        data: {
          dataType: "json",
        },
      },

      preparePostData: function (data: { phrase: string | number | string[] }) {
        data.phrase = inputHtml.val();
        return data;
      },

      list: {
        match: {
          enabled: isMatch,
        },

        onChooseEvent: () => {
          let val = inputHtml.getSelectedItemData();
          let autocompleteValue: AutoCompleteWidgetValue = {
            valueType: ValueType.SINGLE,
            value: {
              key: this.autocompleteHandler.elementUri(val),
              label: this.autocompleteHandler.elementLabel(val),
              uri: this.autocompleteHandler.elementUri(val),
            },
          };
          inputHtml.val(autocompleteValue.value.label);
          listHtml.val(autocompleteValue.value.uri).trigger("change");
          this.renderWidgetVal(autocompleteValue);
        },
      },
      requestDelay: 400,
    };
    //Need to add in html befor

    inputHtml.easyAutocomplete(options);
    return this;
  }

  getRdfJsPattern(): Pattern[] {
    let vals = this.widgetValues.map((v) => {
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
