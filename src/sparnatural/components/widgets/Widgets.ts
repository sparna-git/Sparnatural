import UiuxConfig from "../../../configs/fixed-configs/UiuxConfig";
import "@chenfengyuan/datepicker";
import "select2";
import "select2/dist/css/select2.css";
import tippy from "tippy.js";
import ISettings from "../../../configs/client-configs/ISettings";
import IWidget from "./IWidget";
import EndClassWidgetGroup from "./EndClassWidgetGroup";
import CriteriaGroup from "../criterialist/CriteriaGroup";
import LocalCacheData from "../../datastorage/LocalCacheData";
// IMPORTANT TODO refactor HtmlContainer.

export class AutoCompleteWidget implements IWidget {
  autocompleteHandler: any;
  ParentComponent: any;
  IdCriteriaGroupe: any;
  html: string;
  EndClassWidgetParent: EndClassWidgetGroup;
  constructor(inputTypeComponent: any, autocompleteHandler: any) {
    this.autocompleteHandler = autocompleteHandler;
    this.ParentComponent = inputTypeComponent;
    this.EndClassWidgetParent = this.ParentComponent.ParentComponent;
    this.IdCriteriaGroupe =
      this.ParentComponent.GrandParent.ParentCriteriaGroup.id;
    this.html =
      '<input id="ecgrw-' +
      this.IdCriteriaGroupe +
      '-input" /><input id="ecgrw-' +
      this.IdCriteriaGroupe +
      '-input-value" type="hidden"/>';
  }

  render() {
    //render this element
    var startClassGroup_value =
      this.ParentComponent.GrandParent.ParentCriteriaGroup.StartClassGroup
        .value_selected;
    var endClassGroup_value =
      this.ParentComponent.GrandParent.ParentCriteriaGroup.EndClassGroup
        .value_selected;
    var ObjectPropertyGroup_value =
      this.ParentComponent.GrandParent.ParentCriteriaGroup.ObjectPropertyGroup
        .value_selected;

    var id_inputs = this.IdCriteriaGroupe;
    var itc_obj = this.ParentComponent;
    var isMatch = this.autocompleteHandler.enableMatch(
      startClassGroup_value,
      ObjectPropertyGroup_value,
      endClassGroup_value
    );

    let options = {
      // ajaxSettings: {crossDomain: true, type: 'GET'} ,
      url: function (phrase: any) {
        return this.autocompleteHandler.autocompleteUrl(
          startClassGroup_value,
          ObjectPropertyGroup_value,
          endClassGroup_value,
          phrase
        );
      },
      listLocation: function (data: any) {
        return this.autocompleteHandler.listLocation(
          startClassGroup_value,
          ObjectPropertyGroup_value,
          endClassGroup_value,
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
        data.phrase = $("#ecgrw-" + id_inputs + "-input").val();
        return data;
      },

      list: {
        match: {
          enabled: isMatch,
        },

        onChooseEvent: function () {
          var value = $("#ecgrw-" + id_inputs + "-input").getSelectedItemData();

          var label = this.autocompleteHandler.elementLabel(value);
          var uri = this.autocompleteHandler.elementUri(value);
          $("#ecgrw-" + id_inputs + "-input").val(label);
          $("#ecgrw-" + id_inputs + "-input-value")
            .val(uri)
            .trigger("change");
          $(itc_obj).trigger("change");
        },
      },

      requestDelay: 400,
    };
    //Need to add in html befor

    $("#ecgrw-" + id_inputs + "-input").easyAutocomplete(options);
  }

  getValue = function () {
    var id_input = "#ecgrw-" + this.IdCriteriaGroupe + "-input-value";
    var id_input_label = "#ecgrw-" + this.IdCriteriaGroupe + "-input";

    return {
      key: $(id_input).val(),
      label: $(id_input_label).val(),
      uri: $(id_input).val(),
    };
  };
}

export class ListWidget implements IWidget {
  listHandler: any;
  ParentComponent: any;
  IdCriteriaGroupe: any;
  sort: boolean;
  id_input: string;
  html: string;
  settings: ISettings;
  ParentCriteriaGroup: CriteriaGroup;
  constructor(
    inputTypeComponent: any,
    listHandler: any,
    langSearch: any,
    settings: ISettings,
    sort: boolean
  ) {
    this.listHandler = listHandler;
    this.ParentComponent = inputTypeComponent;
    this.IdCriteriaGroupe =
      this.ParentComponent.GrandParent.ParentCriteriaGroup.id;
    this.sort = sort;
    this.settings = settings;
    this.id_input = "ecgrw-" + this.IdCriteriaGroupe + "-input-value";
    this.html =
      '<div class="list-widget"><select id="' +
      this.id_input +
      '"></select><div class="no-items" style="display: none; font-style:italic;">' +
      langSearch.ListWidgetNoItem +
      "</div></div>";
    this.ParentCriteriaGroup =
      this.ParentComponent.GrandParent.ParentCriteriaGroup;
  }

