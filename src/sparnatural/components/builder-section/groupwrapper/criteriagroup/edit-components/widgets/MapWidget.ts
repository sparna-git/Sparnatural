import HTMLComponent from "../../../../../HtmlComponent";
import WidgetWrapper from "../WidgetWrapper";
import L from "leaflet";
import AddUserInputBtn from "../../../../../buttons/AddUserInputBtn";
import { MapValue } from "./IWidget";

export default class MapWidget extends HTMLComponent {
    renderMapValueBtn: AddUserInputBtn
    value:MapValue
    constructor(parentComponent:WidgetWrapper){
        let widgetHTML = $(`<div id="map"></div>`)
        super('map-widget',parentComponent,widgetHTML)
    }

    render(): this {
        super.render()
        this.renderMapValueBtn = new AddUserInputBtn(this,'Open Map', this.#renderMap).render()
        return this
    }

    #renderMap(){
        var map = L.map('map').setView([51.505, -0.09], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap'
        }).addTo(map);
    }
}