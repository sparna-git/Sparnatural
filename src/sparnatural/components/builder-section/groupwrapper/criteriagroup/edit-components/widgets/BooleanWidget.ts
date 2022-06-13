import { namedNode } from "@rdfjs/data-model"
import { DataFactory } from "n3"
import { BaseExpression, BgpPattern, Expression, Pattern } from "sparqljs"
import { getSettings } from "../../../../../../../configs/client-configs/settings"
import { SelectedVal } from "../../../../../../sparql/ISparJson"
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
  protected widgetValues: BooleanWidgetValue[]
    constructor(parentComponent: WidgetWrapper,startClassVal:SelectedVal,objectPropVal:SelectedVal,endClassVal:SelectedVal) {
      super('boolean-widget',parentComponent,null,startClassVal,objectPropVal,endClassVal)
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
        let ptrn:BgpPattern = {
          type: "bgp",
          triples: [{
            subject: DataFactory.variable(this.startClassVal.variable),
            predicate:DataFactory.namedNode(this.objectPropVal.type),
            object: DataFactory.literal(this.widgetValues[0].value.boolean.toString(),namedNode('http://www.w3.org/2001/XMLSchema#boolean'))
          }]
        }
        return [ptrn]
    }
  }