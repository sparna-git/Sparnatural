import { WidgetValue } from "../components/builder-section/groupwrapper/criteriagroup/edit-components/widgets/AbstractWidget"

export interface SelectedVal {
    variable: string
    type:string
}

export interface CriteriaLine {
    s:string,
    p: string,
    pType:string,
    o:string,
    sType:string,
    oType:string,
    values:WidgetValue[]
}

export interface Branch {
    line: CriteriaLine
    children:Array<Branch> | []
    optional:boolean
    notExists:boolean
}

export interface ISparJson {
    distinct: boolean,
    variables: Array<string>,
    lang: Language,
    order: Order,
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