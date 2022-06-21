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
  specProvider: ISpecProvider;
    constructor(
      parentComponent: WidgetWrapper,
      datesHandler: any,
      dateFormat: any,
      startClassCal:SelectedVal,
      objectPropVal:SelectedVal,
      endClassVal:SelectedVal,
      specProvider:ISpecProvider
    ) {
      super('date-widget',parentComponent,null,startClassCal,objectPropVal,endClassVal)
      this.datesHandler = datesHandler;
      this.dateFormat = dateFormat;
      this.specProvider = specProvider
      this.dateFormat == "day"
        ? this.dateFormat = getSettings().langSearch.PlaceholderTimeDateDayFormat
        : this.dateFormat = getSettings().langSearch.PlaceholderTimeDateFormat;
  
    }
  
    render() {
      super.render()
      this.html.append($(`<span>${getSettings().langSearch.LabelDateFrom}</span>`))
      this.inputStart = $(`<input id="input-start" placeholder="${getSettings().langSearch.TimeWidgetDateFrom}" autocomplete="off"/>`)
      this.inputEnd = $(`<input id="input-end" placeholder="${getSettings().langSearch.TimeWidgetDateTo}"/>`)
      this.inputValue= $(`<input id="input-value" type="hidden"/>`)
      let span = $(`<span>${getSettings().langSearch.LabelDateTo}</span>`)
      this.html.append(this.inputStart).append(span).append(this.inputEnd).append(this.inputValue)
      // Build datatippy info
      let datatippy = (this.dateFormat == 'day')? getSettings().langSearch.TimeWidgetDateHelp : getSettings().langSearch.TimeWidgetYearHelp
      // set a tooltip on the info circle
      var tippySettings = Object.assign(
        {},
        getSettings().tooltipConfig
      );
      tippySettings.placement = "left";
      tippySettings.trigger = "click";
      tippySettings.offset = [this.dateFormat == "day" ? 75 : 50, -20];
      tippySettings.delay = [0, 0];
      this.infoBtn = new InfoBtn(this,datatippy,tippySettings).render()
      //finish datatippy

      this.addValueBtn = new AddUserInputBtn(this,getSettings().langSearch.ButtonAdd,this.#addValueBtnClicked).render()
  
      var options: {
        language: any;
        autoHide: boolean;
        format: any;
        date: any;
        startView: number;
      } = {
        language: getSettings().langSearch.LangCodeTimeDate,
        autoHide: true,
        format: this.dateFormat,
        date: null,
        startView: 2,
      };
  
      this.inputStart.datepicker(options);
      this.inputEnd.datepicker(options)
     
      return this
    }
  
    #addValueBtnClicked = ()=>{

      let val = {
        valueType: ValueType.SINGLE,
        value:{
            key:'',
            label:'',
            start: new Date(this.inputStart.datepicker('getDate')),
            stop: new Date(this.inputEnd.datepicker('getDate')),
        }

      }
      let widgetVal:DateTimePickerValue = this.#validateInput(val)
      if(!widgetVal) return
      this.renderWidgetVal(this.#validateInput(widgetVal))
    }
    //TODO add dialog for user if input is unreasonable
    #validateInput(widgetValue:DateTimePickerValue){
      if(widgetValue.value.start.toString() == '' || widgetValue.value.stop.toString() == ''){
        console.warn(`no input received on DateTimePicker`)
        return null
      }
      if(!widgetValue.value.start || !widgetValue.value.stop){
        console.warn(`no input received on DateTimePicker`)
        return null
      }
      if(widgetValue.value.start > widgetValue.value.stop){
        console.warn(`startVal is bigger then endVal`)
        return null
      }
      let tmpValue:{start:Date,stop:Date}
      if (this.dateFormat == "day") {
        tmpValue = {
          start: new Date(widgetValue.value.start.setHours(0,0,0,0)),
          stop: new Date(widgetValue.value.stop.setHours(23,59,59,59)),
        };
      } else {
        tmpValue = {
          start: new Date(widgetValue.value.start.getFullYear(),0,1,0,0,1,0 ), // first day
          stop:new Date(widgetValue.value.stop.getFullYear(),11,31,23,59,59) // last day
        };
      }
      let dateTimePickerVal:DateTimePickerValue = {
          valueType: ValueType.SINGLE,
          value:{
            key: this.getValueLabel(tmpValue.start,tmpValue.stop),
            // TODO : this is not translated
            label: this.getValueLabel(tmpValue.start,tmpValue.stop),
            start: tmpValue.start,
            stop: tmpValue.stop,
          }

      }
      return dateTimePickerVal
    }
  
    getValueLabel = function (start:Date,stop:Date) {
      let lbl = ''
      
      if(start){
        lbl = lbl.concat(`${this.#formatDate(start)}`)
      } 
      if(stop){
        lbl = lbl.concat(` - ${this.#formatDate(stop)}`)
      } 
      return lbl;
    };
    #padTo2Digits(num:number) {
      return num.toString().padStart(2, '0');
    }
    
    #formatDate(date:Date) {
      return [
        this.#padTo2Digits(date.getDate()),
        this.#padTo2Digits(date.getMonth() + 1),
        date.getFullYear(),
      ].join('/');
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