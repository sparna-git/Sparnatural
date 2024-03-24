import { DataFactory } from 'rdf-data-factory';
import { BgpPattern, Pattern, ValuePatternRow, ValuesPattern } from "sparqljs";
import { SelectedVal } from "../../generators/ISparJson";
import WidgetWrapper from "../builder-section/groupwrapper/criteriagroup/edit-components/WidgetWrapper";
import { AbstractWidget, ValueRepetition, WidgetValue } from "./AbstractWidget";
import { SelectAllValue } from "../builder-section/groupwrapper/criteriagroup/edit-components/EditComponents";
import EndClassGroup from "../builder-section/groupwrapper/criteriagroup/startendclassgroup/EndClassGroup";
import { I18n } from '../../settings/I18n';
import AddUserInputBtn from '../buttons/AddUserInputBtn';
import SparqlFactory from '../../generators/SparqlFactory';

const factory = new DataFactory();

export class NumberWidgetValue implements WidgetValue {
  value: {
    label: string;
    min: number|undefined;
    max: number|undefined,
  }

  key():string {
    return ""+this.value.min+"-"+this.value.max;
  }

  constructor(v:NumberWidgetValue["value"]) {
    this.value = v;
  }
}

export class NumberWidget extends AbstractWidget {
  
  protected widgetValues: NumberWidgetValue[];
  
  minInput: JQuery<HTMLElement>;
  maxInput: JQuery<HTMLElement>;
  addValueBtn: AddUserInputBtn;
  
  constructor(
    parentComponent: WidgetWrapper,
    startClassVal: SelectedVal,
    objectPropVal: SelectedVal,
    endClassVal: SelectedVal
  ) {
    super(
      "number-widget",
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
    this.minInput = $(`<input type="number" size="7" id="input-from" />`);
    this.html.append(this.minInput);

    this.html.append(`&nbsp;${I18n.labels.NumberLabelAnd}&nbsp;`);

    this.maxInput = $(`<input type="number" size="7" id="input-to" />`);
    this.html.append(this.maxInput);
    
    this.addValueBtn = new AddUserInputBtn(
      this,
      I18n.labels.ButtonAdd,
      this.#addValueBtnClicked
    ).render();

    return this;
  }

  #addValueBtnClicked = () => {
    let numberWidgetValue = {
        label: this.#getValueLabel(this.minInput.val().toString(), this.maxInput.val().toString()),
        min: (this.minInput.val() != "")?Number(this.minInput.val().toString()):undefined,
        max: (this.maxInput.val() != "")?Number(this.maxInput.val().toString()):undefined,
    };

    numberWidgetValue = this.#checkInput(numberWidgetValue);
    console.log(numberWidgetValue)
    this.renderWidgetVal(this.parseInput(numberWidgetValue));
  }

  #checkInput(input: NumberWidgetValue["value"]): NumberWidgetValue["value"] {
    if (input.min && input.max && (input.min > input.max)) throw Error('lower bou,d is bigger than upper bound!')
    return input;
  }

  #getValueLabel = function (startLabel: string, stopLabel: string) {
    let valueLabel = "";
    if ((startLabel != "") && (stopLabel != "")) {
      valueLabel = I18n.labels.NumberLabelBetween+' '+ startLabel +' '+I18n.labels.NumberLabelAnd+' '+ stopLabel ;
    } else if (startLabel != "") {
      valueLabel = I18n.labels.NumberLabelHigherThan+' '+ startLabel ;
    } else if (stopLabel != "") {
      valueLabel = I18n.labels.NumberLabelLowerThan+' '+ stopLabel ;
    }

    return valueLabel;
  };

  parseInput(input: NumberWidgetValue["value"]): NumberWidgetValue {
    return new NumberWidgetValue(input);
   }

   /**
    * @returns false
    */
   isBlockingObjectProp() {
    return false;
   }

  getRdfJsPattern(): Pattern[] {
    return [
      SparqlFactory.buildFilterRangeDateOrNumber(
        (this.widgetValues[0].value.min != undefined)?factory.literal(
          this.widgetValues[0].value.min.toString(),
          factory.namedNode("http://www.w3.org/2001/XMLSchema#decimal")
        ):null,
        (this.widgetValues[0].value.max != undefined)?factory.literal(
          this.widgetValues[0].value.max.toString(),
          factory.namedNode("http://www.w3.org/2001/XMLSchema#decimal")
        ):null,
        factory.variable(
          this.getVariableValue(this.endClassVal)
        )
      )
    ];
  }
}
