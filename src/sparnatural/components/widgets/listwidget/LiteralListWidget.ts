import { Pattern, ValuePatternRow, ValuesPattern } from "sparqljs";
import { SelectedVal } from "../../../generators/ISparJson";
import { SparqlTemplateListHandler } from "../autocomplete/AutocompleteAndListHandlers";
import WidgetWrapper from "../../builder-section/groupwrapper/criteriagroup/edit-components/WidgetWrapper";

import * as DataFactory from "@rdfjs/data-model" ;
import { Literal, Variable } from "@rdfjs/types";

import "select2";
import "select2/dist/css/select2.css";
import { ListWidget } from "./ListWidget";
import { ValueRepetition, WidgetValue } from "../AbstractWidget";
import SparqlFactory from "../../../generators/SparqlFactory";

export class LiteralListWidgetValue implements WidgetValue {
  value: {
    label: string;
    literal: string;
  };

  key():string {
    return this.value.literal;
  }

  constructor(v:LiteralListWidgetValue["value"]) {
    this.value = v;
  }
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
    return new LiteralListWidgetValue({
      label: label,
      literal: label,
    });
  }

  parseInput(input:LiteralListWidgetValue["value"]): WidgetValue { return new LiteralListWidgetValue(input); }

  getRdfJsPattern(): Pattern[] {
    /*
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
    */
    let vals : Literal[] = (this.widgetValues as LiteralListWidgetValue[]).map((v) => {
      return DataFactory.literal(v.value.literal)
    });
    return [SparqlFactory.buildFilterStrInOrEquals(vals, DataFactory.variable(this.getVariableValue(this.endClassVal)))];
  }
}
