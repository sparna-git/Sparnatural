import { SelectedVal } from "../SelectedVal";
import { AddUserInputBtn } from "../buttons/AddUserInputBtn";
import { AbstractWidget, ValueRepetition } from "./AbstractWidget";
import { I18n } from "../../settings/I18n";
import { HTMLComponent } from "../HtmlComponent";
import { LabelledCriteria, DateCriteria } from "../../SparnaturalQueryIfc";


/**
 * Old time period widget
 * @deprecated
 */
export class DatesWidget extends AbstractWidget {

  datesHandler: any;
  addWidgetValueBtn: AddUserInputBtn;
  input: JQuery<HTMLElement>;
  inputStart: JQuery<HTMLElement>;
  inputEnd: JQuery<HTMLElement>;
  inputValue: JQuery<HTMLElement>;
  constructor(
    parentComponent: HTMLComponent,
    datesHandler: any,
    startClassVal: SelectedVal,
    objectPropVal: SelectedVal,
    endClassVal: SelectedVal
  ) {
    super(
      "date-widget",
      parentComponent,
      null,
      startClassVal,
      objectPropVal,
      endClassVal,
      ValueRepetition.SINGLE
    );
    this.datesHandler = datesHandler;
    this.startClassVal = startClassVal;
    this.objectPropVal = objectPropVal;
    this.endClassVal = endClassVal;
  }

  render() {
    super.render();
    this.input = $(
      `<input id="input" placeholder="${
        I18n.labels.PlaceHolderDatePeriod
      }"/>`
    );
    this.inputStart = $(
      `<input id="input-start" placeholder="${
        I18n.labels.TimeWidgetDateFrom
      }"/>`
    );
    this.inputEnd = $(
      `<input id="input-start" placeholder="${
        I18n.labels.TimeWidgetDateFrom
      }"/>`
    );
    this.inputValue = $(`<input id="input-value" type="hidden"/>`);
    this.html
      .append(this.input)
      .append(this.inputStart)
      .append(this.inputEnd)
      .append(this.inputValue);
    this.addWidgetValueBtn = new AddUserInputBtn(
      this,
      I18n.labels.ButtonAdd,
      this.#addValueBtnClicked
    ).render();
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

          this.inputStart.val(start).trigger("change");
          this.inputEnd.val(stop).trigger("change");

          this.inputValue.val(value).trigger("change");
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
    return this;
  }

  #addValueBtnClicked = () => {
    let val:LabelledCriteria<DateCriteria> = {
      label: "",
      criteria: {
        start: this.inputStart.val().toString(),
        stop: this.inputEnd.val().toString()
      }      
    };
    this.triggerRenderWidgetVal(this.parseInput(val));
  };

  parseInput(dateValue:LabelledCriteria<DateCriteria>): LabelledCriteria<DateCriteria> {
    let theValue = dateValue.criteria as DateCriteria;
    if (theValue.start == "" || theValue.stop == "") {
      dateValue = null;
    } else {
      if (parseInt(theValue.start) > parseInt(theValue.stop)) {
        dateValue = null;
      } else {
        var absoluteStartYear = theValue.start.startsWith("-")
          ? theValue.start.substring(1)
          : theValue.start;
        var paddedAbsoluteStartYear = absoluteStartYear.padStart(4, "0");
        var paddedStartYear = theValue.start.startsWith("-")
          ? "-" + paddedAbsoluteStartYear
          : paddedAbsoluteStartYear;
        theValue.start = paddedStartYear + "-01-01T00:00:00";

        var absoluteStopYear = theValue.stop.startsWith("-")
          ? theValue.stop.substring(1)
          : theValue.stop;
        var paddedAbsoluteStopYear = absoluteStopYear.padStart(4, "0");
        var paddedStopYear = theValue.stop.startsWith("-")
          ? "-" + paddedAbsoluteStopYear
          : paddedAbsoluteStopYear;
        theValue.stop = paddedStopYear + "-12-31T23:59:59";
      }
    }
    dateValue.label = this.#getValueLabel(
      theValue.start,
      theValue.stop
    );
    return {
      label: this.#getValueLabel(
        theValue.start,
        theValue.stop
      ),
      criteria: theValue
    }
  }

  #getValueLabel = function (start: any, stop: any) {
    let lbl = "";

    if (start != "" && start) {
      lbl = lbl.concat(` ${start.toISOString().slice(0, 10)}`);
    }
    if (stop && stop != "") {
      lbl = lbl.concat(` - ${stop.toISOString().slice(0, 10)}`);
    }
    return lbl;
  };

}
