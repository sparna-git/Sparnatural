import { Pattern } from "sparqljs"
import HTMLComponent from "../../../../../HtmlComponent"

// 
export enum ValueType {
  SINGLE, // only one value can be chosen. 
  MULTIPLE, // multiple values can be selected like a list of values
}

export interface WidgetValue {
  value:{
    label:string // that's the human readable string representation shown as a WidgetValue to the user
  }
  valueType:ValueType 
}

export abstract class AbstractWidget extends HTMLComponent{
  protected widgetValues:Array<WidgetValue>
  constructor(baseCssClass:string,parentComponent:HTMLComponent,widgetHTML:JQuery<HTMLElement>){
    super(baseCssClass,parentComponent,widgetHTML)
  }
  // Must be implemented by the developper of the widget
  abstract getRdfJsPattern():Pattern[]

  getSparnaturalRepresentation() {
    let vals = this.widgetValues.map( v=> v.value)
    return JSON.stringify(vals)
  }

  addWidgetValue(widgetValue:WidgetValue){
    this.widgetValues.push(widgetValue)
  }

  getLastValue(){
    if(this.widgetValues.length < 1) throw Error('Property #widgetValue is empty! addWidgetValue() must be called before')
    return this.widgetValues[this.widgetValues.length-1]
  }

  // returns null if valueObject has not been set before
  getwidgetValues(): WidgetValue[]{
    if(this.widgetValues.length < 1) throw Error('Property #widgetValue is empty! addWidgetValue() must be called before')
    return this.widgetValues
  }

  // fires the event to render the label of the WidgetValue on the UI
  renderWidgetVal(widgetValue:WidgetValue){
    this.widgetValues.push(widgetValue)
    this.html[0].dispatchEvent(new CustomEvent('renderWidgetVal',{bubbles:true,detail:widgetValue}))

  }

} 