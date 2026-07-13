import { SelectedVal } from "../SelectedVal";
import { AbstractWidget, ValueRepetition } from "./AbstractWidget";
import { DataFactory } from 'rdf-data-factory';
import "select2";
// This is necessary otherwise select2 is not styled correctly
import "select2/dist/css/select2.css";
import { I18n } from "../../settings/I18n";
import { Term } from "@rdfjs/types/data-model";
import { HTMLComponent } from "../HtmlComponent";
import { ListDataProviderIfc, RdfTermDatasourceItem, ValuesListDataProviderIfc } from "../datasources/DataProviders";
import { NoOpListDataProvider } from "../datasources/NoOpDataProviders";
import { mergeDatasourceResults } from "../datasources/SparqlDataProviders";
import { RDFTerm, RdfTermCriteria, LabelledCriteria } from "../../SparnaturalQueryIfc";
import Handlebars from "handlebars";

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
  templateElement: HTMLElement | null;
  #compiledTemplate: HandlebarsTemplateDelegate | null = null;

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

    this.templateElement = this.#findTemplateElement();
    if(this.templateElement) {
      this.#compiledTemplate = Handlebars.compile(this.templateElement.innerHTML);
    }
  }

  #findTemplateElement(): HTMLElement | null {
    var templateId = this.objectPropVal.type + "-template";
    var templateElement = document.getElementById(templateId);
    if(templateElement === null) {
      // try with the endClassVal.type as a fallback
      templateId = this.endClassVal.type + "-template";
      templateElement = document.getElementById(templateId);
    }


    return templateElement;
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

        // Configure select2 with template support
        const select2Config: any = {
          // use the minimumResultsForSearch parameter to avoid using a search box when only a few items are present
          minimumResultsForSearch: 20,
          width: "style"
        };

        // If we have a template, use it for rendering
        if (this.templateElement) {
          select2Config.templateResult = (item: any): JQuery<HTMLElement> => {
            console.log("templateResult called for item: ", item);
            if (item.loading) {
              return item.text;
            }
            
            // Find the corresponding item from our items array
            const foundItem = items.find(i => JSON.stringify(i.term) === item.id);
            if (foundItem) {
              return $(this.#render(foundItem)) as JQuery<HTMLElement> ;
            }
            return item.text;
          };
        }

        this.selectHtml.select2(select2Config);

        // set a listener for when a value is selected
        this.selectHtml.on("select2:close", (e: any) => {
          let option = (e.currentTarget as HTMLSelectElement).selectedOptions;
          if (option.length > 1)
            throw Error("List widget should allow only for one el to be selected!");

          // this is the placeholder
          if(option[0].value == "")
            return;

          let itemLabel = option[0].getAttribute("data-itemLabel");
          let listWidgetValue: LabelledCriteria<RdfTermCriteria> = ListWidget.buildValue(option[0].value, itemLabel);
          this.triggerRenderWidgetVal(listWidgetValue);
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


    return this;
  }

  #render(item: RdfTermDatasourceItem): string {
    console.log("Rendering item: ", item);
      // Use the compiled template to generate HTML
      if (this.#compiledTemplate) {
        return this.#compiledTemplate(item);
      } else {
        throw new Error("No compiled template available for rendering.");
      }
  }

  /**
   * Converts extraBindings Map to a plain object
   */
  #extraBindingsToObject(extraBindings: Map<string, any> | undefined): any {
    if (!extraBindings) return {};
    
    const result: any = {};
    extraBindings.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }

  // separate the creation of the value from the widget code itself
  // so that it can be overriden by LiteralListWidget
  public static buildValue(termString:string,label:string): LabelledCriteria<RdfTermCriteria> {
    let term = (JSON.parse(termString) as RDFTerm);
    return {
      label: label,
      criteria: { rdfTerm: term }
    };
  }

  parseInput(input:LabelledCriteria<RdfTermCriteria>): LabelledCriteria<RdfTermCriteria> { return input }


}
