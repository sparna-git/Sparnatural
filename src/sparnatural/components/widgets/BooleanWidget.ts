import { DataFactory } from 'rdf-data-factory';
import { BgpPattern, Pattern, ValuePatternRow, ValuesPattern } from "sparqljs";
import { SelectedVal } from "../SelectedVal";
import { AbstractWidget, ValueRepetition, WidgetValue } from "./AbstractWidget";
import { SelectAllValue } from "../builder-section/groupwrapper/criteriagroup/edit-components/EditComponents";
import EndClassGroup from "../builder-section/groupwrapper/criteriagroup/startendclassgroup/EndClassGroup";
import { I18n } from '../../settings/I18n';
import HTMLComponent from '../HtmlComponent';

const factory = new DataFactory();

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
    parentComponent: HTMLComponent,
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
      `<span class="boolean-value">${I18n.labels.true}</span>'`
    );
    let orSpan = $(`<span class="or">&nbsp;${I18n.labels.Or}&nbsp;</span>`);
    let falseSpan = $(
      `<span class="boolean-value"">${I18n.labels.false}</span>`
    );
    this.html.append(trueSpan).append(orSpan).append(falseSpan);

    trueSpan[0].addEventListener("click", (e) => {
      let widgetValue: BooleanWidgetValue = new BooleanWidgetValue({
        label: I18n.labels.true,
        boolean: true,
      });

      this.renderWidgetVal(widgetValue);
    });

    falseSpan[0].addEventListener("click", (e) => {
      let widgetValue: BooleanWidgetValue = new BooleanWidgetValue({
        label: I18n.labels.false,
        boolean: false,
      });

      this.renderWidgetVal(widgetValue);
    });
    return this;
  }

  parseInput(input: BooleanWidgetValue["value"]): BooleanWidgetValue {
    return new BooleanWidgetValue(input);
   }

   /**
    * Blocks if a value is selected and this is not the "all" special value
    * @returns true
    */
   isBlockingObjectProp() {
    return (
      this.widgetValues.length == 1
      &&
      !(this.widgetValues[0] instanceof SelectAllValue)
      &&
      !((this.ParentComponent.ParentComponent.ParentComponent as EndClassGroup).isVarSelected())
    );
   }

  getRdfJsPattern(): Pattern[] {
    // if we are blocking the object prop, we create it directly here with the value as the object
    if(this.isBlockingObjectProp()) {
      let ptrn: BgpPattern = {
        type: "bgp",
        triples: [
          {
            subject: factory.variable(this.startClassVal.variable),
            predicate: factory.namedNode(this.objectPropVal.type),
            object: factory.literal(
              this.widgetValues[0].value.boolean.toString(),
              factory.namedNode("http://www.w3.org/2001/XMLSchema#boolean")
            ),
          },
        ],
      };
      return [ptrn];
    } else {
      // otherwise the object prop is created and we create a VALUES clause with the actual boolean
      let vals = (this.widgetValues as BooleanWidgetValue[]).map((v) => {
        let vl: ValuePatternRow = {};
        vl["?"+this.endClassVal.variable] = factory.literal(
          this.widgetValues[0].value.boolean.toString(),
          factory.namedNode("http://www.w3.org/2001/XMLSchema#boolean")
        );
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
