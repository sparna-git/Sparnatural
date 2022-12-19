import WidgetWrapper from "../builder-section/groupwrapper/criteriagroup/edit-components/WidgetWrapper";
import L, { LatLng, Rectangle,Map } from "leaflet";
import AddUserInputBtn from "../buttons/AddUserInputBtn";
import { getSettings } from "../../../sparnatural/settings/defaultSettings";
import { AbstractWidget, ValueRepetition, WidgetValue } from "./AbstractWidget";
import {
  BgpPattern,
  FilterPattern,
  FunctionCallExpression,
  LiteralTerm,
  Pattern,
  Triple,
  ValuePatternRow,
  ValuesPattern,
} from "sparqljs";
import "leaflet/dist/leaflet.css";
import "@geoman-io/leaflet-geoman-free";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";
import { SelectedVal } from "../../generators/ISparJson";
import * as DataFactory from "@rdfjs/data-model" ;
import { GEOF} from "../../spec-providers/RDFSpecificationProvider";
import SparqlFactory from "../../generators/SparqlFactory";

export class MapWidgetValue implements WidgetValue {
  value: {
    label: string;
    coordinates: LatLng[][];
  };

  key():string {
    return this.value.coordinates.toString();
  }

  constructor(v:MapWidgetValue["value"]) {
    this.value = v;
  }
}

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
type ObjectMapWidgetValue = ObjectifyLatLng<MapWidgetValue>

export default class MapWidget extends AbstractWidget {
  protected widgetValues: MapWidgetValue[];
  // protected blockObjectPropTriple: boolean = true
  renderMapValueBtn: AddUserInputBtn;
  map: L.Map;
  drawingLayer: L.Layer;
  constructor(
    parentComponent: WidgetWrapper,
    subjectVal: SelectedVal,
    objectPropVal: SelectedVal,
    objectVal: SelectedVal
  ) {
    super(
      "map-widget",
      parentComponent,
      null,
      subjectVal,
      objectPropVal,
      objectVal,
      ValueRepetition.SINGLE
    );
  }

  render(): this {
    super.render();
    this.renderMapValueBtn = new AddUserInputBtn(
      this,
      getSettings().langSearch.MapWidgetOpenMap,
      this.#renderMap
    ).render();
    return this;
  }

  #renderMap = () => {

    this.html.append($(`<div id="map"></div>`));

    this.map = new Map("map").setView([46.20222, 6.14569], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "© OpenStreetMap",
    }).addTo(this.map);

    this.map.pm.addControls({
      position: "topleft",
      cutPolygon: false,
      drawCircle: false,
      drawPolyline: false,
      drawCircleMarker: false,
      drawMarker: false,
      drawText: false,
      drawPolygon: false,
      editMode: false,
      dragMode: false,
      rotateMode: false,
      removalMode: false
    });
    this.map.on("pm:create", (e:any) => {
      //If there is already a drawing, then delete it
      // allows only for one drawing at a time
      if (this.drawingLayer) this.map.removeLayer(this.drawingLayer);

      this.drawingLayer = e.layer;

      this.map.addLayer(this.drawingLayer);

      let widgetValue = new MapWidgetValue({
        label: getSettings().langSearch.MapWidgetAreaSelected,
         coordinates: (e.layer as Rectangle).getLatLngs() as LatLng[][],
      });
      this.renderWidgetVal(widgetValue);
      //add listener when the shape gets changed
      this.drawingLayer.on("pm:edit", (e) => {
        let widgetValue = new MapWidgetValue({
          label: getSettings().langSearch.MapWidgetAreaSelected,
          coordinates: (e.layer as Rectangle).getLatLngs() as LatLng[][],
        });
      this.renderWidgetVal(widgetValue);
      });
    });

    this.#changeButton();
  };

  #closeMap = () => {
    this.map.remove();
    /*
    if (this.getwidgetValues().length < 1)
      this.renderWidgetVal({
        value: { label: getSettings().langSearch.SelectAllValues }
      });
    */
  };

  parseInput(input:ObjectMapWidgetValue["value"]): MapWidgetValue {

    const parsedCoords = input.coordinates.map((c)=>{
      return c.map((latlng)=>{
        if(!("lat" in latlng) || !('lng' in LatLng) || isNaN(latlng.lat) || isNaN(latlng.lng))
        return new L.LatLng(latlng.lat,latlng.lng)
      })
    })
    if(parsedCoords.length === 0) throw Error(`Parsing of ${input.coordinates} failed`)
    return new MapWidgetValue({
        label: input.label,
        coordinates: parsedCoords
      }
    );
  }

  #changeButton() {
    this.renderMapValueBtn.html.remove();
    this.renderMapValueBtn = new AddUserInputBtn(
      this,
      getSettings().langSearch.MapWidgetCloseMap,
      this.#closeMap
    ).render();
  }

  // reference: https://graphdb.ontotext.com/documentation/standard/geosparql-support.html
  getRdfJsPattern(): Pattern[] {

    // the property between the subject and its position expressed as wkt value, e.g. http://www.w3.org/2003/01/geo/wgs84_pos#geometry

    let filterPtrn: FilterPattern = {
      type: "filter",
      expression: <FunctionCallExpression><unknown>{
        type: "functionCall",
        function: DataFactory.namedNode(GEOF.WITHIN.value),
        args: [
          DataFactory.variable(this.getVariableValue(this.objectVal)),
          this.#buildPolygon(this.widgetValues[0].value.coordinates[0])
        ],
      },
    };

    return [filterPtrn];

    /*
    let asWKT: Triple = SparqlFactory.buildTriple(
      DataFactory.variable(this.getVariableValue(this.subjectVal)),
      DataFactory.namedNode("http://www.opengis.net/ont/geosparql#asWKT"),
      DataFactory.variable("aWKT")
    );

    let vals = this.widgetValues.map((v) => {
      let vl: ValuePatternRow = {};
      vl[this.objectVal.variable] = this.#buildPolygon(v.value.coordinates[0]);
      return vl;
    });

    let polygonValues: ValuesPattern = {
      type: "values",
      values: vals
    } 
    
    let filterPtrn: FilterPattern = {
      type: "filter",
      expression: <FunctionCallExpression><unknown>{
        type: "functionCall",
        function: DataFactory.namedNode(GEOF.WITHIN.value),
        args: [asWKT.object, DataFactory.variable(this.getVariableValue(this.objectVal))],
      },
    };
    

    let ptrn: BgpPattern = {
      type: "bgp",
      triples: [asWKT],
    };


    return [ptrn, polygonValues, filterPtrn];
    */
  }

  #buildPolygon(coordinates: L.LatLng[]) {
    let polygon = "";
    coordinates.forEach((coordinat) => {
      polygon = `${polygon}${coordinat.lng} ${coordinat.lat}, `;
    });
    // polygon must be closed with the starting point
    let startPt = coordinates[0]
    let literal: LiteralTerm = DataFactory.literal(
      `Polygon((${polygon}${startPt.lng} ${startPt.lat}))`,
      DataFactory.namedNode("http://www.opengis.net/ont/geosparql#wktLiteral")
    )

    return literal;
  }

  
}
