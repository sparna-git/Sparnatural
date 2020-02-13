
const factory = require('@rdfjs/data-model');
const rdfParser = require("rdf-parse").default;
const rdfDereferencer = require("rdf-dereference").default;
import {storeStream} from "rdf-store-stream";
const N3 = require('n3');

const RDFS = {
	DOMAIN : factory.namedNode("http://www.w3.org/2000/01/rdf-schema#domain"),
	RANGE : factory.namedNode("http://www.w3.org/2000/01/rdf-schema#range")
};

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
			factory.namedNode("http://www.w3.org/2000/01/rdf-schema#domain"),
		  	// other arguments are left undefined
		);

		var items = [];
		for (const quad of quadsArray) {
		    // Handle our quad...
		    this._pushIfNotExist(quad.object.id, items);
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