import { Pattern, ValuePatternRow, ValuesPattern } from "sparqljs";
import ISettings from "../../../../../../../configs/client-configs/ISettings";
import { getSettings } from "../../../../../../../configs/client-configs/settings";
import LocalCacheData from "../../../../../../datastorage/LocalCacheData";
import { SelectedVal } from "../../../../../../sparql/ISparJson";
import { SparqlTemplateListHandler } from "../handlers/AutocompleteAndListHandlers";
import WidgetWrapper from "../WidgetWrapper";
import { AbstractWidget, ValueType, WidgetValue } from "./AbstractWidget";
import { DataFactory } from "n3";

import "select2";
import "select2/dist/css/select2.css";

export interface ListWidgetValue extends WidgetValue {
  value: {
    key: string;
    label: string;
    uri: string;
  };
  valueType: ValueType.MULTIPLE;
}

export class ListWidget extends AbstractWidget {
  protected widgetValues: ListWidgetValue[];
  listHandler: SparqlTemplateListHandler;
  sort: boolean;
  settings: ISettings;
  selectHtml: JQuery<HTMLElement>;
  constructor(
    parentComponent: WidgetWrapper,
    listHandler: SparqlTemplateListHandler,
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
      endClassVal
    );
    this.listHandler = listHandler;
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

    let url = this.listHandler.listUrl(
      this.startClassVal.type,
      this.objectPropVal.type,
      this.endClassVal.type
    );

    var headers = new Headers();
    headers.append(
      "Accept",
      "application/sparql-results+json, application/json, */*;q=0.01"
    );
    let init = {
      method: "GET",
      headers: headers,
      mode: "cors",
      cache: "default",
    };
    let temp = new LocalCacheData();
    let fetchpromise = temp.fetch(url, init, this.settings.localCacheDataTtl);
    fetchpromise
      .then((response: { json: () => any }) => response.json())
      .then((data: any) => {
        var items = this.listHandler.listLocation(
          this.startClassVal.type,
          this.objectPropVal.type,
          this.endClassVal.type,
          data
        );
        if (items.length > 0) {
          if (this.sort) {
            // here, if we need to sort, then sort according to lang
            var collator = new Intl.Collator(this.settings.language);
            items.sort((a: any, b: any) => {
              return collator.compare(
                this.listHandler.elementLabel(a),
                this.listHandler.elementLabel(b)
              );
            });
          }

          $.each(items, (key, val) => {
            var label = this.listHandler.elementLabel(val);
            var uri = this.listHandler.elementUri(val);
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
              let listWidgetValue: ListWidgetValue = {
                valueType: ValueType.MULTIPLE,
                value: {
                  key: option[0].value,
                  label: option[0].label,
                  uri: option[0].value,
                },
              };
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
              let listWidgetValue: ListWidgetValue = {
                valueType: ValueType.MULTIPLE,
                value: {
                  key: option[0].value,
                  label: option[0].label,
                  uri: option[0].value,
                },
              };
              this.renderWidgetVal(listWidgetValue);
            });
          }
        } else {
          this.html.append(noItemsHtml);
        }
      });
    return this;
  }

  getRdfJsPattern(): Pattern[] {
    let vals = this.widgetValues.map((v) => {
      let vl: ValuePatternRow = {};
      vl[this.endClassVal.variable] = DataFactory.literal(v.value.uri);
      return vl;
    });
    let valuePattern: ValuesPattern = {
      type: "values",
      values: vals,
    };
    return [valuePattern];
  }
}
