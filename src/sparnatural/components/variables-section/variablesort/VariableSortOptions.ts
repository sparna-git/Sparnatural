import { Order } from "../../../generators/ISparJson";
import { I18n } from "../../../settings/I18n";
import AscendBtn from "../../buttons/AscendBtn";
import DescendBtn from "../../buttons/DescendBtn";
import NoOrderBtn from "../../buttons/NoOrderBtn";
import VariableOptionsSelectBtn from "../../buttons/VariableOptionsSelectBtn";
import HTMLComponent from "../../HtmlComponent";
import VariableSection from "../VariableSelection";

class VariableSortOption extends HTMLComponent {
  ascendBtn: AscendBtn;
  descendBtn: DescendBtn;
  noOrderBtn: NoOrderBtn;
  variableOptionSelectBtn: VariableOptionsSelectBtn;

  constructor(parentComponent: VariableSection) {
    let widgetHtml = $(
      `<strong>${I18n.labels.labelOrderSort}</strong>`
    );
    super("variablesOrdersSelect", parentComponent, widgetHtml);
  }

  render(): this {
    this.htmlParent = $(this.ParentComponent.html).find(".line1");
    super.render();
    this.ascendBtn = new AscendBtn(this, this.changeSortOrderCallBack).render();
    this.descendBtn = new DescendBtn(this, this.changeSortOrderCallBack).render();
    this.noOrderBtn = new NoOrderBtn(this, this.changeSortOrderCallBack).render();
    // select no order by default
    this.noOrderBtn.setSelected(true);
    this.variableOptionSelectBtn = new VariableOptionsSelectBtn(
      this,
      this.toggleVarNames
    ).render();

    // when one of the button is clicked, unselect the other ones
    this.html[0].addEventListener(
      "changeSortOrder",
      (e: CustomEvent) => {
        switch(e.detail) {
          case Order.ASC : {
            this.ascendBtn.setSelected(true);
            this.descendBtn.setSelected(false);
            this.noOrderBtn.setSelected(false);
            break;
          }
          case Order.DESC : {
            this.ascendBtn.setSelected(false);
            this.descendBtn.setSelected(true);
            this.noOrderBtn.setSelected(false);
            break;
          }
          case Order.NOORDER : {
            this.ascendBtn.setSelected(false);
            this.descendBtn.setSelected(false);
            this.noOrderBtn.setSelected(true);
            break;
          }
          default: {
            break;
          }
        }
      }
    );

    return this;
  }

  changeSortOrderCallBack = (order:Order) =>{
    this.html[0].dispatchEvent(
      new CustomEvent("changeSortOrder", { bubbles: true, detail: order })
    );
  }

  toggleVarNames = () => {
    this.html[0].dispatchEvent(
      new CustomEvent("toggleVarNames", { bubbles: true })
    );
  };
}

export default VariableSortOption;
