import {Pattern } from "sparqljs";
import tippy from "tippy.js";
import { getSettings } from "../../../../../../../../configs/client-configs/settings";
import AddUserInputBtn from "../../../../../../buttons/AddUserInputBtn";
import InfoBtn from "../../../../../../buttons/InfoBtn";
import WidgetWrapper from "../../WidgetWrapper";
import { AbstractWidget, ValueType, WidgetValue } from "../AbstractWidget";
import "@chenfengyuan/datepicker";
import { DataFactory } from "n3";
import { namedNode } from "@rdfjs/data-model";
import { SelectedVal } from "../../../../../../../sparql/ISparJson";
import { getTimeDatePattern } from "./TimeDatePattern";
import ISpecProvider from "../../../../../../../spec-providers/ISpecProviders";



export interface DateTimePickerValue extends WidgetValue{
    value:{
        key:string,
        label:string,
        start:Date,
        stop:Date,
    }
}

export class TimeDatePickerWidget extends AbstractWidget {
    protected widgetValues: DateTimePickerValue[];
    datesHandler: any;
    ParentComponent: any;
    formatDate: any;
    format: any;inputStart: JQuery<HTMLElement>;
    inputEnd: JQuery<HTMLElement>;
    inputValue: JQuery<HTMLElement>;
    infoBtn: InfoBtn;
    addValueBtn: AddUserInputBtn;
    value: DateTimePickerValue;
  startClassVal: SelectedVal;
  objectPropVal: SelectedVal;
  endClassVal: SelectedVal;
  specProvider: ISpecProvider;
    constructor(
      parentComponent: WidgetWrapper,
      datesHandler: any,
      format: any,
      startClassCal:SelectedVal,
      objectPropVal:SelectedVal,
      endClassVal:SelectedVal,
      specProvider:ISpecProvider
    ) {
      super('date-widget',parentComponent,null,startClassCal,objectPropVal,endClassVal)
      this.datesHandler = datesHandler;
      this.formatDate = format;
      this.specProvider = specProvider
      this.formatDate == "day"
        ? getSettings().langSearch.PlaceholderTimeDateDayFormat
        : getSettings().langSearch.PlaceholderTimeDateFormat;
  
    }
  
