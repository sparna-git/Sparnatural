import { Pattern } from "sparqljs";
import AddUserInputBtn from "../../buttons/AddUserInputBtn";
import InfoBtn from "../../buttons/InfoBtn";
import { AbstractWidget, ValueRepetition, WidgetValue } from "../AbstractWidget";
import "@chenfengyuan/datepicker";
import { DataFactory } from 'rdf-data-factory';
import { SelectedVal } from "../../SelectedVal";
import ISparnaturalSpecification from "../../../spec-providers/ISparnaturalSpecification";
import { I18n } from "../../../settings/I18n";
import HTMLComponent from "../../HtmlComponent";
import { TOOLTIP_CONFIG } from "../../../settings/defaultSettings";

const factory = new DataFactory();

export class DateTimePickerValue implements WidgetValue {
  value: {
    label: string;
    start: Date;
    stop: Date;
  };

  key():string {
    return JSON.stringify(this.value.start).replace(/["]+/g,'')+" - "+JSON.stringify(this.value.stop).replace(/["]+/g,'');
  }

  constructor(v:DateTimePickerValue["value"]) {
    this.value = v;
  }

}

// converts props of type Date to type string
type StringifyDate<T> = T extends Date
  ? string
  : T extends object
  ? {
      [k in keyof T]: StringifyDate<T[k]>;
    }
  : T;

// stringified type of DateTimePickerValue
// see: https://effectivetypescript.com/2020/04/09/jsonify/
type StringDateTimeValue = StringifyDate<DateTimePickerValue>

export class TimeDatePickerWidget extends AbstractWidget {
 
  protected widgetValues: DateTimePickerValue[];
  datesHandler: any;
  ParentComponent: any;
  dateFormat: any;
  inputStart: JQuery<HTMLElement>;
  inputEnd: JQuery<HTMLElement>;
  inputValue: JQuery<HTMLElement>;
  infoBtn: InfoBtn;
  addValueBtn: AddUserInputBtn;
  value: DateTimePickerValue;
  startClassVal: SelectedVal;
  objectPropVal: SelectedVal;
  endClassVal: SelectedVal;
  specProvider: ISparnaturalSpecification;

  constructor(
    parentComponent: HTMLComponent,
    dateFormat: any,
    startClassCal: SelectedVal,
    objectPropVal: SelectedVal,
    endClassVal: SelectedVal,
    specProvider: ISparnaturalSpecification
  ) {
    super(
      "timedatepicker-widget",
      parentComponent,
      null,
      startClassCal,
      objectPropVal,
      endClassVal,
      ValueRepetition.SINGLE
    );
    this.dateFormat = dateFormat;
    this.specProvider = specProvider;
  }

  render() {
    super.render();
    this.html.append(
      $(`<span>${I18n.labels.LabelDateFrom}&nbsp;</span>`)
    );
    this.inputStart = $(
      `<input id="input-start" placeholder="${
        I18n.labels.TimeWidgetDateFrom
      }" autocomplete="off" class="${this.dateFormat}" />`
    );
    this.inputEnd = $(
      `<input id="input-end" placeholder="${
        I18n.labels.TimeWidgetDateTo
      }" autocomplete="off" class="${this.dateFormat}" />`
    );
    this.inputValue = $(`<input id="input-value" type="hidden"/>`);
    let span = $(`<span>&nbsp;${I18n.labels.LabelDateTo}&nbsp;</span>`);
    this.html
      .append(this.inputStart)
      .append(span)
      .append(this.inputEnd)
      .append(this.inputValue);
    // Build datatippy info
    let datatippy =
      this.dateFormat == "day"
        ? I18n.labels.TimeWidgetDateHelp
        : I18n.labels.TimeWidgetYearHelp;
    // set a tooltip on the info circle
    var tippySettings = Object.assign({}, TOOLTIP_CONFIG);
    tippySettings.placement = "left";
    tippySettings.trigger = "click";
    tippySettings.offset = [this.dateFormat == "day" ? 75 : 50, -20];
    tippySettings.delay = [0, 0];
    this.infoBtn = new InfoBtn(this, datatippy, tippySettings).render();
    //finish datatippy

    this.addValueBtn = new AddUserInputBtn(
      this,
      I18n.labels.ButtonAdd,
      this.#addValueBtnClicked
    ).render();

    let calendarFormat = 
    (this.dateFormat === "day")
    ? I18n.labels.TimeWidgetDateFormat
    : I18n.labels.TimeWidgetYearFormat;

    var options: {
      language: any;
      autoHide: boolean;
      format: any;
      date: any;
      startView: number;
    } = {
      language: I18n.labels.LangCodeTimeDate,
      autoHide: true,
      format: calendarFormat,
      date: null,
      startView: 2,
    };

    this.inputStart.datepicker(options);
    this.inputEnd.datepicker(options);

    return this;
  }

