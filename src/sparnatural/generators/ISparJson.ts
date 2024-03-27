

export interface ISparJson {
  distinct?: boolean;
  variables: Array<string>;
  order?: Order;
  branches: Array<Branch>;
}

export interface Branch {
  line: CriteriaLine;
  children: Array<Branch> | [];
  optional?: boolean;
  notExists?: boolean;
}

export interface CriteriaLine {
  s: string;  
  p: string;
  o: string;
  sType: string;
  oType: string;
  // see ../components/widgets/AbstractWidget
  // we are not making an explicit reference to this dependency
  values: {label:string}[];
}

export enum Order {
  ASC = "asc",
  DESC = "desc",
  NOORDER = "noord",
}
