import { DataFactory } from "rdf-data-factory";
import { SelectedVal } from "../SelectedVal";
import { AbstractWidget, ValueRepetition } from "./AbstractWidget";
import { I18n } from "../../settings/I18n";
import { HTMLComponent } from "../HtmlComponent";
import { BooleanCriteria, LabelledCriteria } from "../../SparnaturalQueryIfc";

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
    endClassVal: SelectedVal,
  ) {
    super(
      "boolean-widget",
      parentComponent,
      null,
      startClassVal,
      objectPropVal,
      endClassVal,
      ValueRepetition.SINGLE,
    );

    this.configuration = configuration;
  }

  render() {
    super.render();
    let trueSpan = $(
      `<span class="boolean-value">${
        this.configuration.existNotExist ? I18n.labels.exists : I18n.labels.true
      }</span>`,
    );
    let orSpan = $(`<span class="or">&nbsp;${I18n.labels.Or}&nbsp;</span>`);
    let falseSpan = $(
      `<span class="boolean-value">${
        this.configuration.existNotExist
          ? I18n.labels.notExists
          : I18n.labels.false
      }</span>`,
    );
    this.html.append(trueSpan).append(orSpan).append(falseSpan);

    trueSpan[0].addEventListener("click", (e) => {
      this.triggerRenderWidgetVal(
        this.buildValueFromCriteria({ boolean: true }),
      );
    });

    falseSpan[0].addEventListener("click", (e) => {
      this.triggerRenderWidgetVal(
        this.buildValueFromCriteria({ boolean: false }),
      );
    });
    return this;
  }

  // Label depends on the boolean value and whether the widget is in
  // exists/not-exists mode (DOM-free, reads the criteria only).
  getValueLabel(criteria: BooleanCriteria): string {
    if (criteria.boolean) {
      return this.configuration.existNotExist
        ? I18n.labels.exists
        : I18n.labels.true;
    }
    return this.configuration.existNotExist
      ? I18n.labels.notExists
      : I18n.labels.false;
  }

  parseInput(
    input: LabelledCriteria<BooleanCriteria>,
  ): LabelledCriteria<BooleanCriteria> {
    return input;
  }

  // Parses "true"/"false" (case-insensitive ; "1"/"0" also accepted).
  parseRawValue(raw: string): BooleanCriteria {
    let v = (raw ?? "").trim().toLowerCase();
    return { boolean: v === "true" || v === "1" };
  }
}
