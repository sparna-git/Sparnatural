import { BgpPattern, Pattern, Triple, ValuesPattern } from "sparqljs";
import UiuxConfig from "../../IconsConstants";
import { SelectedVal } from "../../SelectedVal";
import { AbstractWidget, RDFTerm, ValueRepetition, WidgetValue } from "../AbstractWidget";
import "jstree"
import ISettings from "../../../../sparnatural/settings/ISettings";
import WidgetWrapper from "../../builder-section/groupwrapper/criteriagroup/edit-components/WidgetWrapper";
import { ValuePatternRow } from "sparqljs";
import EndClassGroup from "../../builder-section/groupwrapper/criteriagroup/startendclassgroup/EndClassGroup";
import SparqlFactory from "../../../generators/SparqlFactory";
import { DataFactory } from 'rdf-data-factory';
import { I18n } from "../../../settings/I18n";
import { NoOpTreeDataProvider, TreeDataProviderIfc } from "../data/DataProviders";

const factory = new DataFactory();

require("jstree/dist/themes/default/style.min.css");

export class TreeWidgetValue implements WidgetValue {
  value: {
    label: string;
    uri: string;
  };

  key():string {
    return this.value.uri;
  }

  constructor(v:TreeWidgetValue["value"]) {
    this.value = v;
  }
}

export interface TreeConfiguration {
  dataProvider: TreeDataProviderIfc,
}

export class TreeWidget extends AbstractWidget {

  // The default implementation of TreeConfiguration
  static defaultConfiguration: TreeConfiguration = {
    dataProvider: new NoOpTreeDataProvider()
  }

  protected widgetValues: TreeWidgetValue[];
  configuration:TreeConfiguration;
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
    configuration:TreeConfiguration,
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
    this.configuration = configuration;
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
        `-displayLayer" class="treeLayer"><div class="treeClose">${UiuxConfig.ICON_REG_XMARK}</div><div class="treeNotice"></div><div class="treeDisplay" id="ecgrw-` +
        this.IdCriteriaGroupe +
        '-display"></div><div class="treeActions"><a class="treeCancel">' +
        I18n.labels.TreeWidgetDelete +
        '</a><a class="treeSubmit">' +
        I18n.labels.TreeWidgetSelect +
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
    let dataProvider = this.configuration.dataProvider;
    let settings = this.settings;
    var options = {
      core: {
        multiple: true,
        data: function (
          node: { id: string },
          callback: {
            call: (arg0: any, arg1: { id: any; text: any }[]) => void;
          }
        ) {

          interface TreeItem {
            term:RDFTerm;
            label:string;
            hasChildren:boolean;
            disabled:boolean
          }

          let nodeCallback:(items:TreeItem[]) => void = function(
            items:TreeItem[]
          ) {
            var result = [];

            if(self.sort) {
              // here, if we need to sort, then sort according to lang
              var collator = new Intl.Collator(self.settings.language);					
              items.sort(function(a:TreeItem, b:TreeItem) {
                return collator.compare(a.label,b.label);
              });
            }


            for (var i = 0; i < items.length; i++) {
              var text = items[i].label;
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
                id: items[i].term.value,
                text: text,
              };
              if (items[i].hasChildren) {
                aNode.children = true;
              }
              if (items[i].disabled) {
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

          }

          // TODO : this is not working for now
          let errorCallback = (payload:any) => {
            this.html.append(payload);
          }

          if(node.id === "#") {
            dataProvider.getRoots(
              startClassGroup_value,
              ObjectPropertyGroup_value,
              endClassGroup_value,
              settings.language,
              settings.defaultLanguage,
              settings.typePredicate,
              nodeCallback,
              errorCallback
            );
          } else {
            dataProvider.getChildren(
              node.id,
              startClassGroup_value,
              ObjectPropertyGroup_value,
              endClassGroup_value,
              settings.language,
              settings.defaultLanguage,
              settings.typePredicate,
              nodeCallback,
              errorCallback
            );
          }
        },
        themes: {
          icons: false,
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
      const val = new TreeWidgetValue({
        label: checked[node].original.text,
        uri: checked[node].id
      });
      
      values.push(val);
    }

    return values;
  };

  parseInput(input: TreeWidgetValue["value"]): TreeWidgetValue {
    return new TreeWidgetValue(input);
  }

  isBlockingObjectProp() {
    return (
      this.widgetValues.length == 1
      &&
      !((this.ParentComponent.ParentComponent.ParentComponent as EndClassGroup).isVarSelected())
    );
  }

  /**
   * @returns  true if at least one value is selected, in which case we don't need to insert an rdf:type constraint
   * on the end class
   */
  isBlockingEnd(): boolean {
    return (this.widgetValues.length > 0);
  }

  getRdfJsPattern(): Pattern[] {
    if(this.isBlockingObjectProp()) {
      // single value not selected, set it directly as the value of the triple
      let singleTriple: Triple = SparqlFactory.buildTriple(
        factory.variable(this.getVariableValue(this.startClassVal)),
        factory.namedNode(this.objectPropVal.type),
        factory.namedNode((this.widgetValues[0]).value.uri)
      );

      let ptrn: BgpPattern = {
        type: "bgp",
        triples: [singleTriple],
      };  

      return [ptrn];
    } else {
      // multiple values, use a VALUES
      let vals = this.widgetValues.map((v) => {
        let vl: ValuePatternRow = {};
        vl[this.endClassVal.variable] = factory.namedNode(v.value.uri);
        return vl;
      });
      let valuePattern: ValuesPattern = {
        type: "values",
        values: vals,
      };
      return [valuePattern];
    }

  }
}
