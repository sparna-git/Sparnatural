import { AddUserInputBtn } from "../../buttons/AddUserInputBtn";
import { InfoBtn } from "../../buttons/InfoBtn";
import { AbstractWidget, ValueRepetition } from "../AbstractWidget";
import "@chenfengyuan/datepicker";
import { DataFactory } from 'rdf-data-factory';
import { SelectedVal } from "../../SelectedVal";
import { ISparnaturalSpecification } from "../../../spec-providers/ISparnaturalSpecification";
import { I18n } from "../../../settings/I18n";
import { HTMLComponent } from "../../HtmlComponent";
import { TOOLTIP_CONFIG } from "../../../settings/defaultSettings";
import { LabelledCriteria, DateCriteria } from "../../../SparnaturalQueryIfc";
import { time } from "node:console";

const factory = new DataFactory();


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
type StringDateTimeValue = StringifyDate<DateCriteria>

export class TimeDatePickerWidget extends AbstractWidget {
 
  protected widgetValues: DateCriteria[];
  datesHandler: any;
  parentComponent: any;
  dateFormat: any;
  inputStart: JQuery<HTMLElement>;
  inputEnd: JQuery<HTMLElement>;
  inputValue: JQuery<HTMLElement>;
  infoBtn: InfoBtn;
  addValueBtn: AddUserInputBtn;
  value: DateCriteria;
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
    // ensure calendar is hidden to avoid error
    // // (otherwise the calendar tries to remove itself but its parent node is gone)
    this.inputStart.datepicker("hide");
    this.inputEnd.datepicker("hide");

    // fix for negative years
    // set a minus in front of the date if there was one in the value
    let startDate:Date;
    if(this.inputStart.val() != '') {
      let dateString = this.inputStart.val() as string;
      startDate = this.inputStart.datepicker("getDate");
      
      // if original date value was only 2 digits, force it because the getDate returns a 19xx date
      if(
        (!dateString.startsWith("-") && dateString.length == 2)
        ||
        (dateString.startsWith("-") && dateString.length == 3)
      ) {
        
        let year = parseInt(dateString);
        startDate.setFullYear(year);
        console.warn(startDate.getFullYear())
        if(startDate.getFullYear() > 1900) {
          
          // calling setFullYear with a 2 digit year returns a date in the 1900s, so if the year is bigger than 1900
          // we force it with setTime
          var TIME_OF_1900 = new Date("1900-01-01").getTime();
          var realTime = startDate.getTime() - TIME_OF_1900;
          startDate.setTime(realTime);
        }
      }

      // if input was provided with a minus but getDate did not return a negative year, force it
      if(dateString.startsWith("-") && !startDate.toISOString().startsWith("-")) {
        startDate.setFullYear(parseInt(dateString));
      }
    }
    
    let endDate:Date;
    if(this.inputEnd.val() != '') {
      let dateString = this.inputEnd.val() as string;
      endDate = this.inputEnd.datepicker("getDate");

      // if original date value was only 2 digits, force it because the getDate returns a 19xx date
      if(
        (!dateString.startsWith("-") && dateString.length == 2)
        ||
        (dateString.startsWith("-") && dateString.length == 3)
      ) {
        let year = parseInt(dateString);
        endDate.setFullYear(year);
      }

      // if input was provided with a minus but getDate did not return a negative year, force it
      if(dateString.startsWith("-") && !endDate.toISOString().startsWith("-")) {
        endDate.setFullYear(parseInt(dateString));
      }
    }

    let stringDateTimeVal:LabelledCriteria<DateCriteria> = {
      label: null,
      criteria: {
        start:(startDate)?startDate.toISOString():null,
        stop:(endDate)?endDate.toISOString():null
      }      
    } 
    let widgetVal: LabelledCriteria<DateCriteria> = this.parseInput(
      stringDateTimeVal
    );
    if (!widgetVal) return;
    this.triggerRenderWidgetVal(widgetVal);
  };

  parseInput(input: LabelledCriteria<DateCriteria>): LabelledCriteria<DateCriteria> {
    let theValue:DateCriteria = input.criteria as DateCriteria;

    if(!this.#isValidDate(theValue.start) && !this.#isValidDate(theValue.stop)) throw Error('No valid Date received')
    let startValue = (this.#isValidDate(theValue.start))?new Date(theValue.start):null
    let endValue = (this.#isValidDate(theValue.stop))?new Date(theValue.stop):null
    if (startValue && endValue && (startValue > endValue)) throw Error('StartDate is bigger than Enddate!')

    let tmpValue: { start: Date; stop: Date; startLabel: string; endLabel: string };

    if (this.dateFormat == "day") {
      tmpValue = {
        start: (startValue)?new Date(startValue.setHours(0, 0, 0, 0)):null,
        // we set it to the end of the day and we shift one more minute to jumpt to tomorrow
        // so that if the same date is searched as start + end it will find this value
        // stop: (endValue)?this.#shiftOneMoreMinute(new Date(endValue.setHours(23, 59, 1, 59))):null,
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

    let dateTimePickerVal:LabelledCriteria<DateCriteria> = {
      label: this.#getValueLabel(tmpValue.startLabel, tmpValue.endLabel),
      criteria: {
        start: (tmpValue.start)?this.#toISOStringWithTimezone(tmpValue.start):null,
        stop: (tmpValue.stop)?this.#toISOStringWithTimezone(tmpValue.stop):null,
      }        
    };

    return dateTimePickerVal;
  }

  /**
   * @returns a Date object corresponding to the first day of the year of the provided date (with hours set to 00:00:00:000), or null if the provided date is null.
   * Do NOT use the constructor of Date with year only because it considers the year as an offset from 1900, so 50 becomes 1950, and -50 becomes 1850, which is not what we want. 
   */
  #getFirstDayYear(startValue:Date) {
    if(!startValue) return null;
    let newDate = new Date(startValue);
    newDate.setMonth(0);
    newDate.setDate(1);
    newDate.setHours(0,0,1,0);
    return newDate;
  }

  /**
   * @returns a Date object corresponding to the last day of the year of the provided date (with hours set to 23:59:59:999), or null if the provided date is null
   * Do NOT use the constructor of Date with year only because it considers the year as an offset from 1900, so 50 becomes 1950, and -50 becomes 1850, which is not what we want. 
   */
  #getLastDayOfYear(endValue:Date) {
    if(!endValue) return null;
    let newDate = new Date(endValue);
    newDate.setMonth(11);
    newDate.setDate(31);
    newDate.setHours(23,59,59,999);
    return newDate;
  }

  #shiftOneMoreMinute(date:Date) {
    if(!date) return null;
    let newDate = new Date(date);
    newDate.setMinutes(date.getMinutes()+1);
    return newDate;
  }

  /**
   * @param date 
   * @returns The ISO date string taking into account timezone (otherwise toISODate returns the date in UTC and the hours shift)
   */
  #toISOStringWithTimezone(date:Date) {
    return new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString();
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
export { DateCriteria as DateTimePickerValue };

