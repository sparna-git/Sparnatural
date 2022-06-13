import { BaseExpression, Expression, Pattern } from "sparqljs";
import { SelectedVal } from "../../../../../../sparql/ISparJson";
import WidgetWrapper from "../WidgetWrapper";
import { AbstractWidget, ValueType, WidgetValue } from "./AbstractWidget";

interface AutoCompleteWidgetValue extends WidgetValue{
    value:{
        label:string,
        key:string,
        uri:string
    }
}

export class AutoCompleteWidget extends AbstractWidget {
    autocompleteHandler: any;
    startClassVal: SelectedVal;
    objectPropVal: SelectedVal;
    endClassVal: SelectedVal;
  
    constructor(parentComponent: WidgetWrapper, autocompleteHandler: any,startClassValue:SelectedVal,objectPropVal:SelectedVal,endClassValue:SelectedVal) {
      super('autocomplete-widget',parentComponent,null)
      this.autocompleteHandler = autocompleteHandler;
      this.startClassVal = startClassValue
      this.objectPropVal = objectPropVal
      this.endClassVal = endClassValue
    }
  
    render() {
      super.render()
      let inputHtml = $(`<input class="autocompleteinput"/>`)
      let listHtml = $(`<input class="inputvalue" type="hidden"/>`)
      this.html.append(inputHtml)
      this.html.append(listHtml)
  
      var isMatch = this.autocompleteHandler.enableMatch(
        this.startClassVal.type,
        this.objectPropVal.type,
        this.endClassVal.type
      );
  
      let options = {
        // ajaxSettings: {crossDomain: true, type: 'GET'} ,
        url: function (phrase: any) {
          return this.autocompleteHandler.autocompleteUrl(
            this.startClassVal.type,
            this.objectPropVal.type,
            this.endClassVal.type,
            phrase
          );
        },
        listLocation: function (data: any) {
          return this.autocompleteHandler.listLocation(
            this.startClassVal.type,
            this.objectPropVal.type,
            this.endClassVal.type,
            data
          );
        },
        getValue: function (element: any) {
          return this.autocompleteHandler.elementLabel(element);
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
          data.phrase = inputHtml.val()
          return data;
        },
  
        list: {
          match: {
            enabled: isMatch,
          },
  
          onChooseEvent:  ()=> {
            let val = inputHtml.getSelectedItemData();
            let autocompleteValue:AutoCompleteWidgetValue = {
              valueType: ValueType.SINGLE,
              value: {
                key:this.autocompleteHandler.elementUri(val),
                label:this.autocompleteHandler.elementLabel(val),
                uri: this.autocompleteHandler.elementUri(val)
              }

            }
            inputHtml.val(autocompleteValue.value.label);
            listHtml
              .val(autocompleteValue.value.uri)
              .trigger("change");
              this.renderWidgetVal(autocompleteValue)
          },
        },
        requestDelay: 400,
      };
      //Need to add in html befor
  
      inputHtml.easyAutocomplete(options);
      return this
    }

    getRdfJsPattern(): Pattern[] {
        throw new Error("Method not implemented.");
    }
  }
  