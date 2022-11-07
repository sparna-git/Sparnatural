import { WidgetValue } from "../components/widgets/AbstractWidget";

export interface SelectedVal {
  variable: string;
  type: string;
}

export interface CriteriaLine {
  s: string;
  sType: string;
  p: string;
  pType: string;
  o: string;
  oType: string;
  values: WidgetValue["value"][];
}

export interface Branch {
  line: CriteriaLine;
  children: Array<Branch> | [];
  optional: boolean;
  notExists: boolean;
}

export interface ISparJson {
  distinct: boolean;
  variables: Array<string>;
  order: Order;
  branches: Array<Branch>;
}

export enum Order {
  ASC = "asc",
  DESC = "desc",
  NOORDER = "noord",
}
