// Spinner component used by the data source handler
// bridges the time between loading the datasource for list or search widget

import HTMLComponent from "../HtmlComponent";
import UiuxConfig from "../IconsConstants";
import { AbstractWidget } from "./AbstractWidget";

export default class LoadingSpinner extends HTMLComponent{
    spinner: UiuxConfig.ICON_LOOADER

    constructor(parentComponent:AbstractWidget){
        super(`loadingspinner`,parentComponent,null)
    }

    render(): this {
        super.render()
        this.html.append(`<span class="loadingspinner"><span class="load">${this.spinner}</span><span class="spinner-message"></span></span>`) 
        return this
    }
    
    renderMessage(message:string){
        const elements = this.html[0].getElementsByClassName(`spinner-message`)
        if(elements.length > 1) throw Error(`More than one spinner-message found in${this.html[0]}`)
        elements[0].textContent = message
    }
}