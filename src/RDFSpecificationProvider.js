
const factory = require('@rdfjs/data-model');
const rdfParser = require("rdf-parse").default;
const rdfDereferencer = require("rdf-dereference").default;
import {storeStream} from "rdf-store-stream";
const N3 = require('n3');

const RDF_NAMESPACE = "http://www.w3.org/1999/02/22-rdf-syntax-ns#";
const RDF = {
	TYPE : factory.namedNode(RDF_NAMESPACE+"type")
};

const RDFS_NAMESPACE = "http://www.w3.org/2000/01/rdf-schema#";
const RDFS = {
	LABEL : factory.namedNode(RDFS_NAMESPACE+"label"),
	DOMAIN : factory.namedNode(RDFS_NAMESPACE+"domain"),
	RANGE : factory.namedNode(RDFS_NAMESPACE+"range"),
	SUBPROPERTY_OF : factory.namedNode(RDFS_NAMESPACE+"subPropertyOf")
};

const OWL_NAMESPACE = "http://www.w3.org/2002/07/owl#";
const OWL = {
	EQUIVALENT_PROPERTY : factory.namedNode(OWL_NAMESPACE+"equivalentProperty"),
	EQUIVALENT_CLASS : factory.namedNode(OWL_NAMESPACE+"equivalentClass")
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
		return this._readAsLiteralWithLang(entityId, RDFS.LABEL, this.lang)
	}

	getIcon(classId) {
		var faIcon = this._readAsLiteral(classId, factory.namedNode(Config.FA_ICON));
		if(faIcon != null) {
			// use of fa-fw for fixed-width icons
			return "<span style='font-size: 170%;' >&nbsp;<i class='" + faIcon + " fa-fw'></i></span>";
		} else {
			var icon = this._readAsLiteral(classId, factory.namedNode(Config.ICON));
			if ( icon != null) {
				return icon;
			} else {
				// this is ugly, just so it aligns with other entries having an icon
				return "<span style='font-size: 175%;' >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>";
			}
		}
	}

	getHighlightedIcon(classId) {
		return this._readAsLiteral(classId, factory.namedNode(Config.HIGHLIGHTED_ICON));
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
		var superProperties = this._readAsResource(objectPropertyId, RDFS.SUBPROPERTY_OF);

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
		for (const aSuperProperty of superProperties) {
			if(KNOWN_PROPERTY_TYPES.includes(aSuperProperty)) {
				return aSuperProperty;
			}
		}
		
		return undefined;
	}

	expandSparql(sparql) {
		// for each owl:equivalentProperty ...
		var equivalentPropertiesPerProperty = {};
		this.store.getQuads(
			undefined,
			OWL.EQUIVALENT_PROPERTY,
			undefined
		).forEach( quad => {
			// store it if multiple equivalences are declared
			if(!equivalentPropertiesPerProperty[quad.subject.id]) {
				equivalentPropertiesPerProperty[quad.subject.id] = [];
			}
			equivalentPropertiesPerProperty[quad.subject.id].push(quad.object.id);			
		});
		// join the equivalences with a |
		for (let [property, equivalents] of Object.entries(equivalentPropertiesPerProperty)) {
			var re = new RegExp("<" + property + ">","g");
			sparql = sparql.replace(re, "<" + equivalents.join(">|<") + ">");
		}		

		// for each owl:equivalentClass ...
		var equivalentClassesPerClass = {};
		this.store.getQuads(
			undefined,
			OWL.EQUIVALENT_CLASS,
			undefined
		).forEach( quad => {
			// store it if multiple equivalences are declared
			if(!equivalentClassesPerClass[quad.subject.id]) {
				equivalentClassesPerClass[quad.subject.id] = [];
			}
			equivalentClassesPerClass[quad.subject.id].push(quad.object.id);			
		});
		// use a VALUES if needed
		var i = 0;
		for (let [aClass, equivalents] of Object.entries(equivalentClassesPerClass)) {
			var re = new RegExp("<" + aClass + ">","g");
			if(equivalents.length == 1) {
				sparql = sparql.replace(re, "<" + equivalents[0] + ">");
			} else {
				sparql = sparql.replace(re, "?class"+i+" . VALUES ?class"+i+" { <"+ equivalents.join("> <") +"> } ");
			}
			i++;
		}

		// for each equivalentPath
		var equivalentPathsPerEntity = {};
		this.store.getQuads(
			undefined,
			Config.EQUIVALENT_PATH,
			undefined
		).forEach( quad => {
			var re = new RegExp("<" + quad.subject.id + ">","g");
			sparql = sparql.replace(re, quad.object.value );			
		});

		return sparql;
	}

	/**
	 * Reads rdf:type(s) of an entity, and return them as an array
	 **/
	_readRdfTypes(uri) {
		return this._readAsResource(uri, RDF.TYPE);
	}

	/**
	 * Reads the given property on an entity, and return values as an array
	 **/
	_readAsResource(uri, property) {
		return this.store.getQuads(
			factory.namedNode(uri),
			property,
			undefined
		)
		.map(quad => quad.object.id);
	}

	_readAsLiteral(uri, property) {
		return this.store.getQuads(
			factory.namedNode(uri),
			property,
			undefined
		)
		.map(quad => quad.object.value);
	}

	_readAsLiteralWithLang(uri, property, lang) {
		return this.store.getQuads(
			factory.namedNode(uri),
			property,
			undefined
		)
		.filter(quad => (quad.object.language == lang))
		.map(quad => quad.object.value);
	}

	_pushIfNotExist(item, items) {
		if (items.indexOf(item) < 0) {
			items.push(item) ;
		}

		return items ;			
	}

}