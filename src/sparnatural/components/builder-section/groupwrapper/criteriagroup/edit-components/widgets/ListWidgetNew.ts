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


