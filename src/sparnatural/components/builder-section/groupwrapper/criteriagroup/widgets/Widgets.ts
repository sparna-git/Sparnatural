import "@chenfengyuan/datepicker";
import "select2";
import "select2/dist/css/select2.css";
import tippy from "tippy.js";
import ISettings from "../../../../../../configs/client-configs/ISettings";
import LocalCacheData from "../../../../../datastorage/LocalCacheData";
import { AutocompleteValue, BooleanWidgetValue, DateTimePickerValue, DateValue, IWidget, ListWidgetValue, SearchWidgetValue } from "./IWidget";
import HTMLComponent from "../../../../HtmlComponent";
import WidgetWrapper from "./WidgetWrapper";
import { SelectedVal } from "../../../../../sparql/ISparJson";
import { getSettings } from "../../../../../../configs/client-configs/settings";
import AddUserInputBtn from "../../../../buttons/addUserInputBtn";
import InfoBtn from "../../../../buttons/InfoBtn";

export class AutoCompleteWidget extends HTMLComponent implements IWidget {
  autocompleteHandler: any;
  startClassVal: SelectedVal;
  objectPropVal: SelectedVal;
  endClassVal: SelectedVal;
  value: AutocompleteValue

  constructor(parentComponent: WidgetWrapper, autocompleteHandler: any,startClassValue:SelectedVal,objectPropVal:SelectedVal,endClassValue:SelectedVal) {
    super('autocomplete-widget',parentComponent,null)
    this.autocompleteHandler = autocompleteHandler;
    this.startClassVal = startClassValue
    this.objectPropVal = objectPropVal
    this.endClassVal = endClassValue
  }

  render() {
    super.render()
    let inputHtml = $(`<input class="autocompleteinput"/>`)
    let listHtml = $(`<input class="inputvalue"/>`)
    this.html.append(inputHtml)
    this.html.append(listHtml)

    var isMatch = this.autocompleteHandler.enableMatch(
      this.startClassVal,
      this.objectPropVal,
      this.endClassVal
    );

    let options = {
      // ajaxSettings: {crossDomain: true, type: 'GET'} ,
      url: function (phrase: any) {
        return this.autocompleteHandler.autocompleteUrl(
          this.startClassVal,
          this.objectPropVal,
          this.endClassVal,
          phrase
        );
      },
      listLocation: function (data: any) {
        return this.autocompleteHandler.listLocation(
          this.startClassVal,
          this.objectPropVal,
          this.endClassVal,
          data
        );
      },
      getValue: function (element: any) {
        return this.autocompleteHandler.elementLabel(element);
      },

      adjustWidth: false,

      ajaxSettings: {
        crossDomain: true,
        dataType: "json",
        method: "GET",
        data: {
          dataType: "json",
        },
      },

      preparePostData: function (data: { phrase: string | number | string[] }) {
        data.phrase = inputHtml.val()
        return data;
      },

      list: {
        match: {
          enabled: isMatch,
        },

        onChooseEvent: function () {
          let val = inputHtml.getSelectedItemData();
          let autocompleteValue = {
            key:this.autocompleteHandler.elementUri(val),
            label:this.autocompleteHandler.elementLabel(val),
            uri: this.autocompleteHandler.elementUri(val)
          }
          inputHtml.val(autocompleteValue.label);
          listHtml
            .val(autocompleteValue.uri)
            .trigger("change");
            this.html[0].dispatchEvent(new CustomEvent('widgetValueSelected',{bubbles:true,detail:autocompleteValue}))
        },
      },
      requestDelay: 400,
    };
    //Need to add in html befor

    inputHtml.easyAutocomplete(options);
    return this
  }
}

export class ListWidget extends HTMLComponent implements IWidget {
  listHandler: any;
  value: ListWidgetValue
  sort: boolean;
  settings: ISettings;
  startClassVal: SelectedVal;
  objectPropVal: SelectedVal;
  endClassVal: SelectedVal;
  selectHtml: JQuery<HTMLElement>;
  constructor(
    parentComponent: WidgetWrapper,
    listHandler: any,
    sort: boolean,
    startClassVal:SelectedVal,
    objectPropVal:SelectedVal,
    endClassVal:SelectedVal
  ) {
    super('list-widget',parentComponent,null)
    this.listHandler = listHandler;
    this.sort = sort;
    this.startClassVal = startClassVal;
    this.objectPropVal = objectPropVal;
    this.endClassVal = endClassVal
  }

