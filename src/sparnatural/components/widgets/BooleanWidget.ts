import * as DataFactory from "@rdfjs/data-model" ;
import { BgpPattern, Pattern } from "sparqljs";
import { getSettings } from "../../../sparnatural/settings/defaultSettings";
import { SelectedVal } from "../../generators/ISparJson";
import WidgetWrapper from "../builder-section/groupwrapper/criteriagroup/edit-components/WidgetWrapper";
import { AbstractWidget, ValueRepetition, WidgetValue } from "./AbstractWidget";

export interface BooleanWidgetValue extends WidgetValue {
  value: {
    label: string;
    key: boolean;
    boolean: boolean;
  }
}

export class BooleanWidget extends AbstractWidget {
  protected widgetValues: BooleanWidgetValue[];
  constructor(
    parentComponent: WidgetWrapper,
    startClassVal: SelectedVal,
    objectPropVal: SelectedVal,
    endClassVal: SelectedVal
  ) {
    super(
      "boolean-widget",
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
    let trueSpan = $(
      `<span class="boolean-value">${getSettings().langSearch.true}</span>'`
    );
    let orSpan = $(`<span class="or">${getSettings().langSearch.Or}</span>`);
    let falseSpan = $(
      `<span class="boolean-value"">'${getSettings().langSearch.false}</span>`
    );
    this.html.append(trueSpan).append(orSpan).append(falseSpan);

    trueSpan[0].addEventListener("click", (e) => {
      let widgetValue: BooleanWidgetValue = {
        value: {
          key: true,
          label: getSettings().langSearch.true,
          boolean: true,
        },
      };
      this.renderWidgetVal(widgetValue);
    });

    falseSpan[0].addEventListener("click", (e) => {
      let widgetValue: BooleanWidgetValue = {
        value: {
          key: false,
          label: getSettings().langSearch.false,
          boolean: false,
        },
      };
      this.renderWidgetVal(widgetValue);
    });
    return this;
  }

  parseInput(input: BooleanWidgetValue): BooleanWidgetValue {
    input.value.boolean.toString() === 'true' ? input.value.boolean = true : input.value.boolean = false
    return input
   }

  getRdfJsPattern(): Pattern[] {
    let ptrn: BgpPattern = {
      type: "bgp",
      triples: [
        {
          subject: DataFactory.variable(this.startClassVal.variable),
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
