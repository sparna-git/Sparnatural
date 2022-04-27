export default interface IWidget{
    html:string
    render: ()=>void
    getValue:()=>any
}