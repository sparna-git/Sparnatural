import HTMLComponent from "../../../../../HtmlComponent";
import WidgetWrapper from "../WidgetWrapper";
import L from "leaflet";
import AddUserInputBtn from "../../../../../buttons/AddUserInputBtn";
import { MapValue } from "./IWidget";
import 'leaflet-draw';
const leafletDraw = require('leaflet-draw');
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
        var map = L.map('map').setView([46.20222,6.14569], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap'
        }).addTo(map);
        var drawnItems = new L.FeatureGroup();
        map.addLayer(drawnItems);
        var drawControl = new L.Control.Draw({
            edit: {
                featureGroup: drawnItems
            }
        });
        map.addControl(drawControl);
    }
}