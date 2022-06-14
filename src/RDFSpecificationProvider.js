
const factory = require('@rdfjs/data-model');
const rdfParser = require("rdf-parse").default;
const rdfDereferencer = require("rdf-dereference").default;
import {storeStream} from "rdf-store-stream";
const N3 = require('n3');
const Datasources = require("./SparnaturalConfigDatasources.js");

const RDF_NAMESPACE = "http://www.w3.org/1999/02/22-rdf-syntax-ns#";
const RDF = {
	TYPE : factory.namedNode(RDF_NAMESPACE+"type"),
	FIRST : factory.namedNode(RDF_NAMESPACE+"first"),
	REST : factory.namedNode(RDF_NAMESPACE+"rest"),
	NIL : factory.namedNode(RDF_NAMESPACE+"nil"),
};

const RDFS_NAMESPACE = "http://www.w3.org/2000/01/rdf-schema#";
const RDFS = {
	LABEL : factory.namedNode(RDFS_NAMESPACE+"label"),
	DOMAIN : factory.namedNode(RDFS_NAMESPACE+"domain"),
	RANGE : factory.namedNode(RDFS_NAMESPACE+"range"),
	SUBPROPERTY_OF : factory.namedNode(RDFS_NAMESPACE+"subPropertyOf"),
	SUBCLASS_OF : factory.namedNode(RDFS_NAMESPACE+"subClassOf")
};

const OWL_NAMESPACE = "http://www.w3.org/2002/07/owl#";
const OWL = {
	EQUIVALENT_PROPERTY : factory.namedNode(OWL_NAMESPACE+"equivalentProperty"),
	EQUIVALENT_CLASS : factory.namedNode(OWL_NAMESPACE+"equivalentClass"),
	UNION_OF : factory.namedNode(OWL_NAMESPACE+"unionOf")
};

var Config = require('./SparnaturalConfig.js');

export class RDFSpecificationProvider {

	constructor(n3store, lang) {
		// init memory store
		this.store = n3store;
		this.lang = lang;
	}

	static async build (specs, filePath, lang) {

		console.log('Building RDFSpecificationProvider from '+filePath);

		// init memory store
		var store = new N3.Store();

		// parse input specs
		// console.log(specs);
		const textStream = require('streamify-string')(specs);

		var quadStream;
		try {
			// attempt to parse based on path
			quadStream = rdfParser.parse(
				textStream,
			  	{ path : filePath }
			);
		} catch (exception) {
			try {
				console.log("Attempt to parse in Turtle...");
				// attempt to parse in turtle
				quadStream = rdfParser.parse(
					textStream,
				  	{ contentType: 'text/turtle' }
				);
			} catch (exception) {
				console.log("Attempt to parse in RDF/XML...");
				// attempt to parse in RDF/XML
				quadStream = rdfParser.parse(
					textStream,
				  	{ contentType: 'application/rdf+xml' }
				);
			}
		}

		// import into store
		// note the await keyword to wait for the asynchronous call to finish
		var store = await storeStream(quadStream);
		console.log("Specification store populated with "+store.countQuads()+" triples.");
  		var provider = new RDFSpecificationProvider(store, lang);
        return provider;
    }

    getAllSparnaturalClasses() {
    	var classes = this.getClassesInDomainOfAnyProperty();
    	// copy initial array
    	var result = classes.slice();
    	// now look for all classes we can reach from this class list
    	for (const aClass of classes) {
    		var connectedClasses = this.getConnectedClasses(aClass);
    		for (const aConnectedClass of connectedClasses) {
    			this._pushIfNotExist(aConnectedClass, result);
    		}
    	}
    	return result;
    }

