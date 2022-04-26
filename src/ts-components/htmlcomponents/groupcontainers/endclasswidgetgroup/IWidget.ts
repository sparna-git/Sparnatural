import EndClassWidgetGroup from "./EndClassWidgetGroup"

export default interface IWidget{
    html:string
    render: ()=>void
    getValue:()=>any
}