  render() {
    super.render()
    this.selectHtml = $(`<select></select>`)
    let noItemsHtml = $(`<div class="no-items" style="display: none; font-style:italic;">
    ${getSettings().langSearch.ListWidgetNoItem}
  </div>`)
    this.html.append(this.selectHtml)

    let url = this.listHandler.listUrl(
      this.startClassVal,
      this.objectPropVal,
      this.endClassVal
    );

    var headers = new Headers();
    headers.append(
      "Accept",
      "application/sparql-results+json, application/json, */*;q=0.01"
    );
    let init = {
      method: "GET",
      headers: headers,
      mode: "cors",
      cache: "default",
    };
    let temp = new LocalCacheData();
    let fetchpromise = temp.fetch(url, init, this.settings.localCacheDataTtl);
    fetchpromise
      .then((response: { json: () => any }) => response.json())
      .then((data: any) => {
        var items = this.listHandler.listLocation(
          this.startClassVal,
          this.objectPropVal,
          this.endClassVal,
          data
        );
        if (items.length > 0) {
          if (this.sort) {
            // here, if we need to sort, then sort according to lang
            var collator = new Intl.Collator(this.settings.language);
            items.sort((a: any, b: any) => {
              return collator.compare(
                this.listHandler.elementLabel(a),
                this.listHandler.elementLabel(b)
              );
            });
          }

          $.each(items, (key, val) => {
            var label = this.listHandler.elementLabel(val);
            var uri = this.listHandler.elementUri(val);
            this.selectHtml.append($("<option value='" + uri + "'>" + label + "</option>"))
          });
          if(items.length < 20){
              items.niceSelect();
              items.on('change',function(){
                let val = items.val()
                let listWidgetValue = {
                  key: val,
                  label: this.listHandler.elementLabel(val),
                  uri: val
                }
                this.html[0].dispatchEvent(new CustomEvent('widgetValueSelected',{bubbles:true,detail:listWidgetValue}))
              })

          } else {
            items.map((i:any)=>{
              i.select2()
              i.on("select2:close", function (e:any) {
                let val = $(e.currentTarget).val();
                let listWidgetValue = {
                  key: val,
                  label: this.listHandler.elementLabel(val),
                  uri: val
                }
                this.html[0].dispatchEvent(new CustomEvent('widgetValueSelected',{bubbles:true,detail:listWidgetValue}))
              });
            })
          }
        } else {
          this.html.append(noItemsHtml)
        }
      });
      return this
  }
}

