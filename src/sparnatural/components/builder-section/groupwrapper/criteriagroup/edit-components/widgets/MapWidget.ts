import HTMLComponent from "../../../../../HtmlComponent";
import WidgetWrapper from "../WidgetWrapper";
import L from "leaflet";
import AddUserInputBtn from "../../../../../buttons/AddUserInputBtn";
import { MapValue } from "./IWidget";
import "leaflet/dist/leaflet.css";

export default class MapWidget extends HTMLComponent {
    renderMapValueBtn: AddUserInputBtn
    value:MapValue
    constructor(parentComponent:WidgetWrapper){

        super('map-widget',parentComponent,null)
    }

    render(): this {
        super.render()
        this.renderMapValueBtn = new AddUserInputBtn(this,'Open Map', this.#renderMap).render()
        return this
    }

    #renderMap(){
        this.html.append($(`<div id="map"></div>`))
        var map = L.map('map').setView([51.505, -0.09], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap'
        }).addTo(map);
    }
}