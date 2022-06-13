import WidgetWrapper from "../WidgetWrapper";
import L, { LatLng, Rectangle } from "leaflet";
import AddUserInputBtn from "../../../../../buttons/AddUserInputBtn";
import { getSettings } from "../../../../../../../configs/client-configs/settings";
import { AbstractWidget, ValueType, WidgetValue } from "./AbstractWidget";
import { Pattern } from "sparqljs";

import "leaflet/dist/leaflet.css";
import '@geoman-io/leaflet-geoman-free';  
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';

export interface MapWidgetValue extends WidgetValue {
    value:{
        label:string
        coordinates: LatLng[][]
    }
}

export default class MapWidget extends AbstractWidget {
    renderMapValueBtn: AddUserInputBtn
    map:L.DrawMap
    drawingLayer: L.Layer
    constructor(parentComponent:WidgetWrapper){

        super('map-widget',parentComponent,null)
    }

    render(): this {
        super.render()
        this.renderMapValueBtn = new AddUserInputBtn(this,'Open Map', this.#renderMap).render()
        return this
    }

    #renderMap = ()=>{

        this.html.append($(`<div id="map"></div>`))

        this.map = L.map('map').setView([46.20222,6.14569], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap'
        }).addTo(this.map);
      
       this.map.pm.addControls({ 
            position: 'topleft',  
            drawCircle: false,
            drawPolyline:false,
            drawCircleMarker:false,
            drawMarker:false,
            drawText:false,
            drawPolygon:false,
            cutPolygon:false,        
        })
        this.map.on('pm:create', (e)=> {
            //If there is already a drawing, then delete it
            // allows only for one drawing at a time
            if(this.drawingLayer) this.map.removeLayer(this.drawingLayer)

            this.drawingLayer = e.layer

            this.map.addLayer(this.drawingLayer);
            this.#saveValues(e)
            //add listener when the shape gets changed
            this.drawingLayer.on('pm:edit', e => {
                this.#saveValues(e)

              });
        });

        this.#changeButton()
    }
    #saveValues(e: {
        shape: string;
        layer: L.Layer;
    }){
         //double cast: 1. cast.layer payload to recantgle, 2. cast LatLng to RectancleResult LatLng[][]
        let widgetValue:MapWidgetValue = {
            valueType:ValueType.SINGLE,
            value:{
                label:'Area selected',
                coordinates: ((e.layer as Rectangle).getLatLngs() as LatLng[][])
            }
           
        } 
        this.addWidgetValue(widgetValue)
    }

    #closeMap=()=>{
        this.map.remove();
        if(this.getwidgetValues().length < 1) this.renderWidgetVal({value:{label: getSettings().langSearch.SelectAllValues},valueType:ValueType.SINGLE})
        this.renderWidgetVal(this.getLastValue())
    }

    #changeButton(){
        this.renderMapValueBtn.html.remove()
        this.renderMapValueBtn = new AddUserInputBtn(this,'Close Map', this.#closeMap).render() 
    }

    getRdfJsPattern(): Pattern[] {
        throw new Error("Method not implemented.");
    }
}