/*
export class ListWidgetNew implements IWidget {
  listDatasource: any;
  ParentComponent: any;
  IdCriteriaGroupe: any;
  id_input: string;
  html: string;
  EndClassWidgetParent: EndClassWidgetGroup;
  constructor(inputTypeComponent: any, listDatasource: any, langSearch: any) {
    this.listDatasource = listDatasource;
    this.ParentComponent = inputTypeComponent; // is of type WidgetWrappers
    this.IdCriteriaGroupe =
      this.ParentComponent.GrandParent.ParentCriteriaGroup.id;
    this.EndClassWidgetParent = this.ParentComponent.ParentComponent;
    this.id_input = "ecgrw-" + this.IdCriteriaGroupe + "-input-value";
    this.html =
      '<div class="list-widget"><select id="' +
      this.id_input +
      '"></select><div class="no-items" style="display: none; font-style:italic;">' +
      langSearch.ListWidgetNoItem +
      "</div></div>";
  }

  render() {
    //render this element
    var startClassGroup_value =
      this.ParentComponent.GrandParent.ParentCriteriaGroup.StartClassGroup
        .startClassVal.type;
    var endClassGroup_value =
      this.ParentComponent.GrandParent.ParentCriteriaGroup.EndClassGroup
        .endClassVal.type;
    var ObjectPropertyGroup_value =
      this.ParentComponent.GrandParent.ParentCriteriaGroup.ObjectPropertyGroup
        .value_selected;
    var itc_obj = this.ParentComponent;
    var id_input = "ecgrw-" + this.IdCriteriaGroupe + "-input-value";

    document.getElementById(id_input).style.display = "block";
    (
      document
        .getElementById(id_input)
        .closest(".list-widget")
        .querySelector(".no-items") as HTMLElement
    ).style.display = "none";

    var items = this.listDatasource.getItems(
      startClassGroup_value,
      ObjectPropertyGroup_value,
      endClassGroup_value,
      function (items: string | any[]) {
        if (items.length > 0) {
          $.each(items, function (key, val) {
            var label = this.listHandler.elementLabel(val);
            var uri = this.listHandler.elementUri(val);
            $("#" + id_input).append(
              "<option value='" +
                uri +
                "' title='" +
                label +
                "'>" +
                label +
                "</option>"
            );
          });
          $("#" + id_input).niceSelect();
          $("#" + id_input).on("change", function () {
            $(itc_obj).trigger("change");
          });
        } else {
          document.getElementById(id_input).style.display = "none";
          (
            document
              .getElementById(id_input)
              .closest(".list-widget")
              .querySelector(".no-items") as HTMLElement
          ).style.display = "block";
          //console.warn('No item in widget list for :'+'\n'+' - Start Class => '+startClassGroup_value+'\n'+' - Object property => '+ObjectPropertyGroup_value+'\n'+' - End Class =>'+ endClassGroup_value+' '+'\n'+' - Get data on Url => '+options.url) ;
        }
      }
    );
  }
  

  getValue = function () {
    var id_input = "#" + this.id_input;
    // return $(id_input).val() ;

    return {
      key: $(id_input).val(),
      label: $(id_input).find("option:selected").text(),
      uri: $(id_input).val(),
    };
  };
}*/
/*
export class URLListDatasource {
  listHandler: any;
  constructor(listHandler: any) {
    this.listHandler = listHandler;
  }
  getItems = function (
    startClassGroup_value: string,
    ObjectPropertyGroup_value: string,
    endClassGroup_value: string,
    callback: (arg0: any[]) => void
  ) {
    var options = {
      url: this.listHandler.listUrl(
        startClassGroup_value,
        ObjectPropertyGroup_value,
        endClassGroup_value
      ),
      dataType: "json",
      method: "GET",
      data: {
        dataType: "json",
      },
    };

    var request = $.ajax(options);
    request.done(function (data) {
      var items = this.listHandler.listLocation(
        startClassGroup_value,
        ObjectPropertyGroup_value,
        endClassGroup_value,
        data
      );

      var result: any[] = [];
      $.each(items, function (key, val) {
        var label = this.listHandler.elementLabel(val);
        var uri = this.listHandler.elementUri(val);
        result[uri] = label;
      });

      callback(result);
    });
  };
}*/

