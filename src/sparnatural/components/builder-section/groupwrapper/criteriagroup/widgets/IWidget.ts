import { DateTimeValue } from "../../../../../sparql/Query"

export interface ListWidgetValue{
  key:string
  label:string,
  uri:string
}

export interface AutocompleteValue{
  label:string,
  uri:string
}

export interface DateValue {
  label:string
  fromDate: Date
  toDate: Date
}

export interface IWidget {
  value: ListWidgetValue | DateValue | AutocompleteValue
}
