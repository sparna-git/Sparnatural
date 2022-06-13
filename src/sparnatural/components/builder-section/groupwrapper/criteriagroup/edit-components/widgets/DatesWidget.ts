import { BaseExpression, Expression, Pattern } from "sparqljs";
import { getSettings } from "../../../../../../../configs/client-configs/settings";
import { SelectedVal } from "../../../../../../sparql/ISparJson";
import AddUserInputBtn from "../../../../../buttons/AddUserInputBtn";
import WidgetWrapper from "../WidgetWrapper";
import { AbstractWidget, ValueType, WidgetValue } from "./AbstractWidget";

export interface DateValue extends WidgetValue {
    value:{
        label:string,
        start: string,
        stop: string
    }
  }

export class DatesWidget extends AbstractWidget {
    datesHandler: any;
    addWidgetValueBtn: AddUserInputBtn
    input: JQuery<HTMLElement>;
    inputStart: JQuery<HTMLElement>;
    inputEnd: JQuery<HTMLElement>;
    inputValue: JQuery<HTMLElement>;
    constructor(parentComponent: WidgetWrapper, datesHandler: any,startClassVal:SelectedVal,objectPropVal:SelectedVal,endClassVal:SelectedVal) {
      super('date-widget',parentComponent,null,startClassVal,objectPropVal,endClassVal)
      this.datesHandler = datesHandler;
      this.startClassVal = startClassVal
      this.objectPropVal = objectPropVal
      this.endClassVal = endClassVal
    }
  
    render() {
      super.render()
      this.input = $(`<input id="input" placeholder="${getSettings().langSearch.PlaceHolderDatePeriod}"/>`)
      this.inputStart = $(`<input id="input-start" placeholder="${getSettings().langSearch.TimeWidgetDateFrom}"/>`)
      this.inputEnd = $(`<input id="input-start" placeholder="${getSettings().langSearch.TimeWidgetDateFrom}"/>`)
      this.inputValue= $(`<input id="input-value" type="hidden"/>`)
      this.html.append(this.input).append(this.inputStart).append(this.inputEnd).append(this.inputValue)
      this.addWidgetValueBtn = new AddUserInputBtn(this,getSettings().langSearch.ButtonAdd,this.#addValueBtnClicked).render()
      var phrase = "";
      var data_json = null;
  
      $.ajax({
        url: this.datesHandler.datesUrl(
          this.startClassVal.type,
          this.objectPropVal.type,
          this.endClassVal.type,
          phrase
        ),
        async: false,
        success: function (data) {
          data_json = data;
        },
      });
  
      var options = {
        data: {},
  
        getValue: function (element: any) {
          return this.datesHandler.elementLabel(element);
        },
  
        list: {
          match: {
            enabled: true,
          },
  
          onChooseEvent: function () {
            var values = this.input.getSelectedItemData();
            var value = this.datesHandler.elementLabel(values);
            var start = this.datesHandler.elementStart(values);
            var stop = this.datesHandler.elementEnd(values);
  
           this.input.val(value).trigger("change");
  
           this.inputStart
              .val(start)
              .trigger("change");
            this.inputEnd
              .val(stop)
              .trigger("change");
  
            this.inputValue
              .val(value)
              .trigger("change");
          },
        },
  
        template: {
          type: "custom",
          method: function (value: any, item: any) {
            var label = this.datesHandler.elementLabel(item);
            var start = this.datesHandler.elementStart(item);
            var stop = this.datesHandler.elementEnd(item);
            return (
              "<div>" +
              label +
              ' <span class="start">' +
              start +
              '</span><span class="end">' +
              stop +
              "</span></div>"
            );
          },
        },
  
        requestDelay: 400,
      };
  
      this.input.easyAutocomplete(options);
      return this
    }
    
    #addValueBtnClicked = ()=>{
      let val:DateValue = {
          valueType:ValueType.SINGLE,
          value:{
            start: this.inputStart.val().toString(),
            stop: this.inputEnd.val().toString(),
            label: ''
          }
      } 
     this.renderWidgetVal(this.#validateDateInput(val))
    }
    //TODO: add dialog response to user if dateinput doesn't make sense
    #validateDateInput(dateValue:DateValue): DateValue{
      if (dateValue.value.start == "" || dateValue.value.stop == "") {
        dateValue.value = null;
      } else {
        if (parseInt(dateValue.value.start) > parseInt(dateValue.value.stop)) {
            dateValue.value = null;
        } else {
          var absoluteStartYear = dateValue.value.start.startsWith("-")
            ? dateValue.value.start.substring(1)
            : dateValue.value.start;
          var paddedAbsoluteStartYear = absoluteStartYear.padStart(4, "0");
          var paddedStartYear = dateValue.value.start.startsWith("-")
            ? "-" + paddedAbsoluteStartYear
            : paddedAbsoluteStartYear;
            dateValue.value.start = paddedStartYear + "-01-01T00:00:00";
  
          var absoluteStopYear = dateValue.value.stop.startsWith("-")
            ? dateValue.value.stop.substring(1)
            : dateValue.value.stop;
          var paddedAbsoluteStopYear = absoluteStopYear.padStart(4, "0");
          var paddedStopYear = dateValue.value.stop.startsWith("-")
            ? "-" + paddedAbsoluteStopYear
            : paddedAbsoluteStopYear;
            dateValue.value.stop = paddedStopYear + "-12-31T23:59:59";
        }
      }
      dateValue.value.label = this.#getValueLabel(dateValue.value.start,dateValue.value.stop)
      return dateValue
    }

    #getValueLabel = function (start:any,stop:any) {
        let lbl = ''
        
        if(start != '' && start){
          lbl = lbl.concat(` ${start.toISOString().slice(0,10)}`)
        } 
        if(stop && stop != ''){
          lbl = lbl.concat(` - ${stop.toISOString().slice(0,10)}`)
        } 
        return lbl;
      };

    getRdfJsPattern(): Pattern[] {
        throw new Error("Method not implemented.");
    }
  
  }
  