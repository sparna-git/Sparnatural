import * as DataFactory from "@rdfjs/data-model" ;
import { BgpPattern, Pattern, Triple, ValuePatternRow, ValuesPattern } from "sparqljs";
import { SelectedVal } from "../../../generators/ISparJson";
import SparqlFactory from "../../../generators/SparqlFactory";
import WidgetWrapper from "../../builder-section/groupwrapper/criteriagroup/edit-components/WidgetWrapper";
import { AbstractWidget, ValueRepetition, WidgetValue } from "../AbstractWidget";
import { AbstractSparqlAutocompleteHandler } from "./AutocompleteAndListHandlers";

require("easy-autocomplete");

export class AutoCompleteWidgetValue implements WidgetValue {
  value: {
    label: string;
    uri: string;
  };

  key():string {
    return this.value.uri;
  }

  constructor(v:AutoCompleteWidgetValue["value"]) {
    this.value = v;
  }
}

export class AutoCompleteWidget extends AbstractWidget {
  protected widgetValues: AutoCompleteWidgetValue[];
  protected datasourceHandler: AbstractSparqlAutocompleteHandler;
  protected langSearch: any;

  constructor(
    parentComponent: WidgetWrapper,
    autocompleteHandler: any,
    langSearch: any,
    subjectValue: SelectedVal,
    objectPropVal: SelectedVal,
    endClassValue: SelectedVal
  ) {
    super(
      "autocomplete-widget",
      parentComponent,
      null,
      subjectValue,
      objectPropVal,
      endClassValue,
      ValueRepetition.MULTIPLE
    );
    this.langSearch = langSearch;
    this.datasourceHandler = autocompleteHandler;
  }

  render() {
    super.render();
    let inputHtml = $(`<input class="autocompleteinput"/>`);
    let listHtml = $(`<input class="inputvalue" type="hidden"/>`);
    this.html.append(inputHtml);
    this.html.append(listHtml);

    var isMatch = this.datasourceHandler.enableMatch(
      this.subjectVal.type,
      this.objectPropVal.type,
      this.objectVal.type
    );

    let options = {
      // ajaxSettings: {crossDomain: true, type: 'GET'} ,
      url: (phrase: any) => {
        return this.datasourceHandler.autocompleteUrl(
          this.subjectVal.type,
          this.objectPropVal.type,
          this.objectVal.type,
          phrase
        );
      },
      listLocation: (data: any) => {
        return this.datasourceHandler.listLocation(
          this.subjectVal.type,
          this.objectPropVal.type,
          this.objectVal.type,
          data
        );
      },
      getValue: (element: any) => {
        return this.datasourceHandler.elementLabel(element);
      },

      adjustWidth: false,

      ajaxSettings: {
        crossDomain: true,
        timeout: 7000,
        dataType: "json",
        method: "GET",
        data: {
          dataType: "json",
        },
        beforeSend: ( xhr: { abort: () => void; }, obj: { data: boolean; } ) => {

          if (obj.data == false) {
            xhr.abort();
            this.spinner.renderMessage(this.langSearch.AutocompleteSpinner_3Chars)
          } else {          
            this.toggleSpinner(this.langSearch.AutocompleteSpinner_Searching)
          }
        },
        error: ( xhr: any ) => {
          this.toggleSpinner(this.langSearch.AutocompleteSpinner_NoResults)
        },
        success: (data: any ) => {
          var results = this.datasourceHandler.listLocation(this.subjectVal, this.objectPropVal, this.objectVal, data)
          if (results.length == 0) {
            this.toggleSpinner(this.langSearch.AutocompleteSpinner_NoResults);
          } else {
            this.toggleSpinner('')
          }
        },
        complete: ( xhr: any ) => {
          //nothing
        }
      },

      preparePostData: function (data: { phrase: string | number | string[] }) {
        data.phrase = inputHtml.val() as string; // (!) numbers won't work
        if (data.phrase.length < 3) {
          return false ;
        }
        return data;
      },

      list: {
        match: {
          enabled: isMatch,
        },

        onChooseEvent: () => {
          let val = inputHtml.getSelectedItemData() as any;
          let autocompleteValue= new AutoCompleteWidgetValue({
              label: this.datasourceHandler.elementLabel(val),
              uri: this.datasourceHandler.elementUri(val),
          });
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

  parseInput(input: AutoCompleteWidgetValue["value"]): AutoCompleteWidgetValue {return new AutoCompleteWidgetValue(input)}

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
        DataFactory.variable(this.getVariableValue(this.subjectVal)),
        DataFactory.namedNode(this.objectPropVal.type),
        DataFactory.namedNode((this.widgetValues[0] as AutoCompleteWidgetValue).value.uri)
      );

      let ptrn: BgpPattern = {
        type: "bgp",
        triples: [singleTriple],
      };
  

      return [ptrn];
    } else {
      let vals = (this.widgetValues as AutoCompleteWidgetValue[]).map((v) => {
        let vl: ValuePatternRow = {};
        vl[this.objectVal.variable] = DataFactory.namedNode(v.value.uri);
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
