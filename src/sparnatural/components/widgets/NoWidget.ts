import { AbstractWidget, ValueRepetition } from "./AbstractWidget";
import { HTMLComponent } from "../HtmlComponent";
import { CriteriaValue } from "../../SparnaturalQueryIfc";

export class NoWidget extends AbstractWidget {
  parseInput(): CriteriaValue {
    throw new Error("Method not implemented.");
  }
  value: any = null;
  constructor(parentComponent: HTMLComponent) {
    super("no-widget", parentComponent, null, null, null, null, ValueRepetition.SINGLE);
  }

  render() {
    return this;
  }

}
