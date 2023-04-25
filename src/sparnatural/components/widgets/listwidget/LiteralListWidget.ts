import { Pattern } from "sparqljs";
import { SelectedVal } from "../../../generators/ISparJson";
import WidgetWrapper from "../../builder-section/groupwrapper/criteriagroup/edit-components/WidgetWrapper";

import * as DataFactory from "@rdfjs/data-model" ;
import { Literal, Variable } from "@rdfjs/types";

import "select2";
import "select2/dist/css/select2.css";
import { ListWidget } from "./ListWidget";
import SparqlFactory from "../../../generators/SparqlFactory";
import { ListDataProviderFromLiteralListAdpater, ListDataProviderIfc, LiteralListDataProviderIfc } from "../data/DataProviders";
import { WidgetValue } from "../AbstractWidget";

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
    dataProvider: LiteralListDataProviderIfc,
    sort: boolean,
    startClassVal: SelectedVal,
    objectPropVal: SelectedVal,
    endClassVal: SelectedVal
  ) {
    super(
      parentComponent,
      new ListDataProviderFromLiteralListAdpater(dataProvider),
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

  /**
   * 
   * @returns As we are generating a FILTER for literal lists, never block the object prop
   */
  isBlockingObjectProp() {
    return false;
  }

  /**
   * Yes, I know it's weird but you MUST NOT block end here, otherwise the intersection triple is not generated
   * @returns 
   */
  isBlockingEnd(): boolean {
    return true;
   }

  getRdfJsPattern(): Pattern[] {
    let vals : Literal[] = (this.widgetValues as LiteralListWidgetValue[]).map((v) => {
      return DataFactory.literal(v.value.literal)
    });
    return [SparqlFactory.buildFilterStrInOrEquals(vals, DataFactory.variable(this.getVariableValue(this.endClassVal)))];
  }
}
