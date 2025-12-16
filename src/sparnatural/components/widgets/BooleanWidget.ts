import { DataFactory } from 'rdf-data-factory';
import { SelectedVal } from "../SelectedVal";
import { AbstractWidget, ValueRepetition } from "./AbstractWidget";
import { I18n } from '../../settings/I18n';
import { HTMLComponent } from '../HtmlComponent';
import { BooleanCriteria, LabelledCriteria } from '../../SparnaturalQueryIfc';

const factory = new DataFactory();

export interface BooleanConfiguration {
  existNotExist?: boolean;
}

export class BooleanWidget extends AbstractWidget {

  configuration: BooleanConfiguration;

  constructor(
    parentComponent: HTMLComponent,
    configuration: BooleanConfiguration,
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

    this.configuration = configuration;
  }

  render() {
    super.render();
    let trueSpan = $(
      `<span class="boolean-value">${this.configuration.existNotExist ? I18n.labels.exists : I18n.labels.true}</span>'`
    );
    let orSpan = $(`<span class="or">&nbsp;${I18n.labels.Or}&nbsp;</span>`);
    let falseSpan = $(
      `<span class="boolean-value"">${this.configuration.existNotExist ? I18n.labels.notExists : I18n.labels.true}</span>`
    );
    this.html.append(trueSpan).append(orSpan).append(falseSpan);

    trueSpan[0].addEventListener("click", (e) => {
      let widgetValue:LabelledCriteria<BooleanCriteria> = {
        label: this.configuration.existNotExist ? I18n.labels.exists : I18n.labels.true,
        criteria: {
          boolean: true
        }
        
      };

      this.triggerRenderWidgetVal(widgetValue);
    });

    falseSpan[0].addEventListener("click", (e) => {
      let widgetValue: LabelledCriteria<BooleanCriteria> = {
        label: this.configuration.existNotExist ? I18n.labels.notExists : I18n.labels.true,
        criteria: {
          boolean: false
        }
      };

      this.triggerRenderWidgetVal(widgetValue);
    });
    return this;
  }

  parseInput(input: LabelledCriteria<BooleanCriteria>): LabelledCriteria<BooleanCriteria> {
    return input;
   }

}
