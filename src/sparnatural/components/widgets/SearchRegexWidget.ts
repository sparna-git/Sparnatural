import { DataFactory } from "rdf-data-factory";
import { BgpPattern, Pattern } from "sparqljs";
import { SelectedVal } from "../SelectedVal";
import AddUserInputBtn from "../buttons/AddUserInputBtn";
import { AbstractWidget, ValueRepetition, WidgetValue } from "./AbstractWidget";
import SparqlFactory from "../../generators/sparql/SparqlFactory";
import { Config } from "../../ontologies/SparnaturalConfig";
import InfoBtn from "../buttons/InfoBtn";
import { I18n } from "../../settings/I18n";
import { TOOLTIP_CONFIG } from "../../settings/defaultSettings";
import { HTMLComponent } from "../HtmlComponent";

const factory = new DataFactory();

export class SearchRegexWidgetValue implements WidgetValue {
  value: {
    label: string;
    regex: string;
  };

  key(): string {
    return this.value.regex;
  }

  constructor(v: SearchRegexWidgetValue["value"]) {
    this.value = v;
  }
}

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
    let searchWidgetValue = {
      label: this.searchInput.val().toString(),
      regex: this.searchInput.val().toString(),
    };
    this.triggerRenderWidgetVal(this.parseInput(searchWidgetValue));
  };

  parseInput(input: SearchRegexWidgetValue["value"]): SearchRegexWidgetValue {
    if (input.regex.toString() == "") {
      throw Error("Empty String in SearchRegex Widget");
    }
    return new SearchRegexWidgetValue(input);
  }
}
