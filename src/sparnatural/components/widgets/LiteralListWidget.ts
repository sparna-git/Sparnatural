import { Pattern, ValuePatternRow, ValuesPattern } from "sparqljs";
import { SelectedVal } from "../../generators/ISparJson";
import { SparqlTemplateListHandler } from "./autocomplete/AutocompleteAndListHandlers";
import WidgetWrapper from "../builder-section/groupwrapper/criteriagroup/edit-components/WidgetWrapper";

import * as DataFactory from "@rdfjs/data-model" ;

import "select2";
import "select2/dist/css/select2.css";
import { ListWidget } from "./ListWidget";
import { ValueRepetition, WidgetValue } from "./AbstractWidget";

export interface LiteralListWidgetValue extends WidgetValue {
  value: {
    key: string;
    label: string;
    literal: string;
  };
  valueRepetition: ValueRepetition.MULTIPLE;
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
      valueRepetition: ValueRepetition.MULTIPLE,
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
