import { DataFactory } from 'rdf-data-factory';
// L needs to be imported *before* leaflet-geoman-free
import L, { LatLng, Rectangle, PolylineOptions, Polygon, PM, TileLayer } from "leaflet";
import { AddUserInputBtn } from "../buttons/AddUserInputBtn";
import { AbstractWidget, ValueRepetition } from "./AbstractWidget";
import "leaflet/dist/leaflet.css";
import "@geoman-io/leaflet-geoman-free";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";
import { SelectedVal } from "../SelectedVal";
import { I18n } from '../../settings/I18n';
import { HTMLComponent } from '../HtmlComponent';
import CriteriaGroup from '../builder-section/groupwrapper/criteriagroup/CriteriaGroup';
import { LabelledCriteria, MapCriteria } from '../../SparnaturalQueryIfc';


const factory = new DataFactory();

// converts props of type Date to type string
type ObjectifyLatLng<T> = T extends LatLng[][]
  ? [[{lat:number,lng:number}]]
  : T extends object
  ? {
      [k in keyof T]: ObjectifyLatLng<T[k]>;
    }
  : T;

// stringified type of MapWidgetValue
// see: https://effectivetypescript.com/2020/04/09/jsonify/
type ObjectMapWidgetValue = ObjectifyLatLng<MapCriteria>


export interface MapConfiguration {
  zoom: number,
  center: {
    lat: number,
    long: number
  }
}

export interface CustomControlOptions {
  name: string,
  block: any,
  title: string,
  className: string,
  onClick: () => void
}

export default class MapWidget extends AbstractWidget {
  
  // The default implementation of MapConfiguration
  static defaultConfiguration: MapConfiguration = {
    zoom:5,
    center: {
      lat: 46.20222,
      long: 6.14569
    }
  }
  
  protected configuration: MapConfiguration;
  protected widgetValues: LabelledCriteria<MapCriteria>[];

  protected renderMapValueBtn: AddUserInputBtn;
  protected map: L.Map;
  protected drawingLayer: L.Layer;

  constructor(
    configuration: MapConfiguration,
    parentComponent: HTMLComponent,
    startClassVal: SelectedVal,
    objectPropVal: SelectedVal,
    endClassVal: SelectedVal
  ) {
    super(
      "map-widget",
      parentComponent,
      null,
      startClassVal,
      objectPropVal,
      endClassVal,
      ValueRepetition.SINGLE
    );

    this.configuration = configuration;
    this.parentComponent = parentComponent;
  }

  render(): this {
    super.render();
    this.renderMapValueBtn = new AddUserInputBtn(
      this,
      I18n.labels.MapWidgetOpenMap,
      this.#renderMap
    ).render();

    // opens the map if there is a value - in the case we are editing the value
    if(this.widgetValues?.length > 0 ) {
      this.#renderMap();
    }
    
    return this;
  }

  #redrawSelection = () => {
    
