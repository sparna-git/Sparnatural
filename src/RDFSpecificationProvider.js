
const factory = require('@rdfjs/data-model');
const rdfParser = require("rdf-parse").default;
const rdfDereferencer = require("rdf-dereference").default;
import {storeStream} from "rdf-store-stream";
const N3 = require('n3');

const RDFS = {
	DOMAIN : factory.namedNode("http://www.w3.org/2000/01/rdf-schema#domain"),
	RANGE : factory.namedNode("http://www.w3.org/2000/01/rdf-schema#range")
};

const RDF = {
	TYPE : factory.namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type")
};

var Config = require('./SparnaturalConfig.js');

export class RDFSpecificationProvider {

	constructor(n3store, lang) {
		console.log("RDFSpecificationProvider");

		// init memory store
		this.store = n3store;
		this.lang = lang;
	}

	static async build (specs, lang) {

		// init memory store
		var store = new N3.Store();

		// parse input specs
		console.log(specs);
		const textStream = require('streamify-string')(specs);
		const quadStream = rdfParser.parse(
			textStream,
		  	{ contentType: 'text/turtle' }
		);
		
		// import into store
		// note the await keyword to wait for the asynchronous call to finish
		var store = await storeStream(quadStream);
		console.log('Specification store populated with '+store.countQuads()+" triples.");
  		var provider = new RDFSpecificationProvider(store, lang);
        return provider;
    }

	getClassesInDomainOfAnyProperty() {
		console.log("getClassesInDomainOfAnyProperty");
		const quadsArray = this.store.getQuads(
			undefined,
			RDFS.DOMAIN,
		  	// other arguments are left undefined
		);

		var items = [];
		for (const quad of quadsArray) {
			// we are not looking at domains of _any_ property
		    // the property we are looking at must be a Sparnatural property, with a known type
			var objectPropertyId = quad.subject.id;
		    var classId = quad.object.id;
		    if(this.getObjectPropertyType(objectPropertyId)) {
		    	this._pushIfNotExist(classId, items);	
		    }		    
		}
		return items;
	}

	getLabel(entityId) {
		return "toto";
	}

	getIcon(classId) {
		return null;
	}

	getHighlightedIcon(classId) {
		return null;
	}

	getConnectedClasses(classId) {
		var items = [];

		const propertyQuads = this.store.getQuads(
			undefined,
			RDFS.DOMAIN,
		  	factory.namedNode(classId),
		);

		// now read their ranges
		for (const quad of propertyQuads) {
		    const rangeQuads = this.store.getQuads(
				quad.subject,
				RDFS.RANGE
			);

			for (const classQuad of rangeQuads) {
			    this._pushIfNotExist(classQuad.object.id, items);
			}
		}

		return items ;
	}

	hasConnectedClasses(classId) {
		return ( this.getConnectedClasses(classId).length > 0 );
	}

	getConnectingProperties(domainClassId, rangeClassId) {
		var items = [];

		const propertyDomainQuads = this.store.getQuads(
			undefined,
			RDFS.DOMAIN,
		  	factory.namedNode(domainClassId)
		);

		for (const quad of propertyDomainQuads) {
		    const propertyRangeQuads = this.store.getQuads(
				quad.subject,
				RDFS.RANGE,
				factory.namedNode(rangeClassId)
			);

			for (const classQuad of propertyRangeQuads) {
			    this._pushIfNotExist(classQuad.subject.id, items);
			}
		}

		return items ;
	}

	getObjectPropertyType(objectPropertyId) {
		var types = this._readRdfTypes(objectPropertyId);
		
		var KNOWN_PROPERTY_TYPES = [
			Config.LIST_PROPERTY,
			Config.TIME_PERIOD_PROPERTY,
			Config.TIME_DATE_PICKER_PROPERTY,
			Config.TIME_DATE_DAY_PICKER_PROPERTY,
			Config.AUTOCOMPLETE_PROPERTY,
			Config.SEARCH_PROPERTY,
			Config.NON_SELECTABLE_PROPERTY
		];

		// only return the type if it is a known type
		for (const aType of types) {
			if(KNOWN_PROPERTY_TYPES.includes(aType)) {
				return aType;
			}
		}
		
		return undefined;
	}

	_readRdfTypes(uri) {
		var types = [];
		for (const classQuad of this.store.getQuads(
			factory.namedNode(uri),
			RDF.TYPE
		)) {
			console.log(classQuad);
		    types.push(classQuad.object.id);
		}
		return types;
	}

	_processImports() {
		const quadStream = this.store.match(
			undefined,
			factory.namedNode("http://www.w3.org/2002/07/owl#imports"),
		  	// other arguments are left undefined
		);

		quadStream
		  .on('error', console.error)
		  .on('data', (quad) => {
		    // Handle our quad...		    
		    /*
		    console.log(quad.object.id);
		    rdfDereferencer.dereference(quad.object.id).then(function(quads) {
		    	console.log(quads);
		    });
		    */
		  });
	}

	_pushIfNotExist(item, items) {
		if (items.indexOf(item) < 0) {
			items.push(item) ;
		}

		return items ;			
	}

}