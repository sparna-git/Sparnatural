import { AbstractWidget, ValueRepetition } from "./AbstractWidget";
import { HTMLComponent } from "../HtmlComponent";
import { Criteria, LabelledCriteria } from "../../SparnaturalQueryIfc";

export class NoWidget extends AbstractWidget {

  constructor(parentComponent: HTMLComponent) {
    super("no-widget", parentComponent, null, null, null, null, ValueRepetition.SINGLE);
  }

  render() {
    return this;
  }

  parseInput(): LabelledCriteria<Criteria> {
    throw new Error("Method not implemented.");
  }

}
