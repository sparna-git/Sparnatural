import { DataFactory } from 'rdf-data-factory';
import { SelectedVal } from "../SelectedVal";
import { AbstractWidget, ValueRepetition } from "./AbstractWidget";

import Awesomplete from 'awesomplete';
import { I18n } from '../../settings/I18n';
import { HTMLComponent } from '../HtmlComponent';
import { AutocompleteDataProviderIfc, RdfTermDatasourceItem } from '../datasources/DataProviders';
import { NoOpAutocompleteProvider } from '../datasources/NoOpDataProviders';
import { mergeDatasourceResults } from '../datasources/SparqlDataProviders';
import { LabelledCriteria, RDFTerm, RdfTermCriteria } from '../../SparnaturalQueryIfc';
import { ItemTemplate } from './ItemTemplate';

const factory = new DataFactory();


export interface AutocompleteConfiguration {
  dataProvider: AutocompleteDataProviderIfc,
  maxItems: number
}

export class AutoCompleteWidget extends AbstractWidget {
  
  // The default implementation of AutocompleteConfiguration
  static defaultConfiguration: AutocompleteConfiguration = {
    dataProvider: new NoOpAutocompleteProvider(),
    maxItems:15
  }
  
  protected configuration: AutocompleteConfiguration;
  itemTemplate: ItemTemplate;

  constructor(
    parentComponent: HTMLComponent,
    configuration: AutocompleteConfiguration,
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
    this.configuration = configuration;
    this.itemTemplate = new ItemTemplate(objectPropVal, endClassValue);
  }

  render() {
    super.render();

    let inputHtml = $(`<input class="awesomplete"/>`);
    this.html.append(inputHtml);

    let errorHtml =
      $(`<div class="no-items" style="display: none; font-style:italic;">
      ${I18n.labels.ListWidgetNoItem}
    </div>`);

    // $( "#foo" )[ 0 ] is pulling the DOM element from the JQuery object
    // see https://learn.jquery.com/using-jquery-core/faq/how-do-i-pull-a-native-dom-element-from-a-jquery-object/
    const queryInput:HTMLElement = inputHtml[0];

    // items of the current suggestion list, keyed by their serialized RDF term
    const itemsByValue = new Map<string, RdfTermDatasourceItem>();

    let awesompleteOptions: Awesomplete.Options = {
      filter: () => { // We will provide a list that is already filtered ...
        return true;
      },
      sort: false,    // ... and sorted.
      minChars: 3,
      maxItems: this.configuration.maxItems,
      list: []
    };

    // if we have a template, use it for rendering, keeping the markup expected by Awesomplete
    if (this.itemTemplate.exists) {
      awesompleteOptions.item = (suggestion: any, input: string, index: number): HTMLElement => {
        let li = document.createElement("li");
        li.setAttribute("role", "option");
        li.setAttribute("aria-selected", "false");
        li.setAttribute("tabindex", "-1");
        li.id = awesomplete.ul.id + "_item_" + index;

        const item = itemsByValue.get(suggestion.value);
        li.innerHTML = item?this.itemTemplate.render(item):suggestion.label;
        return li;
      };
    }

    let awesomplete = new Awesomplete(queryInput, awesompleteOptions);


    // the callback called when proposals have been fetched, to populate the suggestion list
    let callback = (items:RdfTermDatasourceItem[]) => {

      // find distinct values of the 'group' binding
      const groups = [...new Set(items.map(item => item.group))];
      const hasGroups = !(groups.length == 1 && groups[0] == undefined);

      // when groups are used the same term can come from several datasets : merge them
      let displayedItems = hasGroups?mergeDatasourceResults(items):items;

      itemsByValue.clear();
      let list = new Array<{label:String, value:String}>();
      displayedItems.forEach(item => {
        // Awesomplete list will contain the label as 'label', and the RDFTerm JSON serialization as 'value'
        let value = JSON.stringify(item.term);
        itemsByValue.set(value, item);
        list.push({
          label: (item.group)?"<span title='"+item.group+"'>"+item.label+"</span>":item.label,
          value: value
        });
      });

      // toggle spinner
      if(list.length == 0) {
        this.toggleSpinner(I18n.labels.AutocompleteSpinner_NoResults);
      } else {
        this.toggleSpinner('')
      }

      // build final list
      awesomplete.list = list;
      awesomplete.evaluate();
    }

    let errorCallback = (payload:any) => {
      this.toggleSpinner(I18n.labels.AutocompleteSpinner_NoResults);
    }

    // when user selects a value from the autocompletion list...
    queryInput.addEventListener("awesomplete-selectcomplete", (event:Event) => {
      // fetch the autocomplete event payload, which is the JSON serialization of the RDFTerm
      let awesompleteEvent:{label:string, value:string} = (event as unknown as {text:{label:string, value:string}}).text;

      let autocompleteValue: LabelledCriteria<RdfTermCriteria> = {
          label: awesompleteEvent.label,
          criteria: {
            // parse back the RDFTerm as an object
            rdfTerm: (JSON.parse(awesompleteEvent.value) as RDFTerm),
          }          
      };

      // set the value on the criteria
      inputHtml.val(autocompleteValue.label);
      this.triggerRenderWidgetVal(autocompleteValue);
    });

    // add the behavior on the input HTML element to fetch the autocompletion value
    var autocompleteTimer = 0;
    queryInput.addEventListener("input", (event:Event) => {
      const phrase = (event.target as HTMLInputElement)?.value;
      // Process inputText as you want, e.g. make an API request.

      if(phrase.length >= 3) {

        // cancel the previously-set timer
        if (autocompleteTimer) {
          window.clearTimeout(autocompleteTimer);
        }

        autocompleteTimer = window.setTimeout(() => {
          this.toggleSpinner(I18n.labels.AutocompleteSpinner_Searching)
          this.configuration.dataProvider.getAutocompleteSuggestions(
            this.startClassVal.type,
            this.objectPropVal.type,
            this.endClassVal.type,
            phrase,
            callback,
            errorCallback
          );          
          }, 
          350
        );
      }
    });

    return this;
  }

  parseInput(input: LabelledCriteria<RdfTermCriteria>): LabelledCriteria<RdfTermCriteria> {return input;}

}

