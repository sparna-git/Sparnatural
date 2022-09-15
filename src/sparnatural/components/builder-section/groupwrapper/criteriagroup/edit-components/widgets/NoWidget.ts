import {  Pattern } from "sparqljs";
import WidgetWrapper from "../WidgetWrapper";
import { AbstractWidget, WidgetValue } from "./AbstractWidget";

export class NoWidget extends AbstractWidget {
  parseInput(): WidgetValue {
    throw new Error("Method not implemented.");
  }
  value: any = null;
  constructor(parentComponent: WidgetWrapper) {
    super("no-widget", parentComponent, null, null, null, null);
  }

  render() {
    return this;
  }
  getRdfJsPattern(): Pattern[] {
    throw new Error("Method not implemented.");
  }
}
