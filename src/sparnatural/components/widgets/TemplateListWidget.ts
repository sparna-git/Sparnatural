import { SelectedVal } from "../SelectedVal";
import { DataFactory } from 'rdf-data-factory';
import "select2";
import { I18n } from "../../settings/I18n";
import { HTMLComponent } from "../HtmlComponent";
import { ListDataProviderIfc, RdfTermDatasourceItem, ValuesListDataProviderIfc } from "../datasources/DataProviders";
import { NoOpListDataProvider } from "../datasources/NoOpDataProviders";
import { RdfTermCriteria, LabelledCriteria } from "../../SparnaturalQueryIfc";
import { AbstractWidget, ValueRepetition } from "./AbstractWidget";
import { mergeDatasourceResults } from "../datasources/SparqlDataProviders";
import { ListWidget } from "./ListWidget";
import { Term } from "@rdfjs/types/data-model";

const factory = new DataFactory();

export interface TemplateListConfiguration {
  dataProvider: ListDataProviderIfc | ValuesListDataProviderIfc,
  values?: Term[]
}

export class TemplateListWidget extends AbstractWidget {

  // The default implementation of TemplateListConfiguration
  static defaultConfiguration: TemplateListConfiguration = {
    dataProvider: new NoOpListDataProvider(),
    values: undefined
  }

  selectHtml: JQuery<HTMLElement>;

  configuration: TemplateListConfiguration;

  constructor(
    parentComponent: HTMLComponent,
    config: TemplateListConfiguration,
    startClassVal: SelectedVal,
    objectPropVal: SelectedVal,
    endClassVal: SelectedVal
  ) {
    super(
      "template-list-widget",
      parentComponent,
      null,
      startClassVal,
      objectPropVal,
      endClassVal,
      ValueRepetition.MULTIPLE
    );

    this.configuration = config;
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

        // Check if we have a template for this property
        const templateId = this.objectPropVal.type + "-template";
        const templateElement = document.getElementById(templateId);
        const useTemplate = templateElement !== null;

        console.log(`TemplateListWidget: useTemplate=${useTemplate} for id ${templateId}`);
        if(groups.length == 1 && groups[0] == undefined) {
          // no groups were defined at all
          items.forEach(item => {
            // select item label : either displayed label, or itemLabel if provided
            let itemLabel = item.itemLabel?item.itemLabel:item.label;
            
            if (useTemplate) {
              // Use the template to render the option
              const optionValue = JSON.stringify(item.term);
              const templateContent = this.#renderTemplate(templateElement, item);
              this.selectHtml.append(
                $(`<option value='${optionValue}' data-itemLabel='${itemLabel}'>${templateContent}</option>`)
              );
            } else {
              // Fall back to ListWidget behavior
              this.selectHtml.append(
                $("<option value='" + JSON.stringify(item.term) + "' data-itemLabel='"+itemLabel+"'>" + item.label + "</option>")
              );
            }
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
              
              if (useTemplate) {
                // Use the template to render the option
                const optionValue = JSON.stringify(item.term);
                const templateContent = this.#renderTemplate(templateElement, item);
                html += `<option value='${optionValue}' data-itemLabel='${itemLabel}'>${templateContent}</option>`;
              } else {
                // Fall back to ListWidget behavior
                html += "<option value='" + JSON.stringify(item.term) + "' data-itemLabel='"+itemLabel+"'>" + item.label + "</option>";
              }
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
        if (useTemplate) {
          select2Config.templateResult = (item: any): JQuery<HTMLElement> => {
            console.log("templateResult called for item: ", item);
            if (item.loading) {
              return item.text;
            }
            
            // Find the corresponding item from our items array
            const foundItem = items.find(i => JSON.stringify(i.term) === item.id);
            if (foundItem) {
              console.log(this.#renderTemplate(templateElement, foundItem), "rendered template for item: ", foundItem);
              return $(this.#renderTemplate(templateElement, foundItem)) as JQuery<HTMLElement> ;
            }
            return item.text;
          };
          
          select2Config.templateSelection = (item: any): JQuery<HTMLElement>  => {
            if (item.id === '') {
              return I18n.labels.ListWidgetSelectValue;
            }
            
            // For selection, we can use the itemLabel or label
            const foundItem = items.find(i => JSON.stringify(i.term) === item.id);
            if (foundItem) {
              let itemLabel = foundItem.itemLabel ? foundItem.itemLabel : foundItem.label;
              return $(`<span>${itemLabel}</span>`) as JQuery<HTMLElement>;
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

  /**
   * Renders a template with the given item data
   * @param templateElement The template element containing the template string
   * @param item The datasource item to render
   * @returns The rendered HTML string
   */
  #renderTemplate(templateElement: HTMLElement, item: RdfTermDatasourceItem): string {
    const templateContent = templateElement.outerHTML;
    
    // Create a data object that includes all properties from the item
    const data: any = {
      term: item.term,
      label: item.label,
      group: item.group,
      itemLabel: item.itemLabel,
      // Add all extra bindings to the data object
      ...this.#extraBindingsToObject(item.extraBindings)
    };
    
    // Simple template replacement using ${variable} syntax
    // This is a basic implementation that can be enhanced with handlebars if needed
    let result = templateContent;
    
    // Replace ${data.variableName} patterns
    for (const [key, value] of Object.entries(data)) {
      const placeholder = `${key}`;
      // Handle both ${data.key} and ${key} patterns
      result = result.replace(new RegExp(`\\$\\{${placeholder}\\}`, 'g'), this.#formatTermValue(value));
    }
    
    return result;
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

  /**
   * Formats a term value for display in the template
   */
  #formatTermValue(value: any): string {
    if (!value) return '';
    
    // If it's an RDFTerm object
    if (value && typeof value === 'object' && 'type' in value && 'value' in value) {
      return value.value;
    }
    
    // If it's already a string
    if (typeof value === 'string') {
      return value;
    }
    
    // For any other type, convert to string
    return String(value);
  }

  parseInput(input:LabelledCriteria<RdfTermCriteria>): LabelledCriteria<RdfTermCriteria> { return input }

}