  render() {
    var startClassGroup_value =
      this.ParentComponent.GrandParent.ParentCriteriaGroup.StartClassGroup
        .startClassVal;
    var endClassGroup_value =
      this.ParentComponent.GrandParent.ParentCriteriaGroup.EndClassGroup
        .endClassVal;
    var ObjectPropertyGroup_value =
      this.ParentComponent.GrandParent.ParentCriteriaGroup.ObjectPropertyGroup
        .value_selected;
    var itc_obj = this.ParentComponent;

    let url = this.listHandler.listUrl(
      startClassGroup_value,
      ObjectPropertyGroup_value,
      endClassGroup_value
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
          startClassGroup_value,
          ObjectPropertyGroup_value,
          endClassGroup_value,
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
            $("#" + this.id_input).append(
              "<option value='" + uri + "'>" + label + "</option>"
            );
          });
          if (items.length < 30) {
            $("#" + this.id_input).niceSelect();
            $("#" + this.id_input).on("change", function () {
              $(itc_obj).trigger("change");
            });
          } else {
            $("#" + this.id_input).select2();
            $("#" + this.id_input).on("select2:close", function () {
              $(itc_obj).trigger("change");
            });
          }
        } else {
          document.getElementById(this.id_input).style.display = "none";
          (
            document
              .getElementById(this.id_input)
              .closest(".list-widget")
              .querySelector(".no-items") as HTMLElement
          ).style.display = "block";
          //console.warn('No item in widget list for :'+'\n'+' - Start Class => '+startClassGroup_value+'\n'+' - Object property => '+ObjectPropertyGroup_value+'\n'+' - End Class =>'+ endClassGroup_value+' '+'\n'+' - Get data on Url => '+options.url) ;
        }
      });
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
}

export class ListWidgetNew implements IWidget {
  listDatasource: any;
  ParentComponent: any;
  IdCriteriaGroupe: any;
  id_input: string;
  html: string;
  EndClassWidgetParent: EndClassWidgetGroup;
  constructor(inputTypeComponent: any, listDatasource: any, langSearch: any) {
    this.listDatasource = listDatasource;
    this.ParentComponent = inputTypeComponent; // is of type ObjectPropertyTypeWidgets
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
        .startClassVal;
    var endClassGroup_value =
      this.ParentComponent.GrandParent.ParentCriteriaGroup.EndClassGroup
        .endClassVal;
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
}

export class URLListDatasource {
  listHandler: any;
  constructor(listHandler: any) {
    this.listHandler = listHandler;
  }
  getItems = function (
    startClassGroup_value: any,
    ObjectPropertyGroup_value: any,
    endClassGroup_value: any,
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
}

export class DatesWidget implements IWidget {
  datesHandler: any;
  ParentComponent: any;
  IdCriteriaGroupe: any;
  html: string;
  EndClassWidgetParent: EndClassWidgetGroup;
  constructor(inputTypeComponent: any, datesHandler: any, langSearch: any) {
    this.datesHandler = datesHandler;
    this.ParentComponent = inputTypeComponent;
    this.IdCriteriaGroupe =
      this.ParentComponent.GrandParent.ParentCriteriaGroup.id;
    this.EndClassWidgetParent = this.ParentComponent.ParentComponent;
    this.html =
      '<div class="date-widget"><input id="ecgrw-date-' +
      this.IdCriteriaGroupe +
      '-input" placeholder="' +
      langSearch.PlaceHolderDatePeriod +
      '" /><input id="ecgrw-date-' +
      this.IdCriteriaGroupe +
      '-input-start" placeholder="' +
      langSearch.TimeWidgetDateFrom +
      '"/><input id="ecgrw-date-' +
      this.IdCriteriaGroupe +
      '-input-stop" placeholder="' +
      langSearch.TimeWidgetDateTo +
      '" /><input id="ecgrw-date-' +
      this.IdCriteriaGroupe +
      '-input-value" type="hidden"/><button class="button-add" id="ecgrw-date-' +
      this.IdCriteriaGroupe +
      '-add">' +
      langSearch.ButtonAdd +
      "</button></div>";
  }