    render() {
      super.render()
      this.formatDate == "day"
        ? getSettings().langSearch.PlaceholderTimeDateDayFormat
        : getSettings().langSearch.PlaceholderTimeDateFormat;
      this.html.append($(`<span>${getSettings().langSearch.LabelDateFrom}</span>`))
      this.inputStart = $(`<input id="input-start" placeholder="${getSettings().langSearch.TimeWidgetDateFrom}" autocomplete="off"/>`)
      this.inputEnd = $(`<input id="input-end" placeholder="${getSettings().langSearch.TimeWidgetDateTo}"/>`)
      this.inputValue= $(`<input id="input-value" type="hidden"/>`)
      let span = $(`<span>${getSettings().langSearch.LabelDateTo}</span>`)
      this.html.append(this.inputStart).append(span).append(this.inputEnd).append(this.inputValue)
      let datatippy = (this.formatDate == 'day')?getSettings().langSearch.TimeWidgetDateHelp:getSettings().langSearch.TimeWidgetYearHelp
      this.infoBtn = new InfoBtn(this,datatippy).render()
      this.addValueBtn = new AddUserInputBtn(this,getSettings().langSearch.ButtonAdd,this.#addValueBtnClicked).render()
  
      this.format =
        this.formatDate == "day"
          ? getSettings().langSearch.InputTimeDateDayFormat
          : getSettings().langSearch.InputTimeDateFormat;
  
      var options: {
        language: any;
        autoHide: boolean;
        format: any;
        date: any;
        startView: number;
      } = {
        language: getSettings().langSearch.LangCodeTimeDate,
        autoHide: true,
        format: this.format,
        date: null,
        startView: 2,
      };
  
      this.inputStart.datepicker(options);
      this.inputEnd.datepicker(options)
  
      // set a tooltip on the info circle
      var tippySettings = Object.assign(
        {},
        getSettings().tooltipConfig
      );
      tippySettings.placement = "left";
      tippySettings.trigger = "click";
      tippySettings.offset = [this.formatDate == "day" ? 75 : 50, -20];
      tippySettings.delay = [0, 0];
      tippy(this.infoBtn.widgetHtml[0], tippySettings);
      return this
    }
  
    #addValueBtnClicked = ()=>{

      let val = {
        valueType: ValueType.SINGLE,
        value:{
            key:'',
            label:'',
            start: this.inputStart.datepicker('getDate'),
            stop: this.inputEnd.datepicker('getDate'),
        }

      }
      let widgetVal:DateTimePickerValue = this.#validateInput(val)
      this.renderWidgetVal(this.#validateInput(widgetVal))
    }
    //TODO add dialog for user if input is unreasonable
    #validateInput(widgetValue:DateTimePickerValue){
      if(widgetValue.value.start.toString() == '' || widgetValue.value.stop.toString() == ''){
        console.warn(`no input received on DateTimePicker`)
        return null
      }
      if(widgetValue.value.start > widgetValue.value.stop){
        console.warn(`startVal is bigger then endVal`)
        return null
      }
      let tmpValue:{start:Date,stop:Date}
      if (this.formatDate == "day") {
        this.dateToYMD(widgetValue.value.start, "day");
        tmpValue = {
          start: this.dateToYMD(widgetValue.value.start, "day"),
          stop: this.dateToYMD(widgetValue.value.stop, "day"),
        };
        if (widgetValue.value.start != null) {
            widgetValue.value.start = new Date(widgetValue.value.start + "T00:00:00");
        }
        if (widgetValue.value.stop != null) {
            widgetValue.value.stop = new Date(widgetValue.value.stop + "T23:59:59");
        }
      } else {
        tmpValue = {
          start: this.dateToYMD(widgetValue.value.start, false),
          stop: this.dateToYMD(widgetValue.value.stop, false),
        };
        if (widgetValue.value.start != null) {
            widgetValue.value.start = new Date(widgetValue.value.start + "-01-01T00:00:00");
        }
        if (widgetValue.value.stop != null) {
            widgetValue.value.stop = new Date(widgetValue.value.stop + "-12-31T23:59:59");
        }
      }
      if (widgetValue.value.start == null && widgetValue.value.stop == null) {
        widgetValue.value = null;
      }
      let dateTimePickerVal:DateTimePickerValue = {
          valueType: ValueType.SINGLE,
          value:{
            key: tmpValue.start + " " + tmpValue.stop,
            // TODO : this is not translated
            label: this.getValueLabel(tmpValue.start,tmpValue.stop),
            start: tmpValue.start,
            stop: tmpValue.stop,
          }

      }
      return dateTimePickerVal
    }
  
    getValueLabel = function (start:any,stop:any) {
      let lbl = ''
      
      if(start != ''){
        lbl = lbl.concat(` ${start.toISOString().slice(0,10)}`)
      } 
      if(stop){
        lbl = lbl.concat(` - ${stop.toISOString().slice(0,10)}`)
      } 
      return lbl;
    };
  
    dateToYMD(
      date: {
        getDate: () => any;
        getMonth: () => number;
        getFullYear: () => any;
      },
      format: string | boolean
    ) {
      if (date == null) {
        return date;
      }
      var d = date.getDate();
      var m = date.getMonth() + 1; //Month from 0 to 11
      var y = date.getFullYear();
      if (format == "day") {
        return (
          "" + y + "-" + (m <= 9 ? "0" + m : m) + "-" + (d <= 9 ? "0" + d : d)
        );
      }
      return y;
    }

    getRdfJsPattern(): Pattern[]{
      let startLit = DataFactory.literal(this.widgetValues[0].value.start.toISOString(), namedNode("http://www.w3.org/2001/XMLSchema#dateTime"))
      let stopLit =  DataFactory.literal(this.widgetValues[0].value.start.toISOString(), namedNode("http://www.w3.org/2001/XMLSchema#dateTime"))
      let startClassVar = DataFactory.variable(this.startClassVal.variable)
      let beginDatePred = DataFactory.namedNode(this.specProvider.getBeginDateProperty(this.objectPropVal.type))
      let exactDatePred = DataFactory.namedNode(this.specProvider.getBeginDateProperty(this.objectPropVal.type))
      let endDatePred = DataFactory.namedNode(this.specProvider.getEndDateProperty(this.objectPropVal.type)) 

      return [getTimeDatePattern(startLit,stopLit,startClassVar,beginDatePred,endDatePred,exactDatePred,1)]
    }
  }