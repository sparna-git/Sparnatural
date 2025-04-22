import { AbstractWidget, ValueRepetition, WidgetValue } from "./AbstractWidget";
import { HTMLComponent } from "../HtmlComponent";

export class NoWidget extends AbstractWidget {
  parseInput(): WidgetValue {
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
