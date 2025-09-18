import { DataFactory } from 'rdf-data-factory';
import { SelectedVal } from "../SelectedVal";
import { AbstractWidget, ValueRepetition } from "./AbstractWidget";
import { I18n } from '../../settings/I18n';
import { HTMLComponent } from '../HtmlComponent';
import { CriteriaValue } from '../../SparnaturalQueryIfc';

const factory = new DataFactory();

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
      let widgetValue:CriteriaValue = {
        label: I18n.labels.true,
        value: {
          boolean: true
        }
        
      };

      this.triggerRenderWidgetVal(widgetValue);
    });

    falseSpan[0].addEventListener("click", (e) => {
      let widgetValue: CriteriaValue = {
        label: I18n.labels.false,
        value: {
          boolean: false
        }
      };

      this.triggerRenderWidgetVal(widgetValue);
    });
    return this;
  }

  parseInput(input: CriteriaValue): CriteriaValue {
    return input;
   }

}
