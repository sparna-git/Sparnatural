import * as DataFactory from "@rdfjs/data-model" ;
import { BgpPattern, Pattern, Triple, ValuePatternRow, ValuesPattern } from "sparqljs";
import { SelectedVal } from "../../generators/ISparJson";
import SparqlFactory from "../../generators/SparqlFactory";
import WidgetWrapper from "../builder-section/groupwrapper/criteriagroup/edit-components/WidgetWrapper";
import { AbstractWidget, RDFTerm, ValueRepetition, WidgetValue } from "./AbstractWidget";
import EndClassGroup from "../builder-section/groupwrapper/criteriagroup/startendclassgroup/EndClassGroup";
import { AutocompleteDataProviderIfc } from "./data/DataProviders";

require("easy-autocomplete");

export class AutoCompleteWidgetValue implements WidgetValue {
  value: {
    label: string;
    rdfTerm: RDFTerm
  };

  key():string {
    return this.value.rdfTerm.value;
  }

  constructor(v:AutoCompleteWidgetValue["value"]) {
    this.value = v;
  }
}

export class AutoCompleteWidget extends AbstractWidget {
  protected widgetValues: AutoCompleteWidgetValue[];
  protected dataProvider: AutocompleteDataProviderIfc;
  protected langSearch: any;

  constructor(
    parentComponent: WidgetWrapper,
    dataProvider: AutocompleteDataProviderIfc,
    langSearch: any,
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
      endClassValue,
      ValueRepetition.MULTIPLE
    );
    this.langSearch = langSearch;
    this.dataProvider = dataProvider;
  }

  render() {
    super.render();
    let inputHtml = $(`<input class="autocompleteinput"/>`);
    // let listHtml = $(`<input class="inputvalue" type="hidden"/>`);
    this.html.append(inputHtml);
    // this.html.append(listHtml);


    let options = {
   
      // ajaxSettings: {crossDomain: true, type: 'GET'} ,
      url: (phrase: any) => {
        return this.dataProvider.autocompleteUrl(
          this.startClassVal.type,
          this.objectPropVal.type,
          this.endClassVal.type,
          phrase,
          this.settings.queryLanguage,
          this.settings.typePredicate
        );
      },
   
      listLocation: (data: any) => {
        return this.dataProvider.listLocation(data);
      },
   
      getValue: (element: any) => {
        return this.dataProvider.elementLabel(element);
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
          var results = this.dataProvider.listLocation(data)
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
          enabled: false,
        },

        onChooseEvent: () => {
          let val = inputHtml.getSelectedItemData() as any;
          let autocompleteValue= new AutoCompleteWidgetValue({
              label: this.dataProvider.elementLabel(val),
              rdfTerm: this.dataProvider.elementRdfTerm(val),
          });
          inputHtml.val(autocompleteValue.value.label);
          // listHtml.val(autocompleteValue.value.uri).trigger("change");
          this.renderWidgetVal(autocompleteValue);
        },
      },
      requestDelay: 400,
    };

    inputHtml.easyAutocomplete(options);
    return this;
  }

  parseInput(input: AutoCompleteWidgetValue["value"]): AutoCompleteWidgetValue {return new AutoCompleteWidgetValue(input)}

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
    return (this.widgetValues.length > 0);
   }


  getRdfJsPattern(): Pattern[] {
    if(this.isBlockingObjectProp()) {
      let singleTriple: Triple = SparqlFactory.buildTriple(
        DataFactory.variable(this.getVariableValue(this.startClassVal)),
        DataFactory.namedNode(this.objectPropVal.type),
        this.rdfTermToSparqlQuery((this.widgetValues[0] as AutoCompleteWidgetValue).value.rdfTerm)
      );

      let ptrn: BgpPattern = {
        type: "bgp",
        triples: [singleTriple],
      };
  

      return [ptrn];
    } else {
      let vals = (this.widgetValues as AutoCompleteWidgetValue[]).map((v) => {
        let vl: ValuePatternRow = {};
        vl[this.endClassVal.variable] = this.rdfTermToSparqlQuery(v.value.rdfTerm);
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
