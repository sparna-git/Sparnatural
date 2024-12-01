import { DataFactory } from 'rdf-data-factory';
import { BgpPattern, Pattern, ValuePatternRow, ValuesPattern } from "sparqljs";
import { SelectedVal } from "../SelectedVal";
import { AbstractWidget, ValueRepetition, WidgetValue } from "./AbstractWidget";
import { SelectAllValue } from "../builder-section/groupwrapper/criteriagroup/edit-components/EditComponents";
import EndClassGroup from "../builder-section/groupwrapper/criteriagroup/startendclassgroup/EndClassGroup";
import { I18n } from '../../settings/I18n';
import HTMLComponent from '../HtmlComponent';

const factory = new DataFactory();

export class BooleanWidgetValue implements WidgetValue {
  value: {
    label: string;
    boolean: boolean;
  }

  key():string {
    return this.value.boolean.toString();
  }

  constructor(v:BooleanWidgetValue["value"]) {
    this.value = v;
  }
}

export class BooleanWidget extends AbstractWidget {

  constructor(
    parentComponent: HTMLComponent,
    startClassVal: SelectedVal,
    objectPropVal: SelectedVal,
    endClassVal: SelectedVal
  ) {
    super(
      "boolean-widget",
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
    let trueSpan = $(
      `<span class="boolean-value">${I18n.labels.true}</span>'`
    );
    let orSpan = $(`<span class="or">&nbsp;${I18n.labels.Or}&nbsp;</span>`);
    let falseSpan = $(
      `<span class="boolean-value"">${I18n.labels.false}</span>`
    );
    this.html.append(trueSpan).append(orSpan).append(falseSpan);

    trueSpan[0].addEventListener("click", (e) => {
      let widgetValue: BooleanWidgetValue = new BooleanWidgetValue({
        label: I18n.labels.true,
        boolean: true,
      });

      this.triggerRenderWidgetVal(widgetValue);
    });

    falseSpan[0].addEventListener("click", (e) => {
      let widgetValue: BooleanWidgetValue = new BooleanWidgetValue({
        label: I18n.labels.false,
        boolean: false,
      });

      this.triggerRenderWidgetVal(widgetValue);
    });
    return this;
  }

  parseInput(input: BooleanWidgetValue["value"]): BooleanWidgetValue {
    return new BooleanWidgetValue(input);
   }

}
