import { Pattern, ValuePatternRow, ValuesPattern } from "sparqljs";
import ISettings from "../../../configs/client-configs/ISettings";
import { getSettings } from "../../../configs/client-configs/settings";
import LocalCacheData from "../../datastorage/LocalCacheData";
import { SelectedVal } from "../../generators/ISparJson";
import { SparqlTemplateListHandler } from "./autocomplete/AutocompleteAndListHandlers";
import WidgetWrapper from "../builder-section/groupwrapper/criteriagroup/edit-components/WidgetWrapper";
import { AbstractWidget, ValueType, WidgetValue } from "./AbstractWidget";
import * as DataFactory from "@rdfjs/data-model" ;

import "select2";
import "select2/dist/css/select2.css";
import { ListWidget } from "./ListWidget";

export interface LiteralListWidgetValue extends WidgetValue {
  value: {
    key: string;
    label: string;
    literal: string;
  };
  valueType: ValueType.MULTIPLE;
}

export class LiteralListWidget extends ListWidget {
  constructor(
    parentComponent: WidgetWrapper,
    listHandler: SparqlTemplateListHandler,
    sort: boolean,
    startClassVal: SelectedVal,
    objectPropVal: SelectedVal,
    endClassVal: SelectedVal
  ) {
    super(
      parentComponent,
      listHandler,
      sort,
      startClassVal,
      objectPropVal,
      endClassVal
    );
  }

  buildValue(uri:string,label:string): WidgetValue {
    return {
      valueType: ValueType.MULTIPLE,
      value: {
        key: uri,
        label: label,
        literal: label,
      }
    } as LiteralListWidgetValue
  }

  parseInput(input:WidgetValue): WidgetValue { return input as LiteralListWidgetValue }

  getRdfJsPattern(): Pattern[] {
    let vals = (this.widgetValues as LiteralListWidgetValue[]).map((v) => {
      let vl: ValuePatternRow = {};
      vl[this.endClassVal.variable] = DataFactory.literal(v.value.literal);
      return vl;
    });
    let valuePattern: ValuesPattern = {
      type: "values",
      values: vals,
    };
    return [valuePattern];
  }
}
