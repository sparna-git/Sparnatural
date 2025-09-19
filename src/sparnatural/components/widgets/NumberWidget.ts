import { DataFactory } from "rdf-data-factory";
import { SelectedVal } from "../SelectedVal";
import { AbstractWidget, ValueRepetition } from "./AbstractWidget";
import { I18n } from "../../settings/I18n";
import { AddUserInputBtn } from "../buttons/AddUserInputBtn";
import { InfoBtn } from "../buttons/InfoBtn";
import { TOOLTIP_CONFIG } from "../../settings/defaultSettings";
import { HTMLComponent } from "../HtmlComponent";
import { LabelledCriteria, NumberCriteria } from "../../SparnaturalQueryIfc";

const factory = new DataFactory();


export interface NumberConfiguration {
  min?: string;
  max?: string;
}

export class NumberWidget extends AbstractWidget {
  // The default implementation of TreeConfiguration
  static defaultConfiguration: NumberConfiguration = {};

  configuration: NumberConfiguration;
  form: JQuery<HTMLElement>;
  minInput: JQuery<HTMLElement>;
  maxInput: JQuery<HTMLElement>;
  infoBtn: InfoBtn;
  addValueBtn: AddUserInputBtn;

  constructor(
    parentComponent: HTMLComponent,
    configuration: NumberConfiguration,
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

    this.configuration = configuration;
  }

  render() {
    super.render();
    this.form = $("<form />");
    this.html.append(this.form);

    this.form[0].addEventListener("submit", this.#onFormSubmit);

    this.minInput = $(
      `<input type="number" size="7" id="input-from" ${this.#getMinMaxHtmlAttributes()} />`
    );
    this.form.append(this.minInput);

    this.form.append(`&nbsp;&nbsp;${I18n.labels.NumberLabelAnd}&nbsp;&nbsp;`);

    this.maxInput = $(
      `<input type="number" size="7" id="input-to" ${this.#getMinMaxHtmlAttributes()} />`
    );
    this.form.append(this.maxInput);

    // set a tooltip on the info circle
    var tippySettings = Object.assign({}, TOOLTIP_CONFIG);
    tippySettings.placement = "left";
    tippySettings.trigger = "click";
    tippySettings.offset = [40, -20];
    tippySettings.delay = [0, 0];

    let tooltip = this.#getValueLabel(
      this.configuration.min,
      this.configuration.max
    );

    this.infoBtn = new InfoBtn(this, tooltip, tippySettings).render();

    this.addValueBtn = new AddUserInputBtn(
      this,
      I18n.labels.ButtonAdd,
      this.#addValueBtnClicked
    ).render();

    return this;
  }

  #getMinMaxHtmlAttributes() {
    let result: string = "";
    if (this.configuration.min) {
      result += ` min="${this.configuration.min}"`;
    }
    if (this.configuration.max) {
      result += ` max="${this.configuration.max}"`;
    }
    return result;
  }

  #onFormSubmit = (event: SubmitEvent) => {
    let value:NumberCriteria = {
      min:
        this.minInput.val() != ""
          ? Number(this.minInput.val().toString())
          : undefined,
      max:
        this.maxInput.val() != ""
          ? Number(this.maxInput.val().toString())
          : undefined
    }

    this.#checkInput(value);

    let numberWidgetValue:LabelledCriteria<NumberCriteria> = {
      label: this.#getValueLabel(
        this.minInput.val().toString(),
        this.maxInput.val().toString()
      ),
      value: value
    };
    
    this.triggerRenderWidgetVal(numberWidgetValue);

    // prevent actual form submission
    event.preventDefault();
    // arreter la propagation de l'evenement pour ne pas qu'il remonte jusqu'au parent
    event.stopPropagation();
  };

  #addValueBtnClicked = () => {
    (this.form[0] as HTMLFormElement).requestSubmit();
  };

  #checkInput(input: NumberCriteria) {
    if (input.min && input.max && input.min > input.max)
      throw Error("lower bound is bigger than upper bound!");
  }

  #getValueLabel = function (
    startLabel: string | undefined,
    stopLabel: string | undefined
  ) {
    let valueLabel = "";
    if (startLabel != "" && stopLabel != "") {
      valueLabel =
        I18n.labels.NumberLabelBetween +
        " " +
        startLabel +
        " " +
        I18n.labels.NumberLabelAnd +
        " " +
        stopLabel;
    } else if (startLabel != "") {
      valueLabel = I18n.labels.NumberLabelHigherThan + " " + startLabel;
    } else if (stopLabel != "") {
      valueLabel = I18n.labels.NumberLabelLowerThan + " " + stopLabel;
    }

    return valueLabel;
  };

  parseInput(input: LabelledCriteria<NumberCriteria>): LabelledCriteria<NumberCriteria> {
    return input;
  }
}
