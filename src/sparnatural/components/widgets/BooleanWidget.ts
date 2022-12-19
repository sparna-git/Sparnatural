import * as DataFactory from "@rdfjs/data-model" ;
import { BgpPattern, Pattern } from "sparqljs";
import { getSettings } from "../../../sparnatural/settings/defaultSettings";
import { SelectedVal } from "../../generators/ISparJson";
import WidgetWrapper from "../builder-section/groupwrapper/criteriagroup/edit-components/WidgetWrapper";
import { AbstractWidget, ValueRepetition, WidgetValue } from "./AbstractWidget";

export class BooleanWidgetValue implements WidgetValue {
  value: {
    label: string;
    boolean: boolean;
  }

  key():string {
    return this.value.boolean.toString();
  }

  constructor(v:BooleanWidgetValue["value"]) {
    this.value = v;
  }
}

export class BooleanWidget extends AbstractWidget {
  protected widgetValues: BooleanWidgetValue[];
  constructor(
    parentComponent: WidgetWrapper,
    subjectVal: SelectedVal,
    objectPropVal: SelectedVal,
    objectVal: SelectedVal
  ) {
    super(
      "boolean-widget",
      parentComponent,
      null,
      subjectVal,
      objectPropVal,
      objectVal,
      ValueRepetition.SINGLE
    );
  }

  render() {
    super.render();
    let trueSpan = $(
      `<span class="boolean-value">${getSettings().langSearch.true}</span>'`
    );
    let orSpan = $(`<span class="or">${getSettings().langSearch.Or}</span>`);
    let falseSpan = $(
      `<span class="boolean-value"">'${getSettings().langSearch.false}</span>`
    );
    this.html.append(trueSpan).append(orSpan).append(falseSpan);

    trueSpan[0].addEventListener("click", (e) => {
      let widgetValue: BooleanWidgetValue = new BooleanWidgetValue({
        label: getSettings().langSearch.true,
        boolean: true,
      });

      this.renderWidgetVal(widgetValue);
    });

    falseSpan[0].addEventListener("click", (e) => {
      let widgetValue: BooleanWidgetValue = new BooleanWidgetValue({
        label: getSettings().langSearch.false,
        boolean: false,
      });

      this.renderWidgetVal(widgetValue);
    });
    return this;
  }

  parseInput(input: BooleanWidgetValue["value"]): BooleanWidgetValue {
    return new BooleanWidgetValue(input);
   }

  getRdfJsPattern(): Pattern[] {
    let ptrn: BgpPattern = {
      type: "bgp",
      triples: [
        {
          subject: DataFactory.variable(this.subjectVal.variable),
          predicate: DataFactory.namedNode(this.objectPropVal.type),
          object: DataFactory.literal(
            this.widgetValues[0].value.boolean.toString(),
            DataFactory.namedNode("http://www.w3.org/2001/XMLSchema#boolean")
          ),
        },
      ],
    };
    return [ptrn];
  }
}
