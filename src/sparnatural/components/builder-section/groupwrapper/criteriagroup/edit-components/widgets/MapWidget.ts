import WidgetWrapper from "../WidgetWrapper";
import L, { LatLng, Rectangle } from "leaflet";
import AddUserInputBtn from "../../../../../buttons/AddUserInputBtn";
import { getSettings } from "../../../../../../../configs/client-configs/settings";
import { AbstractWidget, ValueType, WidgetValue } from "./AbstractWidget";
import {
  BgpPattern,
  FilterPattern,
  FunctionCallExpression,
  Pattern,
} from "sparqljs";
import "leaflet/dist/leaflet.css";
import "@geoman-io/leaflet-geoman-free";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";
import { SelectedVal } from "../../../../../../sparql/ISparJson";
import { DataFactory, Literal, Triple } from "n3";
import { namedNode } from "@rdfjs/data-model";

export interface MapWidgetValue extends WidgetValue {
  value: {
    label: string;
    coordinates: LatLng[][];
  };
  valueType: ValueType.SINGLE;
}

export default class MapWidget extends AbstractWidget {
  protected widgetValues: MapWidgetValue[];
  renderMapValueBtn: AddUserInputBtn;
  map: L.DrawMap;
  drawingLayer: L.Layer;
  constructor(
    parentComponent: WidgetWrapper,
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
      endClassVal
    );
  }

  render(): this {
    super.render();
    this.renderMapValueBtn = new AddUserInputBtn(
      this,
      "Open Map",
      this.#renderMap
    ).render();
    return this;
  }

  #renderMap = () => {
    this.html.append($(`<div id="map"></div>`));

    this.map = L.map("map").setView([46.20222, 6.14569], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "© OpenStreetMap",
    }).addTo(this.map);

    this.map.pm.addControls({
      position: "topleft",
      drawCircle: false,
      drawPolyline: false,
      drawCircleMarker: false,
      drawMarker: false,
      drawText: false,
      drawPolygon: false,
      cutPolygon: false,
    });
    this.map.on("pm:create", (e) => {
      //If there is already a drawing, then delete it
      // allows only for one drawing at a time
      if (this.drawingLayer) this.map.removeLayer(this.drawingLayer);

      this.drawingLayer = e.layer;

      this.map.addLayer(this.drawingLayer);
      this.#saveValues(e);
      //add listener when the shape gets changed
      this.drawingLayer.on("pm:edit", (e) => {
        this.#saveValues(e);
      });
    });

    this.#changeButton();
  };
  #saveValues(e: { shape: string; layer: L.Layer }) {
    //double cast: 1. cast.layer payload to recantgle, 2. cast LatLng to RectancleResult LatLng[][]
    let widgetValue: MapWidgetValue = {
      valueType: ValueType.SINGLE,
      value: {
        label: "Area selected",
        coordinates: (e.layer as Rectangle).getLatLngs() as LatLng[][],
      },
    };
    this.addWidgetValue(widgetValue);
  }

  #closeMap = () => {
    this.map.remove();
    if (this.getwidgetValues().length < 1)
      this.renderWidgetVal({
        value: { label: getSettings().langSearch.SelectAllValues },
        valueType: ValueType.SINGLE,
      });
    this.renderWidgetVal(this.getLastValue());
  };

  #changeButton() {
    this.renderMapValueBtn.html.remove();
    this.renderMapValueBtn = new AddUserInputBtn(
      this,
      "Close Map",
      this.#closeMap
    ).render();
  }

  // reference: https://graphdb.ontotext.com/documentation/standard/geosparql-support.html
  getRdfJsPattern(): Pattern[] {
    let geomA: Triple = DataFactory.triple(
      DataFactory.variable(this.getVariableValue(this.startClassVal)),
      DataFactory.namedNode(
        "http://example.org/ApplicationSchema#hasExactGeometry"
      ),
      DataFactory.variable("geomA")
    );
    let asWKT: Triple = DataFactory.triple(
      DataFactory.variable(geomA.object.value),
      DataFactory.namedNode("http://www.opengis.net/ont/geosparql#asWKT"),
      DataFactory.variable("aWKT")
    );

    let PolyLiteral: Literal = DataFactory.literal(
      this.#buildPolygon(this.widgetValues[0].value.coordinates[0]),
      namedNode("http://www.opengis.net/ont/geosparql#wktLiteral")
    );

    let filterPtrn: FilterPattern = {
      type: "filter",
      expression: <FunctionCallExpression>{
        type: "functionCall",
        function: DataFactory.namedNode("geof:sfWithin"),
        args: [asWKT.object, PolyLiteral],
      },
    };

    let ptrn: BgpPattern = {
      type: "bgp",
      triples: [geomA, asWKT],
    };
    return [ptrn, filterPtrn];
  }

  #buildPolygon(coordinates: L.LatLng[]) {
    let polygon = "";
    coordinates.forEach((coordinat) => {
      polygon = `${polygon} ${coordinat.lat} ${coordinat.lng},`;
    });
    // polygon must be closed with the starting point
    return `'''<http://www.opengis.net/def/crs/OGC/1.3/CRS84> 
        Polygon((${polygon} ${this.widgetValues[0].value.coordinates[0][0]}))
        '''`;
  }
}