	getClassesInDomainOfAnyProperty() {
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
			var typeClass = quad.object.termType;
		    var classId = quad.object.id;

		    if(this.getObjectPropertyType(objectPropertyId)) {
		    	
		    	// keep only Sparnatural classes in the list
		    	if(this.isSparnaturalClass(classId) || typeClass == "BlankNode") {
			    	// always exclude RemoteClasses from first list
			    	if(!this.isRemoteClass(classId)) {
			    		if(!this._isUnionClass(classId)) {			    
						    this._pushIfNotExist(classId, items);	
					    } else {
					    	// read union content
					    	var classesInUnion = this._readUnionContent(classId);
					    	for (const aUnionClass of classesInUnion) {
							    this._pushIfNotExist(aUnionClass, items);	
					    	}
					    }
			    	}
		   		}
			    
			}
		}

		items = this._sort(items);

		console.log("Classes in domain of any property "+items);
		return items;
	}

	getLabel(entityId) {
		return this._readAsLiteralWithLang(entityId, RDFS.LABEL, this.lang)
	}

	getTooltip(entityId) {
		return this._readAsLiteralWithLang(entityId, Config.TOOLTIP, this.lang)
	}

	getIcon(classId) {
		var faIcon = this._readAsLiteral(classId, factory.namedNode(Config.FA_ICON));
		if(faIcon.length > 0) {
			// use of fa-fw for fixed-width icons
			return "<span style='font-size: 170%;' >&nbsp;<i class='" + faIcon + " fa-fw'></i></span>";
		} else {
			var icon = this._readAsLiteral(classId, factory.namedNode(Config.ICON));
			if ( icon.length > 0) {
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

		const properties = this._readPropertiesWithDomain(classId);

		// now read their ranges
		for (const aProperty of properties) {

			var classesInRange = this._readClassesInRangeOfProperty(aProperty);

			for (const aClass of classesInRange) {
				// if it is not a Sparnatural Class, read all its subClasses that are Sparnatural classes
				if(!this.isSparnaturalClass(aClass)) {
					// TODO : recursivity
					var subClasses = this._readImmediateSubClasses(aClass);
					for (const aSubClass of subClasses) {
						if(this.isSparnaturalClass(aSubClass)) {
							this._pushIfNotExist(aSubClass, items);
						}
					}
				} else {
					this._pushIfNotExist(aClass, items);
				}

			}
		}

		items = this._sort(items);

		return items ;
	}

	hasConnectedClasses(classId) {
		return ( this.getConnectedClasses(classId).length > 0 );
	}

	getConnectingProperties(domainClassId, rangeClassId) {
		var items = [];

		const properties = this._readPropertiesWithDomain(domainClassId);

		for (const aProperty of properties) {
		    
			var classesInRange = this._readClassesInRangeOfProperty(aProperty);

			if(classesInRange.indexOf(rangeClassId) > -1) {
				this._pushIfNotExist(aProperty, items);
			} else {
				// potentially the select rangeClassId is a subClass, let's look up
				for (const aClass of classesInRange) {
					// TODO : recursivity
					var subClasses = this._readImmediateSubClasses(aClass);
					if(subClasses.indexOf(rangeClassId) > -1) {
						this._pushIfNotExist(aProperty, items);
					}
				}
			}
		}

		items = this._sort(items);

		return items ;
	}

	getObjectPropertyType(objectPropertyId) {
		var superProperties = this._readAsResource(objectPropertyId, RDFS.SUBPROPERTY_OF);

		var KNOWN_PROPERTY_TYPES = [
			Config.LIST_PROPERTY,
			Config.LITERAL_LIST_PROPERTY,
			Config.TIME_PROPERTY_PERIOD,
			Config.TIME_PROPERTY_YEAR,
			Config.TIME_PROPERTY_DATE,
			Config.AUTOCOMPLETE_PROPERTY,
			Config.SEARCH_PROPERTY,
			Config.STRING_EQUALS_PROPERTY,
			Config.GRAPHDB_SEARCH_PROPERTY,
			Config.NON_SELECTABLE_PROPERTY,
			Config.BOOLEAN_PROPERTY,
			Config.TREE_PROPERTY
		];

		// only return the type if it is a known type
		for (const aSuperProperty of superProperties) {
			if(KNOWN_PROPERTY_TYPES.includes(aSuperProperty)) {
				return aSuperProperty;
			}
		}
		
		return undefined;
	}



	isRemoteClass(classUri) {
		return this.store.getQuads(
			factory.namedNode(classUri),
			RDFS.SUBCLASS_OF,
			factory.namedNode(Config.NOT_INSTANTIATED_CLASS)
		).length > 0;
	}

	isLiteralClass(classUri) {
		return this.store.getQuads(
			factory.namedNode(classUri),
			RDFS.SUBCLASS_OF,
			factory.namedNode(Config.RDFS_LITERAL)
		).length > 0;
	}

	isSparnaturalClass(classUri) {
		return (

		this.store.getQuads(
			factory.namedNode(classUri),
			RDFS.SUBCLASS_OF,
			factory.namedNode(Config.SPARNATURAL_CLASS)
		).length > 0
		||
		this.store.getQuads(
			factory.namedNode(classUri),
			RDFS.SUBCLASS_OF,
			factory.namedNode(Config.NOT_INSTANTIATED_CLASS)
		).length > 0
		||
		this.store.getQuads(
			factory.namedNode(classUri),
			RDFS.SUBCLASS_OF,
			factory.namedNode(Config.RDFS_LITERAL)
		).length > 0
		
		);
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

		// for each sparqlString
		this.store.getQuads(
			undefined,
			Config.SPARQL_STRING,
			undefined
		).forEach( quad => {
			// find it with the full URI
			var re = new RegExp("<" + quad.subject.id + ">","g");
			sparql = sparql.replace(re, quad.object.value );			
		});

		return sparql;
	}

	getDefaultLabelProperty(classId) {
		return this._readAsSingleResource(classId, Config.DEFAULT_LABEL_PROPERTY);
	}

	getBeginDateProperty(propertyId) {
		return this._readAsSingleResource(propertyId, Config.BEGIN_DATE_PROPERTY);
	}

	getEndDateProperty(propertyId) {
		return this._readAsSingleResource(propertyId, Config.END_DATE_PROPERTY);
	}

	getExactDateProperty(propertyId) {
		return this._readAsSingleResource(propertyId, Config.EXACT_DATE_PROPERTY);
	}


	getDatasource(propertyOrClassId) {
		return this._readDatasourceAnnotationProperty(propertyOrClassId, Datasources.DATASOURCE);
	}

	getTreeRootsDatasource(propertyOrClassId) {
		return this._readDatasourceAnnotationProperty(propertyOrClassId, Datasources.TREE_ROOTS_DATASOURCE);
	}

	getTreeChildrenDatasource(propertyOrClassId) {
		return this._readDatasourceAnnotationProperty(propertyOrClassId, Datasources.TREE_CHILDREN_DATASOURCE);
	}

	isEnablingOptional(propertyId) {
		return (this._readAsSingleLiteral(propertyId, Config.ENABLE_OPTIONAL) == "true");		
	}

	isEnablingNegation(propertyId) {
		return (this._readAsSingleLiteral(propertyId, Config.ENABLE_NEGATION) == "true");	
	}

	isMultilingual(propertyId) {
		return (this._readAsSingleLiteral(propertyId, Config.IS_MULTILINGUAL) == "true");	
	}

	readRange(propertyId) {
		return this._readClassesInRangeOfProperty(propertyId);
	}


	_readDatasourceAnnotationProperty(propertyOrClassId, datasourceAnnotationProperty) {
		// read predicate datasource
		const datasourceQuads = this.store.getQuads(
			factory.namedNode(propertyOrClassId),
			datasourceAnnotationProperty,
		  	undefined
		);

		if(datasourceQuads.length == 0) {
			return null;
		}

		// hypothesis : there is only one datasource annotation, we return the first one
		// either it is known and we take it from the list of known datasources
		// either it is custom and we build it
		for (const datasourceQuad of datasourceQuads) {
			const datasourceUri = datasourceQuad.object.id;
		    var knownDatasource = Datasources.DATASOURCES_CONFIG.get(datasourceUri);
		    if(knownDatasource != null) {
		    	return knownDatasource;
		    } else {
		    	return this._buildDatasource(datasourceUri);	
		    }
		}
	}

	/**
	 * {
	 *   queryString: "...",
	 *   queryTemplate: "...",
	 *   labelPath: "...",
	 *   labelProperty: "...",
	 *   childrenPath: "...",
	 *   childrenProperty: "...",
	 *   noSort: true
	 * }
	 **/
	_buildDatasource(datasourceUri) {
		var datasource = {};
		// read datasource characteristics

    	// Alternative 1 : read optional queryString
    	var queryStrings = this._readAsLiteral(datasourceUri, Datasources.QUERY_STRING);
    	if(queryStrings.length > 0) {
    		datasource.queryString = queryStrings[0];	
    	}		    	

    	// Alternative 2 : query template + label path
    	var queryTemplates = this._readAsResource(datasourceUri, Datasources.QUERY_TEMPLATE);
    	if(queryTemplates.length > 0) {
    		var theQueryTemplate = queryTemplates[0];
    		var knownQueryTemplate = Datasources.QUERY_STRINGS_BY_QUERY_TEMPLATE.get(theQueryTemplate);
    		if(knownQueryTemplate != null) {
				// 2.1 It is known in default Sparnatural ontology
				datasource.queryTemplate = knownQueryTemplate;
			} else {
				// 2.2 Unknown, read the query string on the query template
				var queryStrings = this._readAsResource(theQueryTemplate, Datasources.QUERY_STRING);
				if(queryStrings.length > 0) {
					var queryString = queryStrings[0];
					datasource.queryTemplate = 
					(queryString.startsWith('"') && queryString.endsWith('"'))
						?queryString.substring(1,queryString.length-1)
						:queryString
					;
				}
			}

			// labelPath
			var labelPaths = this._readAsLiteral(datasourceUri, Datasources.LABEL_PATH);
	    	if(labelPaths.length > 0) {
	    		datasource.labelPath = labelPaths[0];	
	    	}	

			// labelProperty
			var labelProperties = this._readAsResource(datasourceUri, Datasources.LABEL_PROPERTY);
	    	if(labelProperties.length > 0) {
	    		datasource.labelProperty = labelProperties[0];	
	    	}

	    	// childrenPath
			var childrenPaths = this._readAsLiteral(datasourceUri, Datasources.CHILDREN_PATH);
	    	if(childrenPaths.length > 0) {
	    		datasource.childrenPath = childrenPaths[0];	
	    	}	

			// childrenProperty
			var childrenProperties = this._readAsResource(datasourceUri, Datasources.CHILDREN_PROPERTY);
	    	if(childrenProperties.length > 0) {
	    		datasource.childrenProperty = childrenProperties[0];	
	    	}
    	}

    	// read optional sparqlEndpointUrl
    	var sparqlEndpointUrls = this._readAsLiteral(datasourceUri, Datasources.SPARQL_ENDPOINT_URL);
    	if(sparqlEndpointUrls.length > 0) {
    		datasource.sparqlEndpointUrl = sparqlEndpointUrls[0];	
    	}

    	// read optional noSort
    	var noSorts = this._readAsLiteral(datasourceUri, Datasources.NO_SORT);
    	if(noSorts.length > 0) {
    		datasource.noSort = (noSorts[0] === "true");	
    	}

    	return datasource;
	}


	_sort(items) {
		var me = this;
		const compareFunction = function(item1, item2) {
		  // return me.getLabel(item1).localeCompare(me.getLabel(item2));

		  var order1 = me._readOrder(item1);
		  var order2 = me._readOrder(item2);

		  if(order1) {
		  	if(order2) {
		  		if(order1 == order2) {
		  			return me.getLabel(item1).localeCompare(me.getLabel(item2));
		  		} else {
		  			return (order1 > order2)?1:-1;
		  		}
		  	} else {
		  		return -1;
		  	}
		  } else {
		  	if(order2) {
		  		return 1;
		  	} else {
		  		return me.getLabel(item1).localeCompare(me.getLabel(item2));
		  	}
		  }
		};

		// sort according to order or label
		items.sort(compareFunction);
		return items;
	}

	_readPropertiesWithDomain(classId) {
		var properties = [];

		const propertyQuads = this.store.getQuads(
			undefined,
			RDFS.DOMAIN,
		  	factory.namedNode(classId),
		);

		for (const aQuad of propertyQuads) {
			// only select properties with proper Sparnatural configuration
			if(this.getObjectPropertyType(aQuad.subject.id)) {
		    	this._pushIfNotExist(aQuad.subject.id, properties);
			}
		}

		// read also the properties having as a domain a union containing this class
		var unionsContainingThisClass = this._readUnionsContaining(classId);
		
		for (const aUnionContainingThisClass of unionsContainingThisClass) {
		    const propertyQuadsHavingUnionAsDomain = this.store.getQuads(
				undefined,
				RDFS.DOMAIN,
			  	aUnionContainingThisClass,
			);

			for (const aQuad of propertyQuadsHavingUnionAsDomain) {
				// only select properties with proper Sparnatural configuration
				if(this.getObjectPropertyType(aQuad.subject.id)) {
				    this._pushIfNotExist(aQuad.subject.id, properties);
				}
			}
		}

		// read also the properties having as a domain a super-class of this class
		var superClassesOfThisClass = this._readImmediateSuperClasses(classId);

		for (const anImmediateSuperClass of superClassesOfThisClass) {
			var propertiesFromSuperClass = this._readPropertiesWithDomain(anImmediateSuperClass);
			for (const aProperty of propertiesFromSuperClass) {
			    this._pushIfNotExist(aProperty, properties);
			}
		}		

		return properties;
	}

	_readClassesInRangeOfProperty(propertyId) {
		var classes = [];

		const propertyQuads = this.store.getQuads(
			factory.namedNode(propertyId),
			RDFS.RANGE,
		  	undefined,
		);

		for (const aQuad of propertyQuads) {
			if(!this._isUnionClass(aQuad.object.id)) {	
		    	this._pushIfNotExist(aQuad.object.id, classes);
		    } else {
		    	// read union content
		    	var classesInUnion = this._readUnionContent(aQuad.object.id);
		    	for (const aUnionClass of classesInUnion) {
				    this._pushIfNotExist(aUnionClass, classes);	
		    	}
		    }
		}

		return classes;
	}

	_readImmediateSuperClasses(classId) {
		var classes = [];

		const subClassQuads = this.store.getQuads(
			factory.namedNode(classId),
			RDFS.SUBCLASS_OF,
		  	undefined,
		);

		for (const aQuad of subClassQuads) {
			this._pushIfNotExist(aQuad.object.id, classes);
		}

		return classes;
	}


	_readImmediateSubClasses(classId) {
		var classes = [];

		const subClassQuads = this.store.getQuads(
			undefined,
			RDFS.SUBCLASS_OF,
		  	factory.namedNode(classId),
		);

		for (const aQuad of subClassQuads) {
			this._pushIfNotExist(aQuad.subject.id, classes);
		}

		return classes;
	}

	/**
	 * Reads rdf:type(s) of an entity, and return them as an array
	 **/
	_readRdfTypes(uri) {
		return this._readAsResource(uri, RDF.TYPE);
	}

	/**
	 * Reads config:order of an entity and returns it, or null if not set
	 **/
	_readOrder(uri) {
		return this._readAsSingleLiteral(uri, Config.ORDER);
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

	/**
	 * Reads the given property on an entity, and returns the first value found, or null if not found
	 **/
	_readAsSingleResource(uri, property) {
		var values = this._readAsResource(uri, property);

		if(values.length > 0) {
			return values[0];
		}

		return null;
	}

	_readAsLiteral(uri, property) {
		return this.store.getQuads(
			factory.namedNode(uri),
			property,
			undefined
		)
		.map(quad => quad.object.value);
	}

	_readAsSingleLiteral(uri, property) {
		var values = this._readAsLiteral(uri, property);
		if(values.length == 0) {
			return undefined;
		} else {
			return values[0];
		}
	}

	_readAsLiteralWithLang(uri, property, lang, defaultToNoLang = true) {
		var values = this.store.getQuads(
			factory.namedNode(uri),
			property,
			undefined
		)
		.filter(quad => (quad.object.language == lang))
		.map(quad => quad.object.value);

		if(values.length == 0 && defaultToNoLang) {
			values = this.store.getQuads(
				factory.namedNode(uri),
				property,
				undefined
			)
			.filter(quad => (quad.object.language == ''))
			.map(quad => quad.object.value);
		}

		return values.join(", ");
	}

	_readAsRdfNode(rdfNode, property) {
		return this.store.getQuads(
			rdfNode,
			property,
			undefined
		)
		.map(quad => quad.object);
	}

	_hasProperty(rdfNode, property) {
		return this.store.getQuads(
			rdfNode,
			property,
			undefined
		).length > 0;
	}




	/*** Handling of UNION classes ***/

	_isUnionClass(classUri) {
		return this._hasProperty(factory.namedNode(classUri), OWL.UNION_OF);
	}

	_isInUnion(classUri) {
		return this.store.getQuads(
			undefined,
			RDF.FIRST,
			classUri
		).length > 0;;
	}

	_readUnionContent(classUri) {
		var lists = this._readAsRdfNode(factory.namedNode(classUri), OWL.UNION_OF);
		if(lists.length > 0) {
			return this._readList_rec(lists[0]);
		}
	}

	_readList_rec(list) {
		var result = this.store.getQuads(
			list,
			RDF.FIRST
		)
		.map(quad => quad.object.id);

		var subLists = this._readAsRdfNode(list, RDF.REST);
		if(subLists.length > 0) {
			result = result.concat(this._readList_rec(subLists[0]));
		}

		return result;
	}

	_readRootList(listId) {
		var root = this._readSuperList(listId);
		if(root == null) {
			return listId;
		} else {
			return this._readRootList(root);
		}
	}

	_readSuperList(listId) {
		const propertyQuads = this.store.getQuads(
			undefined,
			RDF.REST,
		  	listId
		);

		if(propertyQuads.length > 0) {
			return propertyQuads[0].subject.id;
		} else {
			return null;
		}
	}

	_readUnionsContaining(classId) {
		var unions = [];

		var listsContainingThisClass = this.store.getQuads(
			undefined,
			RDF.FIRST,
			factory.namedNode(classId)
		).map(quad => quad.subject);

		for (const aListContainingThisClass of listsContainingThisClass) {
			var rootList = this._readRootList(aListContainingThisClass);

			// now read the union pointing to this list
			var unionPointingToThisList = this.store.getQuads(
				undefined,
				OWL.UNION_OF,
				rootList
			).map(quad => quad.subject);

			if(unionPointingToThisList.length > 0) {
				unions.push(unionPointingToThisList[0]);
			}
		}

		return unions;
	}

	/*** / Handling of UNION classes ***/

	_pushIfNotExist(item, items) {
		if (items.indexOf(item) < 0) {
			items.push(item) ;
		}

		return items ;			
	}

}