  render() {
    //render this element
    var startClassGroup_value =
      this.ParentComponent.GrandParent.ParentCriteriaGroup.StartClassGroup
        .value_selected;
    var endClassGroup_value =
      this.ParentComponent.GrandParent.ParentCriteriaGroup.EndClassGroup
        .value_selected;
    var ObjectPropertyGroup_value =
      this.ParentComponent.GrandParent.ParentCriteriaGroup.ObjectPropertyGroup
        .value_selected;
    var phrase = "";
    var data_json = null;

    var id_inputs = this.IdCriteriaGroupe;
    var itc_obj = this.ParentComponent;

    $.ajax({
      url: this.datesHandler.datesUrl(
        startClassGroup_value,
        ObjectPropertyGroup_value,
        endClassGroup_value,
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
          var values = $(
            "#ecgrw-date-" + id_inputs + "-input"
          ).getSelectedItemData();
          var value = this.datesHandler.elementLabel(values);
          var start = this.datesHandler.elementStart(values);
          var stop = this.datesHandler.elementEnd(values);

          $("#ecgrw-date-" + id_inputs + "-input")
            .val(value)
            .trigger("change");
          $("#ecgrw-date-" + id_inputs + "-input-start")
            .val(start)
            .trigger("change");
          $("#ecgrw-date-" + id_inputs + "-input-stop")
            .val(stop)
            .trigger("change");

          $("#ecgrw-" + id_inputs + "-input-value")
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

    $("#ecgrw-date-" + id_inputs + "-input").easyAutocomplete(options);
    $("#ecgrw-date-" + this.IdCriteriaGroupe + "-add").on("click", function () {
      $(itc_obj).trigger("change");
    });
  }

  getValue = function () {
    var id_input = "#ecgrw-date-" + this.IdCriteriaGroupe + "-input";

    var value = {
      start: $(id_input + "-start")
        .val()
        .toString(),
      stop: $(id_input + "-stop")
        .val()
        .toString(),
    };

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

    return {
      key: value.start + " " + value.stop,
      // TODO : this is not translated
      label:
        "De " +
        $(id_input + "-start").val() +
        " à " +
        $(id_input + "-stop").val() +
        "<br/>(" +
        $(id_input).val() +
        ")",
      start: value.start,
      stop: value.stop,
    };
  };
}

export class TimeDatePickerWidget implements IWidget {
  datesHandler: any;
  ParentComponent: any;
  IdCriteriaGroupe: any;
  formatDate: any;
  html: string;
  langSearch: any;
  format: any;
  EndClassWidgetParent: EndClassWidgetGroup;
  constructor(
    inputTypeComponent: any,
    datesHandler: any,
    format: any,
    langSearch: any
  ) {
    this.datesHandler = datesHandler;
    this.ParentComponent = inputTypeComponent;
    this.EndClassWidgetParent = this.ParentComponent.ParentComponent;
    this.IdCriteriaGroupe =
      this.ParentComponent.ParentComponent?.ParentCriteriaGroup.id;
    this.formatDate = format;

    let placeHolder =
      this.formatDate == "day"
        ? langSearch.PlaceholderTimeDateDayFormat
        : langSearch.PlaceholderTimeDateFormat;
    this.html =
      '<div class="date-widget">' +
      langSearch.LabelDateFrom +
      ' <input id="ecgrw-date-' +
      this.IdCriteriaGroupe +
      '-input-start" placeholder="' +
      placeHolder +
      '" autocomplete="off"/> ' +
      langSearch.LabelDateTo +
      ' <input id="ecgrw-date-' +
      this.IdCriteriaGroupe +
      '-input-stop" placeholder="' +
      placeHolder +
      '" autocomplete="off" /><input id="ecgrw-date-' +
      this.IdCriteriaGroupe +
      '-input-value" type="hidden"/>';
    this.html +=
      '&nbsp;<span id="circle-info-' +
      this.IdCriteriaGroupe +
      '" data-tippy-content="' +
      (this.formatDate == "day"
        ? langSearch.TimeWidgetDateHelp
        : langSearch.TimeWidgetYearHelp) +
      '">' +
      UiuxConfig.ICON_CIRCLE_INFO +
      '</span><button class="button-add" id="ecgrw-date-' +
      this.IdCriteriaGroupe +
      '-add">' +
      langSearch.ButtonAdd +
      "</button></div>";
    this.langSearch = langSearch;
  }

  render() {
    //render this element
    var id_inputs = this.IdCriteriaGroupe;
    var itc_obj = this.ParentComponent;

    this.format =
      this.formatDate == "day"
        ? this.langSearch.InputTimeDateDayFormat
        : this.langSearch.InputTimeDateFormat;

    var options: {
      language: any;
      autoHide: boolean;
      format: any;
      date: any;
      startView: number;
    } = {
      language: this.langSearch.LangCodeTimeDate,
      autoHide: true,
      format: this.format,
      date: null,
      startView: 2,
    };

    $(
      "#ecgrw-date-" +
        id_inputs +
        "-input-start, #ecgrw-date-" +
        id_inputs +
        "-input-stop"
    ).datepicker(options);
    $("#ecgrw-date-" + this.IdCriteriaGroupe + "-add").on("click", function () {
      $(itc_obj).trigger("change");
    });

    // set a tooltip on the info circle
    var tippySettings = Object.assign(
      {},
      this.ParentComponent.settings.tooltipConfig
    );
    tippySettings.placement = "left";
    tippySettings.trigger = "click";
    tippySettings.offset = [this.formatDate == "day" ? 75 : 50, -20];
    tippySettings.delay = [0, 0];
    tippy("#circle-info-" + this.IdCriteriaGroupe, tippySettings);
  }

  getValue = function () {
    var id_input = "#ecgrw-date-" + this.IdCriteriaGroupe + "-input";
    var start = null;
    var end = null;
    var value = null;

    if ($(id_input + "-start").val() != "") {
      start = $(id_input + "-start").datepicker("getDate");

      // fix for negative years
      if (
        $(id_input + "-start")
          .val()
          .toString()
          .startsWith("-") &&
        !start.getFullYear().toString().startsWith("-")
      ) {
        start.setFullYear($(id_input + "-start").val() as number);
      }
    }
    if ($(id_input + "-stop").val() != "") {
      end = $(id_input + "-stop").datepicker("getDate");

      // fix for negative years
      if (
        $(id_input + "-stop")
          .val()
          .toString()
          .startsWith("-") &&
        !end.getFullYear().toString().startsWith("-")
      ) {
        end.setFullYear($(id_input + "-stop").val() as number);
      }
    }

    // just compare the years to make sure we have a proper interval
    // otherwise this uses an alphabetical comparison
    if (
      start != null &&
      end != null &&
      end.getFullYear() < start.getFullYear()
    ) {
      return null;
    }

    if (this.formatDate == "day") {
      this.dateToYMD(start, "day");
      value = {
        start: this.dateToYMD(start, "day"),
        stop: this.dateToYMD(end, "day"),
      };
      if (value.start != null) {
        value.start = value.start + "T00:00:00";
      }
      if (value.stop != null) {
        value.stop = value.stop + "T23:59:59";
      }
    } else {
      value = {
        start: this.dateToYMD(start, false),
        stop: this.dateToYMD(end, false),
      };
      if (value.start != null) {
        value.start = value.start + "-01-01T00:00:00";
      }
      if (value.stop != null) {
        value.stop = value.stop + "-12-31T23:59:59";
      }
    }

    if (value.start == null && value.stop == null) {
      value = null;
    }

    return {
      key: value.start + " " + value.stop,
      // TODO : this is not translated
      label: this.getValueLabel(),
      start: value.start,
      stop: value.stop,
    };
  };

  getValueLabel = function () {
    var id_input = "#ecgrw-date-" + this.IdCriteriaGroupe + "-input";
    var start = $(id_input + "-start").val();
    var end = $(id_input + "-stop").val();
    var valueLabel = null;
    if (start != "" && end != "") {
      valueLabel =
        this.langSearch.LabelDateFrom +
        " " +
        $(id_input + "-start").val() +
        " " +
        this.langSearch.LabelDateTo +
        " " +
        $(id_input + "-stop").val();
    } else if (start != "") {
      valueLabel =
        this.langSearch.DisplayValueDateFrom +
        " " +
        $(id_input + "-start").val();
    } else if (end != "") {
      valueLabel =
        this.langSearch.DisplayValueDateTo + " " + $(id_input + "-stop").val();
    }

    return valueLabel;
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

export class SearchWidget implements IWidget {
  ParentComponent: any;
  IdCriteriaGroupe: any;
  html: string;
  EndClassWidgetParent: EndClassWidgetGroup;
  constructor(inputTypeComponent: any, langSearch: any) {
    this.ParentComponent = inputTypeComponent;
    this.IdCriteriaGroupe =
      this.ParentComponent.GrandParent.ParentCriteriaGroup.id;
    this.EndClassWidgetParent = this.ParentComponent.ParentComponent;
    this.html =
      '<div class="search-widget"><input id="ecgrw-search-' +
      this.IdCriteriaGroupe +
      '-input-value" /><button id="ecgrw-search-' +
      this.IdCriteriaGroupe +
      '-add" class="button-add">' +
      langSearch.ButtonAdd +
      "</button></div>";
  }

  render() {
    //render this element
    var id_inputs = this.IdCriteriaGroupe;
    var itc_obj = this.ParentComponent;
    var CriteriaGroup = this.ParentComponent.GrandParent.ParentCriteriaGroup;

    $("#ecgrw-search-" + this.IdCriteriaGroupe + "-add").on(
      "click",
      function () {
        $("#ecgrw-search-" + id_inputs + "-input-value").trigger("change");
        $(itc_obj).trigger("change");
        // N'est plus à cacher, lutilisateur peut choisi d'afficher les valeurs
        //$(CriteriaGroup.ComponentHtml[0]).addClass('hideEndClassProperty') ;
      }
    );
  }

  getValue = function () {
    var id_input = "#ecgrw-search-" + this.IdCriteriaGroupe + "-input-value";
    // return $(id_input).val() ;

    return {
      key: $(id_input).val(),
      label: $(id_input).val(),
      search: $(id_input).val(),
    };
  };
}

export class BooleanWidget implements IWidget {
  ParentComponent: any;
  IdCriteriaGroupe: any;
  html: string;
  EndClassWidgetParent: EndClassWidgetGroup;
  constructor(inputTypeComponent: any, langSearch: any) {
    this.ParentComponent = inputTypeComponent;
    this.IdCriteriaGroupe =
      this.ParentComponent.GrandParent.ParentCriteriaGroup.id;
    this.EndClassWidgetParent = this.ParentComponent.ParentComponent;
    this.html =
      '<div class="boolean-widget" id="boolean-widget-' +
      this.IdCriteriaGroupe +
      '"><span class="boolean-value" id="boolean-widget-' +
      this.IdCriteriaGroupe +
      '-true">' +
      langSearch.true +
      '</span> <span class="or">' +
      langSearch.Or +
      '</span> <span class="boolean-value" id="boolean-widget-' +
      this.IdCriteriaGroupe +
      '-false">' +
      langSearch.false +
      '</span><input type="hidden" id="boolean-widget-' +
      this.IdCriteriaGroupe +
      '-value" /></div>';
  }

  render() {
    var id_inputs = this.IdCriteriaGroupe;
    var itc_obj = this.ParentComponent;
    var CriteriaGroup = this.ParentComponent.GrandParent.ParentCriteriaGroup;
    var id_input = "#boolean-widget-" + this.IdCriteriaGroupe + "-value";

    $("#boolean-widget-" + this.IdCriteriaGroupe + "-true").on(
      "click",
      function () {
        $(id_input).val("true");
        $(itc_obj).trigger("change");
      }
    );

    $("#boolean-widget-" + this.IdCriteriaGroupe + "-false").on(
      "click",
      function () {
        $(id_input).val("false");
        $(itc_obj).trigger("change");
      }
    );
  }

  getValue = function () {
    var id_input = "#boolean-widget-" + this.IdCriteriaGroupe + "-value";

    return {
      key: $(id_input).val(),
      label:
        $(id_input).val() == "true"
          ? this.langSearch.true
          : this.langSearch.false,
      boolean: $(id_input).val(),
    };
  };
}

// IMPORTANT Do we need a NoWidget
export class NoWidget implements IWidget {
  inputTypeComponent: any;
  html: string;
  constructor(inputTypeComponent: any) {
    this.inputTypeComponent;
    this.html = null;
    this.EndClassWidgetParent = null;
  }
  EndClassWidgetParent: EndClassWidgetGroup;

  render() {
    // nothing
  }

  getValue = function (): any {
    // cannot provide any value
    return null;
  };
}

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
        .value_selected;
    var endClassGroup_value =
      this.ParentComponent.GrandParent.ParentCriteriaGroup.EndClassGroup
        .value_selected;
    var ObjectPropertyGroup_value =
      this.ParentComponent.GrandParent.ParentCriteriaGroup.ObjectPropertyGroup
        .value_selected;

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
      /*"massload" : {
					"url" : loaderHandler.treeChildrenUrl(startClassGroup_value, ObjectPropertyGroup_value, endClassGroup_value, node.id),
					"data" : function (nodes) {
					  return { "ids" : nodes.join(",") };
					}
				},*/
      checkbox: {
        keep_selected_style: false,
        three_state: false,
        cascade: "down+undetermined",
        cascade_to_disabled: true,
      },
      plugins: ["changed", "wholerow", "checkbox" /*, "massload", "state" */],
    };
    //Need to add in html befor

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
}
