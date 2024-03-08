import { DataFactory } from 'rdf-data-factory';
import { BgpPattern, Pattern, ValuePatternRow, ValuesPattern } from "sparqljs";
import { SelectedVal } from "../../generators/ISparJson";
import WidgetWrapper from "../builder-section/groupwrapper/criteriagroup/edit-components/WidgetWrapper";
import { AbstractWidget, ValueRepetition, WidgetValue } from "./AbstractWidget";
import { SelectAllValue } from "../builder-section/groupwrapper/criteriagroup/edit-components/EditComponents";
import EndClassGroup from "../builder-section/groupwrapper/criteriagroup/startendclassgroup/EndClassGroup";
import { I18n } from '../../settings/I18n';

const factory = new DataFactory();

export class NumberWidgetValue implements WidgetValue {
  value: {
    label: string;
    min: number;
    max: number,
  }

  key():string {
    return ""+this.value.min+"-"+this.value.max;
  }

  constructor(v:NumberWidgetValue["value"]) {
    this.value = v;
  }
}

export class NumberWidget extends AbstractWidget {
  protected widgetValues: NumberWidgetValue[];
  constructor(
    parentComponent: WidgetWrapper,
    startClassVal: SelectedVal,
    objectPropVal: SelectedVal,
    endClassVal: SelectedVal
  ) {
    super(
      "number-widget",
      parentComponent,
      null,
      startClassVal,
      objectPropVal,
      endClassVal,
      ValueRepetition.SINGLE
    );
  }

  render() {
    super.render();
    let testSpan = $(
      `<span>Hello this is number widget</span>'`
    );
    this.html.append(testSpan);

    return this;
  }

  parseInput(input: NumberWidgetValue["value"]): NumberWidgetValue {
    return new NumberWidgetValue(input);
   }

   /**
    * Blocks if a value is selected and this is not the "all" special value
    * @returns true
    */
   isBlockingObjectProp() {
    return (
      this.widgetValues.length == 1
      &&
      !(this.widgetValues[0] instanceof SelectAllValue)
      &&
      !((this.ParentComponent.ParentComponent.ParentComponent as EndClassGroup).isVarSelected())
    );
   }

  getRdfJsPattern(): Pattern[] {
    return [];
  }
}
