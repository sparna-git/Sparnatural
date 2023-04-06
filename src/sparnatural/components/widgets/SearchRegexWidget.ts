import * as DataFactory from "@rdfjs/data-model" ;
import { BgpPattern, Pattern } from "sparqljs";
import { getSettings } from "../../settings/defaultSettings";
import { SelectedVal } from "../../generators/ISparJson";
import AddUserInputBtn from "../buttons/AddUserInputBtn";
import WidgetWrapper from "../builder-section/groupwrapper/criteriagroup/edit-components/WidgetWrapper";
import { AbstractWidget, ValueRepetition, WidgetValue } from "./AbstractWidget";
import SparqlFactory from "../../generators/SparqlFactory";
import { Config } from "../../ontologies/SparnaturalConfig";


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

export class SearchRegexWidget extends AbstractWidget {

  protected widgetValues: SearchRegexWidgetValue[];
  addValueBtn: AddUserInputBtn;
  searchInput: JQuery<HTMLElement>;

  constructor(
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
  }

  render() {
    super.render();
    this.searchInput = $(`<input />`);
    this.html.append(this.searchInput);
    this.addValueBtn = new AddUserInputBtn(
      this,
      getSettings().langSearch.ButtonAdd,
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
  
  getRdfJsPattern(): Pattern[] {
    switch((this.ParentComponent as WidgetWrapper).widgetType) {
      case Config.STRING_EQUALS_PROPERTY: {
        // builds a FILTER(lcase(...) = lcase(...))
        return [SparqlFactory.buildFilterStringEquals(
          DataFactory.literal(
            `${this.widgetValues[0].value.regex}`
          ),
          DataFactory.variable(this.getVariableValue(this.endClassVal))
        )];


        break;
      }
      case Config.SEARCH_PROPERTY: {
        // builds a FILTER(regex(...,...,"i"))
        return [SparqlFactory.buildFilterRegex(
          DataFactory.literal(
            `${this.widgetValues[0].value.regex}`
          ),
          DataFactory.variable(this.getVariableValue(this.endClassVal))
        )];
      }
      case Config.GRAPHDB_SEARCH_PROPERTY: {
        // builds a GraphDB-specific search pattern
        let ptrn: BgpPattern = {
          type: "bgp",
          triples: [
            {
              subject: DataFactory.variable(
                this.getVariableValue(this.startClassVal)
              ),
              predicate: DataFactory.namedNode(
                "http://www.ontotext.com/connectors/lucene#query"
              ),
              object: DataFactory.literal(
                `text:${this.widgetValues[0].value.regex}`
              ),
            },
            {
              subject: DataFactory.variable(
                this.getVariableValue(this.startClassVal)
              ),
              predicate: DataFactory.namedNode(
                "http://www.ontotext.com/connectors/lucene#entities"
              ),
              object: DataFactory.variable(this.getVariableValue(this.endClassVal)),
            },
          ],
        };
        return [ptrn];
      }
    }
  }
}
