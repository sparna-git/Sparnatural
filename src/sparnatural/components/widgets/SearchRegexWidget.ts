import { DataFactory } from 'rdf-data-factory';
import { BgpPattern, Pattern } from "sparqljs";
import { SelectedVal } from "../SelectedVal";
import AddUserInputBtn from "../buttons/AddUserInputBtn";
import WidgetWrapper from "../builder-section/groupwrapper/criteriagroup/edit-components/WidgetWrapper";
import { AbstractWidget, ValueRepetition, WidgetValue } from "./AbstractWidget";
import SparqlFactory from "../../generators/SparqlFactory";
import { Config } from "../../ontologies/SparnaturalConfig";
import InfoBtn from "../buttons/InfoBtn";
import { I18n } from '../../settings/I18n';
import { TOOLTIP_CONFIG } from '../../settings/defaultSettings';

const factory = new DataFactory();

export class SearchRegexWidgetValue implements WidgetValue {
  value: {
    label: string;
    regex: string;
  };

  key():string {
    return this.value.regex;
  }

  constructor(v:SearchRegexWidgetValue["value"]) {
    this.value = v;
  }
}

export interface SearchConfiguration {
  widgetType:string;
}

export class SearchRegexWidget extends AbstractWidget {

  protected widgetValues: SearchRegexWidgetValue[];

  configuration: SearchConfiguration;
  addValueBtn: AddUserInputBtn;
  searchInput: JQuery<HTMLElement>;
  infoBtn: InfoBtn;

  constructor(
    configuration: SearchConfiguration,
    parentComponent: WidgetWrapper,
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
      ValueRepetition.SINGLE
    );

    this.configuration = configuration;
  }

  render() {
    super.render();
    this.searchInput = $(`<input />`);
    this.html.append(this.searchInput);
    // Build datatippy info
    if (
      this.configuration.widgetType ==
      Config.VIRTUOSO_SEARCH_PROPERTY
    ) {
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
    this.renderWidgetVal(this.parseInput(searchWidgetValue));
  };

  parseInput(input:SearchRegexWidgetValue["value"]): SearchRegexWidgetValue {
    if (input.regex.toString() == "") {
      throw Error('Empty String in SearchRegex Widget')
    }
    return new SearchRegexWidgetValue(input);
  }

  isBlockingObjectProp() {
    // TODO : customize depending on widget type, e.g. Virtuoso, Jena, etc.
    return super.isBlockingObjectProp();
  }
  

  isBlockingEnd(): boolean {
    // TODO : customize depending on widget type, e.g. Virtuoso, Jena, etc.
    return super.isBlockingEnd();
  }
  
  getRdfJsPattern(): Pattern[] {
    switch(this.configuration.widgetType) {
      case Config.STRING_EQUALS_PROPERTY: {
        // builds a FILTER(lcase(...) = lcase(...))
        return [SparqlFactory.buildFilterStringEquals(
          factory.literal(
            `${this.widgetValues[0].value.regex}`
          ),
          factory.variable(this.endClassVal.variable)
        )];
      }
      case Config.SEARCH_PROPERTY: {
        // builds a FILTER(regex(...,...,"i"))
        return [SparqlFactory.buildFilterRegex(
          factory.literal(
            `${this.widgetValues[0].value.regex}`
          ),
          factory.variable(this.endClassVal.variable)
        )];
      }
      case Config.GRAPHDB_SEARCH_PROPERTY: {
        // builds a GraphDB-specific search pattern
        let ptrn: BgpPattern = {
          type: "bgp",
          triples: [
            {
              subject: factory.variable(this.startClassVal.variable),
              predicate: factory.namedNode(
                "http://www.ontotext.com/connectors/lucene#query"
              ),
              object: factory.literal(
                `text:${this.widgetValues[0].value.regex}`
              ),
            },
            {
              subject: factory.variable(this.startClassVal.variable),
              predicate: factory.namedNode(
                "http://www.ontotext.com/connectors/lucene#entities"
              ),
              object: factory.variable(this.endClassVal.variable),
            },
          ],
        };
        return [ptrn];
      }
      case Config.VIRTUOSO_SEARCH_PROPERTY: {
        let bif_query = this.widgetValues[0].value.label
          .replace(/[\"']/g, " ")
          .split(" ")
          .map((e) => `'${e}'`)
          .join(" and ");
        console.log(bif_query);
        let ptrn: BgpPattern = {
          type: "bgp",
          triples: [
            {
              subject: factory.variable(this.endClassVal.variable),
              predicate: factory.namedNode(
                "http://www.openlinksw.com/schemas/bif#contains"
              ),
              object: factory.literal(`${bif_query}`),
            },
          ],
        };
        return [ptrn];
      }
      case Config.JENA_SEARCH_PROPERTY: {
        throw new Error("Not implemented yet")
      }
    }
  }
}