  #addValueBtnClicked = () => {

    // fix for negative years
    // set a minus in front of the date if there was one in the value
    let startDate:Date;
    if(this.inputStart.val() != '') {
      startDate = this.inputStart.datepicker("getDate");
      if((this.inputStart.val() as string).startsWith("-") && !startDate.toISOString().startsWith("-")) {
        startDate.setFullYear(parseInt(this.inputStart.val().toString()));
      }
    }
    
    let endDate:Date;
    if(this.inputEnd.val() != '') {
      endDate = this.inputEnd.datepicker("getDate");
      if((this.inputEnd.val() as string).startsWith("-") && !endDate.toISOString().startsWith("-")) {
        endDate.setFullYear(parseInt(this.inputEnd.val().toString()));
      }
    }

    let stringDateTimeVal:StringDateTimeValue["value"] ={
      label: null,
      start:(startDate)?startDate.toISOString():null,
      stop:(endDate)?endDate.toISOString():null,
    } 
    let widgetVal: DateTimePickerValue = this.parseInput(
      stringDateTimeVal
    );
    if (!widgetVal) return;
    this.renderWidgetVal(widgetVal);
  };

  parseInput(input: StringDateTimeValue["value"]): DateTimePickerValue {
    if(!this.#isValidDate(input.start) && !this.#isValidDate(input.stop)) throw Error('No valid Date received')
    let startValue = (this.#isValidDate(input.start))?new Date(input.start):null
    let endValue = (this.#isValidDate(input.stop))?new Date(input.stop):null
    if (startValue && endValue && (startValue > endValue)) throw Error('StartDate is bigger than Enddate!')

    let tmpValue: { start: Date; stop: Date; startLabel: string; endLabel: string };

    if (this.dateFormat == "day") {
      tmpValue = {
        start: (startValue)?new Date(startValue.setHours(0, 0, 0, 0)):null,
        stop: (endValue)?new Date(endValue.setHours(23, 59, 59, 59)):null,
        startLabel: startValue?startValue.toLocaleDateString():"",
        endLabel: endValue?endValue.toLocaleDateString():""
      };
    } else {
      tmpValue = {
        start: this.#getFirstDayYear(startValue), 
        stop: this.#getLastDayOfYear(endValue),
        startLabel: startValue?startValue.getFullYear().toString():"",
        endLabel: endValue?endValue.getFullYear().toString():""
      };
    }
    let dateTimePickerVal = new DateTimePickerValue({
        label: this.#getValueLabel(tmpValue.startLabel, tmpValue.endLabel),
        start: tmpValue.start,
        stop: tmpValue.stop,
      });
    return dateTimePickerVal;
  }
  #getFirstDayYear(startValue:Date) {
    return startValue ?
    new Date(startValue.getFullYear(),0,1,0,0,1,0) 
    :null
  }
  #getLastDayOfYear(endValue:Date) {
    return endValue ? 
    new Date(endValue.getFullYear(),11,31,23,59,59) 
    :null
  }

  #getValueLabel = function (startLabel: string, stopLabel: string) {
    let valueLabel = "";
    if ((startLabel != "") && (stopLabel != "")) {
      valueLabel = I18n.labels.LabelDateFrom+' '+ startLabel +' '+I18n.labels.LabelDateTo+' '+ stopLabel ;
    } else if (startLabel != "") {
      valueLabel = I18n.labels.DisplayValueDateFrom+' '+ startLabel ;
    } else if (stopLabel != "") {
      valueLabel = I18n.labels.DisplayValueDateTo+' '+ stopLabel ;
    }

    return valueLabel;
  };

  #isValidDate(dateString:string){
    return (new Date(dateString).toString() !== "Invalid Date") && !isNaN(Date.parse(dateString));
  }
}
