import { Pattern, ValuesPattern } from "sparqljs";
import UiuxConfig from "../../IconsConstants";
import { SelectedVal } from "../../../generators/ISparJson";
import { AbstractWidget, ValueRepetition, WidgetValue } from "../AbstractWidget";
import "jstree"
import ISettings from "../../../../configs/client-configs/ISettings";
import WidgetWrapper from "../../builder-section/groupwrapper/criteriagroup/edit-components/WidgetWrapper";
import { ValuePatternRow } from "sparqljs";
import * as DataFactory from "@rdfjs/data-model" ;


require("jstree/dist/themes/default/style.min.css");

export interface TreeWidgetValue extends WidgetValue {
  value: {
    key: string;
    label: string;
    uri: string;
  };
}

export class TreeWidget extends AbstractWidget {
  protected widgetValues: TreeWidgetValue[];
  loaderHandler: any;
  langSearch: any;
  IdCriteriaGroupe: any;
  jsTree: any;
  value: TreeWidgetValue;
  // html content
  button: any;
  hiddenInput: any;
  startClassVal: SelectedVal;
  objectPropVal: SelectedVal;
  endClassVal: SelectedVal;
  settings:ISettings
  displayLayer: JQuery<HTMLElement>
  sort:boolean;

  constructor(
    parentComponent: WidgetWrapper,
    loaderHandler: any,
    settings: ISettings,
    langSearch: string,
    startClassVal: SelectedVal,
    objectPropVal: SelectedVal,
    endClassVal: SelectedVal,
    sort: boolean
  ) {
    super(
      "tree-widget",
      parentComponent,
      null,
      startClassVal,
      objectPropVal,
      endClassVal,
      ValueRepetition.MULTIPLE
    );
    this.loaderHandler = loaderHandler;
    this.langSearch = langSearch;
    this.IdCriteriaGroupe = "id";

    this.startClassVal = startClassVal;
    this.endClassVal = endClassVal;
    this.objectPropVal = objectPropVal;
    this.sort = sort;
  }

  render() {
    super.render();

    this.button = $(
      '<a id="ecgrw-' +
        this.IdCriteriaGroupe +
        '-input" class="treeBtnDisplay">' +
        UiuxConfig.ICON_TREE +
        "</a>"
    );

    this.hiddenInput = $(
      '<input id="ecgrw-' +
        this.IdCriteriaGroupe +
        '-input-value" type="hidden"/>'
    );

    this.displayLayer = $(
      '<div  id="ecgrw-' +
        this.IdCriteriaGroupe +
        '-displayLayer" class="treeLayer"><div class="treeClose"><i class="far fa-times-circle"></i></div><div class="treeNotice"></div><div class="treeDisplay" id="ecgrw-' +
        this.IdCriteriaGroupe +
        '-display"></div><div class="treeActions"><a class="treeCancel">' +
        this.langSearch.TreeWidgetDelete +
        '</a><a class="treeSubmit">' +
        this.langSearch.TreeWidgetSelect +
        "</a></div></div>"
    );

    this.html
      .append(this.button)
      .append(this.hiddenInput)
      .append(this.displayLayer);

    //render this element
    var startClassGroup_value = this.startClassVal.type;
    var endClassGroup_value = this.endClassVal.type;
    var ObjectPropertyGroup_value = this.objectPropVal.type;

    var self = this;
    var loaderHandler = this.loaderHandler;
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
                ? loaderHandler.treeRootUrl(
                    startClassGroup_value,
                    ObjectPropertyGroup_value,
                    endClassGroup_value
                  )
                : loaderHandler.treeChildrenUrl(
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
            var items = loaderHandler.nodeListLocation(
              startClassGroup_value,
              ObjectPropertyGroup_value,
              endClassGroup_value,
              data
            );

            if(self.sort) {
              // here, if we need to sort, then sort according to lang
              var collator = new Intl.Collator(self.settings.language);					
              items.sort(function(a:string, b:string) {
                return collator.compare(loaderHandler.nodeLabel(a),loaderHandler.nodeLabel(b));
              });
            }


            for (var i = 0; i < items.length; i++) {
              var text = loaderHandler.nodeLabel(items[i]);
              // shorten the label if too long to avoid tree goind far right
              if(text.length > 90) {
                text = text.substring(0,90)+" (...)";
              }

              var aNode: {
                id: string;
                text: string;
                children?: boolean;
                state?: { disabled: boolean };
                parent?: any;
              } = {
                id: loaderHandler.nodeUri(items[i]),
                text: text,
              };
              if (loaderHandler.nodeHasChildren(items[i])) {
                aNode.children = true;
              }
              if (loaderHandler.nodeDisabled(items[i])) {
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

      massload: {
        url: this.loaderHandler.treeChildrenUrl(
          startClassGroup_value,
          ObjectPropertyGroup_value,
          endClassGroup_value,
          "nodeIDString" // node.id uncommented since it gave an error!
        ),
        data: function (nodes: any) {
          return { ids: nodes.join(",") };
        },
      },

      checkbox: {
        keep_selected_style: false,
        three_state: false,
        cascade: "down+undetermined",
        cascade_to_disabled: true,
      },

      plugins: ["changed", "wholerow", "checkbox"],
    };

    // this.jsTree = $("#ecgrw-" + id_inputs + "-display").jstree(options);
    this.jsTree = this.displayLayer.find("#ecgrw-"+this.IdCriteriaGroupe+"-display").jstree(options);

    this.button.on("click", { arg1: this }, this.onClickDisplay);
    //disable/enable on max selction
    this.jsTree.on("changed.jstree", { arg1: this }, this.onChangedJstree);
    this.jsTree.on("after_open.jstree", { arg1: this }, this.onChangedJstree);

    this.displayLayer
      .find(".treeSubmit")
      .on("click", { arg1: this }, this.onClickSelect);
    this.displayLayer
      .find(".treeCancel")
      .on("click", { arg1: this }, this.onClickCancel);
    this.displayLayer
      .find(".treeClose")
      .on("click", { arg1: this }, this.onClickClose);

    this.displayLayer.hide();

    return this;
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

    if (this_.jsTree.jstree().get_top_checked().length >= this_.settings.maxOr) {
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
    this_.displayLayer.show();
  };

  onClickCancel = function (e: any) {
    let this_ = e.data.arg1;
    this_.displayLayer.hide();
  };

  onClickSelect = function (e: any) {
    let this_ = e.data.arg1;
    const values = this_.getValue()
    this_.displayLayer?.hide();
    this_.renderWidgetValues(values)
    
  };

  onClickClose = function (e: any) {
    let this_ = e.data.arg1;
    this_.displayLayer?.hide();
    $(this_.ParentComponent).trigger("change");
  };

  getValue = function ():Array<TreeWidgetValue> {
    var checked = this.jsTree.jstree().get_top_checked(true);

    // rebuild a clean data structure
    var values = [];
    for (var node in checked) {
      const val:TreeWidgetValue = {
        value: {
          key: checked[node].id,
          label: checked[node].original.text,
          uri: checked[node].id
        }
      }
      
      values.push(val);
    }

    return values;
  };

  parseInput(input: TreeWidgetValue): TreeWidgetValue {
    return input
  }

  getRdfJsPattern(): Pattern[] {
    let vals = this.widgetValues.map((v) => {
      let vl: ValuePatternRow = {};
      vl[this.endClassVal.variable] = DataFactory.namedNode(v.value.uri);
      return vl;
    });
    let valuePattern: ValuesPattern = {
      type: "values",
      values: vals,
    };
    return [valuePattern];
  }
}