export class DatesWidget extends HTMLComponent implements IWidget {
  datesHandler: any;
  value:DateValue
  startClassVal: SelectedVal;
  objectPropVal: SelectedVal;
  endClassVal: SelectedVal;
  addWidgetValue: AddUserInputBtn
  input: JQuery<HTMLElement>;
  inputStart: JQuery<HTMLElement>;
  inputEnd: JQuery<HTMLElement>;
  inputValue: JQuery<HTMLElement>;
  constructor(parentComponent: WidgetWrapper, datesHandler: any,startClassVal:SelectedVal,objectPropVal:SelectedVal,endClassVal:SelectedVal) {
    super('date-widget',parentComponent,null)
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
    this.addWidgetValue = new AddUserInputBtn(this,this.#addValueBtnClicked).render()
    var phrase = "";
    var data_json = null;
    var itc_obj = this.ParentComponent;

    $.ajax({
      url: this.datesHandler.datesUrl(
        this.startClassVal,
        this.objectPropVal,
        this.endClassVal,
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
    let val = {
      start: this.inputStart.val().toString(),
      stop: this.inputEnd.val().toString()
    }
    val = this.#validateDateInput(val)
    this.html[0].dispatchEvent(new CustomEvent('widgetValueSelected',{bubbles:true,detail:val}))
  }
  //TODO: add dialog response to user if dateinput doesn't make sense
  #validateDateInput(value:{start:string,stop:string}){
    if (value.start == "" || value.stop == "") {
      value = null;
    } else {
      if (parseInt(value.start) > parseInt(value.stop)) {
        value = null;
      } else {
        var absoluteStartYear = value.start.startsWith("-")
          ? value.start.substring(1)
          : value.start;
        var paddedAbsoluteStartYear = absoluteStartYear.padStart(4, "0");
        var paddedStartYear = value.start.startsWith("-")
          ? "-" + paddedAbsoluteStartYear
          : paddedAbsoluteStartYear;
        value.start = paddedStartYear + "-01-01T00:00:00";

        var absoluteStopYear = value.stop.startsWith("-")
          ? value.stop.substring(1)
          : value.stop;
        var paddedAbsoluteStopYear = absoluteStopYear.padStart(4, "0");
        var paddedStopYear = value.stop.startsWith("-")
          ? "-" + paddedAbsoluteStopYear
          : paddedAbsoluteStopYear;
        value.stop = paddedStopYear + "-12-31T23:59:59";
      }
    }
    return value
  }

}

export class TimeDatePickerWidget extends HTMLComponent implements IWidget {
  datesHandler: any;
  ParentComponent: any;
  formatDate: any;
  format: any;inputStart: JQuery<HTMLElement>;
  inputEnd: JQuery<HTMLElement>;
  inputValue: JQuery<HTMLElement>;
  infoBtn: InfoBtn;
  addValueBtn: AddUserInputBtn;
  value: DateTimePickerValue;
  constructor(
    parentComponent: WidgetWrapper,
    datesHandler: any,
    format: any,
  ) {
    super('date-widget',parentComponent,null)
    this.datesHandler = datesHandler;
    this.formatDate = format;

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
    this.addValueBtn = new AddUserInputBtn(this,this.#addValueBtnClicked).render()

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
      start: this.inputStart.datepicker('getDate'),
      stop: this.inputEnd.datepicker('getDate'),
    }
    this.value = this.#validateInput(val)
    this.html[0].dispatchEvent(new CustomEvent('widgetValueSelected',{bubbles:true,detail:this.value}))
  }
  //TODO add dialog for user if input is unreasonable
  #validateInput(val:{start:Date,stop:Date}){
    if(val.start.toString() == '' || val.stop.toString() == ''){
      console.warn(`no input received on DateTimePicker`)
      return null
    }
    if(val.start > val.stop){
      console.warn(`startVal is bigger then endVal`)
      return null
    }

    if (this.formatDate == "day") {
      this.dateToYMD(val.start, "day");
       val = {
        start: this.dateToYMD(val.start, "day"),
        stop: this.dateToYMD(val.stop, "day"),
      };
      if (val.start != null) {
        val.start = new Date(val.start + "T00:00:00");
      }
      if (val.stop != null) {
        val.stop = new Date(val.stop + "T23:59:59");
      }
    } else {
      val = {
        start: this.dateToYMD(val.start, false),
        stop: this.dateToYMD(val.stop, false),
      };
      if (val.start != null) {
        val.start = new Date(val.start + "-01-01T00:00:00");
      }
      if (val.stop != null) {
        val.stop = new Date(val.stop + "-12-31T23:59:59");
      }
    }
    if (val.start == null && val.stop == null) {
      val = null;
    }
    let dateTimePickerVal:DateTimePickerValue = {
      key: val.start + " " + val.stop,
      // TODO : this is not translated
      label: this.getValueLabel(val.start,val.stop),
      start: val.start,
      stop: val.stop,
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
}

export class SearchWidget extends HTMLComponent implements IWidget {
  addValueBtn: AddUserInputBtn;
  value: SearchWidgetValue
  searchInput: JQuery<HTMLElement>;

  constructor(parentComponent: HTMLComponent) {
    super('search-widget',parentComponent,null)
  }

  render() {
    super.render()
    this.searchInput = $(`<input />`)
    this.html.append(this.searchInput)
    this.addValueBtn = new AddUserInputBtn(this,this.#addValueBtnClicked)
    return this
  }
  #addValueBtnClicked = () =>{
    this.searchInput.trigger('change')
    let searchWidgetValue:SearchWidgetValue = {
      key:this.searchInput.val().toString(),
      label:this.searchInput.val().toString(),
      search:this.searchInput.val().toString()
    }
    this.value = this.#validateInput(searchWidgetValue)
    this.html[0].dispatchEvent(new CustomEvent('widgetValueSelected',{bubbles:true,detail:this.value}))
  }

  //TODO add dialog for input sanitation
  #validateInput(val:SearchWidgetValue){
    if(this.searchInput.val().toString() == ''){
      console.warn('empty string provided in searchWidget')
      val = null
    }
    return val
  }
}

export class BooleanWidget extends HTMLComponent implements IWidget {
  value:BooleanWidgetValue
  constructor(parentComponent: WidgetWrapper) {
    super('boolean-widget',parentComponent,null)
  }

  render() {
    super.render()
    let trueSpan = $(`<span class="boolean-value">${getSettings().langSearch.true}</span>'`)
    let orSpan = $(`<span class="or">${getSettings().langSearch.Or}</span>`)
    let falseSpan = $(`<span class="boolean-value"">'${getSettings().langSearch.false}</span>`)
    this.html.append(trueSpan).append(orSpan).append(falseSpan)

    trueSpan[0].addEventListener('click',(e)=>{
      this.value = {
        key:true,
        label:getSettings().langSearch.true,
        boolean: true
      }
      this.html[0].dispatchEvent(new CustomEvent('widgetValueSelected',{bubbles:true,detail:this.value}))
    })

    falseSpan[0].addEventListener('click',(e)=>{
      this.value = {
        key:false,
        label:getSettings().langSearch.false,
        boolean: false
      }
      this.html[0].dispatchEvent(new CustomEvent('widgetValueSelected',{bubbles:true,detail:this.value}))
    })
    return this
  }
}

// IMPORTANT Do we need a NoWidget
export class NoWidget extends HTMLComponent implements IWidget {

  value:any = null
  constructor(parentComponent: WidgetWrapper) {
    super('no-widget',parentComponent,null)
  }

  render() {
    return this
  }
}

/*
export class TreeWidget implements IWidget {
  loaderHandler: any;
  ParentComponent: any;
  langSearch: any;
  IdCriteriaGroupe: any;
  html: string;
  itc_obj: any;
  jsTree: any;
  EndClassWidgetParent: EndClassWidgetGroup;
  constructor(
    inputTypeComponent: any,
    loaderHandler: any,
    settings: any,
    langSearch: any
  ) {
    this.loaderHandler = loaderHandler;
    this.ParentComponent = inputTypeComponent;
    this.langSearch = langSearch;
    this.IdCriteriaGroupe =
      this.ParentComponent.GrandParent.ParentCriteriaGroup.id;
    this.html =
      '<a id="ecgrw-' +
      this.IdCriteriaGroupe +
      '-input" class="treeBtnDisplay">' +
      UiuxConfig.ICON_TREE +
      '</a><input id="ecgrw-' +
      this.IdCriteriaGroupe +
      '-input-value" type="hidden"/><div  id="ecgrw-' +
      this.IdCriteriaGroupe +
      '-displayLayer" class="treeLayer"><div class="treeClose"><i class="far fa-times-circle"></i></div><div class="treeNotice"></div><div class="treeDisplay" id="ecgrw-' +
      this.IdCriteriaGroupe +
      '-display"></div><div class="treeActions"><a class="treeCancel">' +
      this.langSearch.TreeWidgetDelete +
      '</a><a class="treeSubmit">' +
      this.langSearch.TreeWidgetSelect +
      "</a></div></div>";
    this.EndClassWidgetParent = this.ParentComponent.ParentComponent;
  }

  render() {
    //render this element
    var startClassGroup_value =
      this.ParentComponent.GrandParent.ParentCriteriaGroup.StartClassGroup
        .startClassVal.type;
    var endClassGroup_value =
      this.ParentComponent.GrandParent.ParentCriteriaGroup.EndClassGroup
        .endClassVal.type;
    var ObjectPropertyGroup_value =
      this.ParentComponent.GrandParent.ParentCriteriaGroup.ObjectPropertyGroup
        .objectPropVal;

    var id_inputs = this.IdCriteriaGroupe;
    this.itc_obj = this.ParentComponent;

    var self = this;
    var options = {
      core: {
        multiple: true,
        data: function (
          node: { id: string },
          callback: {
            call: (arg0: any, arg1: { id: any; text: any }[]) => void;
          }
        ) {
          var options = {
            url:
              node.id === "#"
                ? this.loaderHandler.treeRootUrl(
                    startClassGroup_value,
                    ObjectPropertyGroup_value,
                    endClassGroup_value
                  )
                : this.loaderHandler.treeChildrenUrl(
                    startClassGroup_value,
                    ObjectPropertyGroup_value,
                    endClassGroup_value,
                    node.id
                  ),
            dataType: "json",
            method: "GET",
            data: {
              dataType: "json",
            },
          };

          var request = $.ajax(options);

          request.done(function (data) {
            var result = [];
            var items = this.loaderHandler.nodeListLocation(
              startClassGroup_value,
              ObjectPropertyGroup_value,
              endClassGroup_value,
              data
            );
            for (var i = 0; i < items.length; i++) {
              var aNode: {
                id: string;
                text: string;
                children?: boolean;
                state?: { disabled: boolean };
                parent?: any;
              } = {
                id: this.loaderHandler.nodeUri(items[i]),
                text: this.loaderHandler.nodeLabel(items[i]),
              };
              if (this.loaderHandler.nodeHasChildren(items[i])) {
                aNode.children = true;
              }
              if (this.loaderHandler.nodeDisabled(items[i])) {
                aNode.state = {
                  disabled: true, // node disabled
                };
              }
              aNode.parent = node.id;
              result.push(aNode);
            }
            callback.call(this, result);
            if (node.id === "#") {
              self.onTreeDataLoaded(result);
            }
          });
        },
        themes: {
          icons: false,
        },
      },
      "massload" : {
					"url" : loaderHandler.treeChildrenUrl(startClassGroup_value, ObjectPropertyGroup_value, endClassGroup_value, node.id),
					"data" : function (nodes) {
					  return { "ids" : nodes.join(",") };
					}
				},
      checkbox: {
        keep_selected_style: false,
        three_state: false,
        cascade: "down+undetermined",
        cascade_to_disabled: true,
      },
      plugins: ["changed", "wholerow", "checkbox" ],
    };

    this.jsTree = $("#ecgrw-" + id_inputs + "-display").jstree(options);

    $("#ecgrw-" + this.IdCriteriaGroupe + "-input").on(
      "click",
      { arg1: this },
      this.onClickDisplay
    );
    //disable/enable on max selction
    this.jsTree.on("changed.jstree", { arg1: this }, this.onChangedJstree);
    this.jsTree.on("after_open.jstree", { arg1: this }, this.onChangedJstree);

    $("#ecgrw-" + this.IdCriteriaGroupe + "-displayLayer")
      .find(".treeSubmit")
      .on("click", { arg1: this }, this.onClickSelect);
    $("#ecgrw-" + this.IdCriteriaGroupe + "-displayLayer")
      .find(".treeCancel")
      .on("click", { arg1: this }, this.onClickCancel);
    $("#ecgrw-" + this.IdCriteriaGroupe + "-displayLayer")
      .find(".treeClose")
      .on("click", { arg1: this }, this.onClickClose);

    $("#ecgrw-" + this.IdCriteriaGroupe + "-displayLayer").hide();
  }

  onTreeDataLoaded = function onTreeDataLoaded(result: string | any[]) {
    if (result.length == 0) {
      $("#ecgrw-" + this.IdCriteriaGroupe + "-displayLayer .treeNotice")
        .text(this.langSearch.TreeWidgetNoData)
        .show();
    } else {
      $("#ecgrw-" + this.IdCriteriaGroupe + "-displayLayer .treeNotice").hide();
    }
  };

  //limit to 3 selction
  onChangedJstree = function (e: { data: { arg1: any } }, data: any) {
    let this_ = e.data.arg1;
    var items = $(this_.jsTree).find("li.jstree-node");

    var selecteds = this_.jsTree.jstree().get_top_checked();
    for (var i = 0; i < items.length; i++) {
      var id = $(items[i]).attr("id");
      if (selecteds.indexOf(id) > -1) {
        $(items[i]).addClass("tree-item-selected");
      } else {
        $(items[i]).removeClass("tree-item-selected");
      }
      if ($(items[i]).parents(".tree-item-selected").length > 0) {
        var node = this_.jsTree.jstree(true).get_node(id);
        if (!this_.jsTree.jstree(true).is_disabled(node)) {
          $(items[i]).addClass("is-reactivable");
          this_.jsTree.jstree(true).disable_checkbox(node);
          this_.jsTree.jstree(true).disable_node(node);
        }
      } else {
        if ($(items[i]).hasClass("is-reactivable")) {
          $(items[i]).addClass("red");
          this_.jsTree.jstree("enable_checkbox", id);
          this_.jsTree.jstree(true).enable_node(id);
        }
      }
    }

    if (this_.jsTree.jstree().get_top_checked().length >= this.settings.maxOr) {
      for (var i = 0; i < items.length; i++) {
        var id = $(items[i]).attr("id");
        if (selecteds.indexOf(id) == -1) {
          var node = this_.jsTree.jstree(true).get_node(id);
          if (!this_.jsTree.jstree(true).is_disabled(node)) {
            $(items[i]).addClass("is-reactivable");
            this_.jsTree.jstree(true).disable_checkbox(node);
            this_.jsTree.jstree(true).disable_node(node);
          }
        }
      }
      this_.jsTree.addClass("max-selected");
    } else {
      if (this_.jsTree.hasClass("max-selected")) {
        var items = $(this_.jsTree).find("li.jstree-node");
        for (var i = 0; i < items.length; i++) {
          var id = $(items[i]).attr("id");
          if (selecteds.indexOf(id) == -1) {
            if ($(items[i]).hasClass("is-reactivable")) {
              $(items[i]).addClass("red");
              if ($(items[i]).parents(".tree-item-selected").length == 0) {
                this_.jsTree.jstree("enable_checkbox", id);
                this_.jsTree.jstree(true).enable_node(id);
              }
            }
          }
        }
        this_.jsTree.removeClass("max-selected");
      }
    }
  };

  onClickDisplay = function (e: any) {
    let this_ = e.data.arg1;
    $("#ecgrw-" + this_.IdCriteriaGroupe + "-displayLayer").show();
  };
  onClickCancel = function (e: any) {
    let this_ = e.data.arg1;
    this_.jsTree.jstree().deselect_all();
    //$('#ecgrw-'+this_.IdCriteriaGroupe+'-displayLayer').hide() ;
  };
  onClickSelect = function (e: any) {
    let this_ = e.data.arg1;
    $("#ecgrw-" + this_.IdCriteriaGroupe + "-displayLayer").hide();
    $(this_.itc_obj).trigger("change");
  };
  onClickClose = function (e: any) {
    let this_ = e.data.arg1;
    $("#ecgrw-" + this_.IdCriteriaGroupe + "-displayLayer").hide();
  };

  getValue = function () {
    var checked = this.jsTree.jstree().get_top_checked(true);

    // rebuild a clean data structure
    var values = [];
    for (var node in checked) {
      var v = {
        key: checked[node].id,
        label: checked[node].original.text,
        uri: checked[node].id,
      };
      values.push(v);
    }

    return values;
  };
}*/
