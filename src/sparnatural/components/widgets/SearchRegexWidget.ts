import { DataFactory } from "rdf-data-factory";
import { SelectedVal } from "../SelectedVal";
import { AddUserInputBtn } from "../buttons/AddUserInputBtn";
import { AbstractWidget, ValueRepetition } from "./AbstractWidget";
import { Config } from "../../ontologies/SparnaturalConfig";
import { InfoBtn } from "../buttons/InfoBtn";
import { I18n } from "../../settings/I18n";
import { TOOLTIP_CONFIG } from "../../settings/defaultSettings";
import { HTMLComponent } from "../HtmlComponent";
import { LabelledCriteria, SearchCriteria } from "../../SparnaturalQueryIfc";

const factory = new DataFactory();

export interface SearchConfiguration {
  widgetType: string;
}

export class SearchRegexWidget extends AbstractWidget {

  configuration: SearchConfiguration;
  addValueBtn: AddUserInputBtn;
  searchInput: JQuery<HTMLElement>;
  infoBtn: InfoBtn;

  constructor(
    configuration: SearchConfiguration,
    parentComponent: HTMLComponent,
    startClassVal: SelectedVal,
    objectPropVal: SelectedVal,
    endClassVal: SelectedVal
  ) {
    super(
      "search-widget",
      parentComponent,
      null,
      startClassVal,
      objectPropVal,
      endClassVal,
      // simple search or regexes can be multivalued, but proprietary seaerch patterns are not
      (configuration.widgetType == Config.STRING_EQUALS_PROPERTY || configuration.widgetType == Config.SEARCH_PROPERTY)
        ?ValueRepetition.MULTIPLE
        :ValueRepetition.SINGLE
    );

    this.configuration = configuration;
  }

  render() {
    super.render();
    this.searchInput = $(`<input />`);
    this.html.append(this.searchInput);
    // Build datatippy info
    if (this.configuration.widgetType == Config.VIRTUOSO_SEARCH_PROPERTY) {
      let datatippy = I18n.labels.VirtuosoSearchHelp;
      // set a tooltip on the info circle
      var tippySettings = Object.assign({}, TOOLTIP_CONFIG);
      tippySettings.placement = "left";
      tippySettings.trigger = "click";
      tippySettings.offset = [50, -20];
      tippySettings.delay = [0, 0];
      this.infoBtn = new InfoBtn(this, datatippy, tippySettings).render();
    } //finish datatippy
    this.addValueBtn = new AddUserInputBtn(
      this,
      I18n.labels.ButtonAdd,
      this.#addValueBtnClicked
    ).render();
    return this;
  }
  #addValueBtnClicked = () => {
    this.searchInput.trigger("change");
    let searchWidgetValue:LabelledCriteria<SearchCriteria> = {
      label: this.searchInput.val().toString(),
      value: {
        search: this.searchInput.val().toString()
      }      
    };
    this.triggerRenderWidgetVal(searchWidgetValue);
  };

  parseInput(input: LabelledCriteria<SearchCriteria>): LabelledCriteria<SearchCriteria> {
    return input
  }
}
