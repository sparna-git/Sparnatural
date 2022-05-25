import { EndClassWidgetValue } from "../components/builder-section/groupwrapper/criteriagroup/widgets/EndClassWidgetGroup"

export interface SelectedVal {
    variable: string
    type:string
}

export interface CriteriaLine {
    s:string,
    p: string,
    o:string,
    sType:string,
    oType:string,
    values:Array<{label:string,uri:string}>
}

export interface Branch {
    line: CriteriaLine
    children:Array<Branch> | []
    optional:boolean
    notExists:boolean
}

export interface ISparJson {
    distinct: boolean,
    variables: Array<SelectedVal>,
    lang: Language,
    order: Order
    branches:Array<Branch>
}

export enum Language {
    FR = 'fr',
    EN = 'en'
}

export enum Order {
    ASC = 'asc',
    DESC = 'desc',
    NOORDER = 'noord'
}