    if ((this.widgetValues !== undefined) && (this.widgetValues.length > 0)) {
      let options = {
        color: "#3388ff",
        weight: 3,
        opacity: 1,
        lineCap: 'round',
        lineJoin: "round" ,
        fillColor: "#3388ff",
        fillOpacity: 0.2,
        fillRule: "evenodd"
      }

      switch (((this.widgetValues[0].criteria as MapCriteria).coordType as string)) {
        case 'Rectangle':
            let bounds = L.latLngBounds(
              (this.widgetValues[0].criteria as MapCriteria).coordinates[0][0],
              (this.widgetValues[0].criteria as MapCriteria).coordinates[0][2]
            ) ;
            L.rectangle(bounds, (options as PolylineOptions)).addTo(this.map);
          break;    
        default: 
          let coordinates = (this.widgetValues[0].criteria as MapCriteria).coordinates[0][0] ;
          L.polygon((this.widgetValues[0].criteria as MapCriteria).coordinates[0], (options as PolylineOptions)).addTo(this.map);
        break;
      }
    }
  }

  #renderMap = () => {    

    let d = new Date();
    let elementId = d.valueOf();

    this.html.append($('<div id="map-'+elementId+'" class="map-wrapper"></div>'));

    this.map = L.map("map-"+elementId);    
    let tl:TileLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "© OpenStreetMap",
    });    
    tl.addTo(this.map);

    // attempt to rebind geoman - does not work at the moment
    // see https://geoman.io/docs/lazy-loading
    // L.PM.reInitLayer(tl);

    this.map.setView([this.configuration.center.lat, this.configuration.center.long], this.configuration.zoom);

    this.map.pm.addControls({
      position: "topleft",
      cutPolygon: false,
      drawCircle: false,
      drawPolyline: false,
      drawCircleMarker: false,
      drawMarker: false,
      drawText: false,
      drawPolygon: true,
      editMode: true,
      dragMode: true,
      rotateMode: false,
      removalMode: true
    });

    this.#redrawSelection() ;

    if ((this.widgetValues !== undefined) && (this.widgetValues.length > 0)) {
      
      var layers = [];
      this.map.pm.getGeomanLayers(false).forEach(layer => {
        if(layer instanceof L.Polygon) {
            layer.pm.enable() ;
            this.drawingLayer = layer ;
        }
      });
      this.drawingLayer.on("pm:edit", (e) => {
        
        //let widgetValue = this.#setWidgetValue(e.layer) ;
        this.drawingLayer = e.layer;

      });
      this.drawingLayer.on("pm:update", (e) => {
        
        //let widgetValue = this.#setWidgetValue(e.layer) ;
        this.drawingLayer = e.layer;

      });
    }
    
    let submitMapOptions: CustomControlOptions = {
      name: "submitMap",
      block: "custom",
      title: I18n.labels.MapWidgetValidate,
      className: "submitMap icon-map-validate",
      onClick: () => {
        this.#setWidgetValue(this.drawingLayer) ;
        this.triggerRenderWidgetVal(this.widgetValues);
        $(this.parentComponent).trigger("change");
      },
    }
    this.map.pm.Toolbar.createCustomControl(submitMapOptions);

    this.map.on("pm:create", (e:any) => {

      //If there is already a drawing, then delete it
      // allows only for one drawing at a time
      if (this.drawingLayer) this.map.removeLayer(this.drawingLayer);

      this.drawingLayer = e.layer;

      this.map.addLayer(this.drawingLayer);
      //add listener when the shape gets changed
      this.drawingLayer.on("pm:edit", (e) => {

      this.drawingLayer = e.layer;
      });
    });

    
    this.map.on("pm:update", (e) => {      
      this.drawingLayer = e.layer;
    });

    this.#changeButton();
  };

  #getValueLabel(layer: any) {
    let area = this.#polygonArea((layer as any).getLatLngs() as LatLng[][]) ; 
    let coordinates = (layer as any).getLatLngs() as LatLng[][] ;
    return this.#getSvgSelection(coordinates) + '<span>' + area +' km²</span>' ;
  }

  #setWidgetValue = (layer:any) => {
    this.widgetValues = [] ;

    switch ((layer as any).pm._shape) {
      case 'Rectangle':
        this.widgetValues.push({
          label: this.#getValueLabel(layer as Rectangle),
          criteria: {
            coordType: 'Rectangle',
            coordinates: (layer as Rectangle).getLatLngs() as LatLng[][]
          }
        })
        break;    
      default: 
        this.widgetValues.push({
          label: this.#getValueLabel(layer as Polygon),
          criteria: {
            coordType: 'Polygon',
            coordinates: (layer as Polygon).getLatLngs() as LatLng[][]
          }          
        });
      break;
    }

    return this.widgetValues ;
  }

  #closeMap = () => {
    if(this.widgetValues?.length > 0 ) {
      this.triggerRenderWidgetVal(this.widgetValues);
      $(this.parentComponent).trigger("change");
    }
  };

  parseInput(input:LabelledCriteria<MapCriteria>): LabelledCriteria<MapCriteria> {
    let theValue = input.criteria as MapCriteria;

    const parsedCoords = theValue.coordinates.map((c)=>{
      return c.map((latlng)=>{
        if(!("lat" in latlng) || !('lng' in LatLng) || isNaN(latlng.lat) || isNaN(latlng.lng))
        return new LatLng(latlng.lat,latlng.lng)
      })
    })
    if(parsedCoords.length === 0) throw Error(`Parsing of ${theValue.coordinates} failed`)
    return {
      label: input.label,
      criteria: {
        coordinates: parsedCoords,
        coordType: theValue.coordType
      }
      
    };
  }

  #changeButton() {
    this.renderMapValueBtn.html.remove();
    this.renderMapValueBtn = new AddUserInputBtn(
      this,
      I18n.labels.MapWidgetCloseMap,
      this.#closeMap
    ).render();
  }

  #getSvgSelection(coordinates: LatLng[][]) {
    
    let bounds = L.latLngBounds(coordinates[0]) ;

    let startLeft = (bounds.getWest() as number);
    let startBottom = (bounds.getSouth() as number);
    let width = ((bounds.getEast() as number) -  (bounds.getWest() as number));
    let height = ((bounds.getNorth() as number) -  (bounds.getSouth() as number));

    let svgCoordinates = '';
    let lat = 0;
    let lon = 0;
    coordinates[0].forEach((point:any) => {
      lat = point.lat - startBottom ;
      lon = point.lng - startLeft ;
      if(!(svgCoordinates == '')) {
        svgCoordinates += ' ';
      }

      svgCoordinates += lon+','+lat ;
    });

    let svg = `<svg id="svgelem" width="30" height="30" viewBox="0 0 `+width+` `+height+`" xmlns="http://www.w3.org/2000/svg" style=" transform: rotateX(180deg);" preserveAspectRatio="xMidYMid meet">   <g><polygon points="`+svgCoordinates+`" style="fill:#ffffff;" /></g></svg>` ;
    return svg ;
  }


  #polygonArea(coords: any) {
    let total = 0;
    let arrayCoords = new Array()  ;
    arrayCoords[0] = new Array()  ;
    let index = 0 ;
    coords[0].forEach((point:any) => {
      let newSet = [point.lat, point.lng];
      arrayCoords[0][index] = newSet ; 

      index++;
    });

    if (arrayCoords && arrayCoords.length > 0) {
      total += Math.abs(this.#ringArea(arrayCoords[0]));
      for (let i = 1; i < arrayCoords.length; i++) {
        total -= Math.abs(this.#ringArea(arrayCoords[i]));
      }
      
    }
    return Math.round(total) ;
  }

  #ringArea(coords: number[][]): number {
    const coordsLength = coords.length;
    const earthRadius = 6371008.8/1000; //km²
    const FACTOR = (earthRadius * earthRadius) / 2;
    const PI_OVER_180 = Math.PI / 180;
  
    if (coordsLength <= 2) return 0;
    let total = 0;
  
    let i = 0;
    while (i < coordsLength) {
      const lower = coords[i];
      const middle = coords[i + 1 === coordsLength ? 0 : i + 1];
      const upper =
        coords[i + 2 >= coordsLength ? (i + 2) % coordsLength : i + 2];
  
      const lowerX = lower[0] * PI_OVER_180;
      const middleY = middle[1] * PI_OVER_180;
      const upperX = upper[0] * PI_OVER_180;
  
      total += (upperX - lowerX) * Math.sin(middleY);
  
      i++;
    }
    return total * FACTOR;
  }
}
