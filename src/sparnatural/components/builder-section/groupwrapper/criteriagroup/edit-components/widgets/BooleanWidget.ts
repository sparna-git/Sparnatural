import { BaseExpression, Expression, Pattern } from "sparqljs"
import { getSettings } from "../../../../../../../configs/client-configs/settings"
import WidgetWrapper from "../WidgetWrapper"
import { AbstractWidget, ValueType, WidgetValue } from "./AbstractWidget"

export interface BooleanWidgetValue extends WidgetValue {
    value:{
        label:string
        key:boolean,
        boolean:boolean
    }
  }
  

export class BooleanWidget extends AbstractWidget{

    constructor(parentComponent: WidgetWrapper) {
      super('boolean-widget',parentComponent,null)
    }
  
    render() {
      super.render()
      let trueSpan = $(`<span class="boolean-value">${getSettings().langSearch.true}</span>'`)
      let orSpan = $(`<span class="or">${getSettings().langSearch.Or}</span>`)
      let falseSpan = $(`<span class="boolean-value"">'${getSettings().langSearch.false}</span>`)
      this.html.append(trueSpan).append(orSpan).append(falseSpan)
  
      trueSpan[0].addEventListener('click',(e)=>{
          let widgetValue:BooleanWidgetValue = {
              valueType: ValueType.SINGLE,
              value:{            
                key:true,
                label:getSettings().langSearch.true,
                boolean: true}
          }
       this.renderWidgetVal(widgetValue)
      })
  
      falseSpan[0].addEventListener('click',(e)=>{
        let widgetValue:BooleanWidgetValue = {
            valueType:ValueType.SINGLE,
            value:{
                key:false,
                label:getSettings().langSearch.false,
                boolean: false
            }
        }
       this.renderWidgetVal(widgetValue)
      })
      return this
    }

    getRdfJsPattern(): Pattern[] {
        throw new Error("Method not implemented.")
    }
  }