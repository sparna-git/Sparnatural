import { BaseExpression, Expression, Pattern } from "sparqljs";
import WidgetWrapper from "../WidgetWrapper";
import { AbstractWidget } from "./AbstractWidget";

export class NoWidget extends AbstractWidget {
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
