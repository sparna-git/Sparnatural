import { BgpPattern, Pattern, Triple, ValuePatternRow, ValuesPattern } from "sparqljs";
import ISettings from "../../settings/ISettings";
import { getSettings } from "../../settings/defaultSettings";
import { SelectedVal } from "../../generators/ISparJson";
import WidgetWrapper from "../builder-section/groupwrapper/criteriagroup/edit-components/WidgetWrapper";
import { AbstractWidget, RDFTerm, ValueRepetition, WidgetValue } from "./AbstractWidget";
import * as DataFactory from "@rdfjs/data-model" ;
import "select2";
import "select2/dist/css/select2.css";
import SparqlFactory from "../../generators/SparqlFactory";
import EndClassGroup from "../builder-section/groupwrapper/criteriagroup/startendclassgroup/EndClassGroup";
import { ListDataProviderIfc } from "./data/DataProviders";

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

export class ListWidget extends AbstractWidget {

  dataProvider: ListDataProviderIfc;

  protected widgetValues: WidgetValue[];
  sort: boolean;
  settings: ISettings;
  selectHtml: JQuery<HTMLElement>;

  constructor(
    parentComponent: WidgetWrapper,
    dataProvider: ListDataProviderIfc,
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

    this.dataProvider = dataProvider;
    this.sort = sort;
    this.startClassVal = startClassVal;
    this.objectPropVal = objectPropVal;
    this.endClassVal = endClassVal;
  }

  render() {
    super.render();
    this.selectHtml = $(`<select></select>`);
    let noItemsHtml =
      $(`<div class="no-items" style="display: none; font-style:italic;">
      ${getSettings().langSearch.ListWidgetNoItem}
    </div>`);
    this.html.append(this.selectHtml);

    let callback = (items:{term:RDFTerm;label:string}[]) => {

      if (items.length > 0) {
        if (this.sort) {
          // here, if we need to sort, then sort according to lang
          var collator = new Intl.Collator(this.settings.language);
          items.sort((a: any, b: any) => {
            return collator.compare(
              a.label,
              b.label
            );
          });
        }
  
        $.each(items, (key, item) => {
          this.selectHtml.append(
            $("<option value='" + JSON.stringify(item.term) + "'>" + item.label + "</option>")
          );
        });

        // use the minimumResultsForSearch parameter to avoid using a search box when only a few items are present
        this.selectHtml = this.selectHtml.select2({
          minimumResultsForSearch: 20}
        );

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
    }

    this.dataProvider.getListContent(
      this.startClassVal.type,
      this.objectPropVal.type,
      this.endClassVal.type,
      this.settings.language,
      this.settings.defaultLanguage,
      this.settings.typePredicate,
      callback
    );

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
        DataFactory.variable(this.getVariableValue(this.startClassVal)),
        DataFactory.namedNode(this.objectPropVal.type),
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
