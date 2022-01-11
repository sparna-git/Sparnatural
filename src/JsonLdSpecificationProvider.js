
var Datasources = require("./SparnaturalConfigDatasources.js");
var Config = require("./SparnaturalConfig.js");

var JsonLdSpecificationProvider = function(specs, lang) {

	this.jsonSpecs = specs;
	this.lang = lang;

	this.getObjectPropertyType = function(objectPropertyId) {
		var objectProperty = this._getResourceById(objectPropertyId);

		var superProperties = (objectProperty['subPropertyOf'] === "object")?objectProperty['subPropertyOf']:new Array(objectProperty['subPropertyOf']);

		for(var i in superProperties) {
			var value = superProperties[i];

			if(
				value == "sparnatural:AutocompleteProperty"
				||
				value == "sparnatural:ListProperty"
				||
				value == "sparnatural:LiteralListProperty"
				||
				value == "sparnatural:SearchProperty"
				||
				value == "sparnatural:StringEqualsProperty"
				||
				value == "sparnatural:GraphDBSearchProperty"
				||
				value == "sparnatural:TimeProperty-Year"
				||
				value == "sparnatural:TimeProperty-Date"
				||
				value == "sparnatural:TimeProperty-Period"
				||
				value == "sparnatural:NonSelectableProperty"
			) {
				return this._expand(value);
			}
		}
	}

	this.getDatasource = function(propertyOrClassId) {
		var propertyOrClass = this._getResourceById(propertyOrClassId);

		var datasourceValue = propertyOrClass['datasource'];

		if(datasourceValue == null) {
			return null;
		}

		var datasource = {};
		
		if (typeof datasourceValue === "object") {
			// if datasource is an object...

			// Alternative 1 : read optional queryString
			datasource.queryString = datasourceValue['queryString'];

			// Alternative 2 : queryTemplate + labelPath
			var queryTemplate = datasourceValue['queryTemplate'];

			if(queryTemplate != null) {
				var expandedQueryTemplate = this._expand(queryTemplate);
				var knownQueryTemplate = Datasources.QUERY_STRINGS_BY_QUERY_TEMPLATE.get(expandedQueryTemplate);
				if(knownQueryTemplate != null) {
					// 2.1 It is known in default Sparnatural ontology
					datasource.queryTemplate = knownQueryTemplate;
				} else {
					// 2.2 Unknown, could be defined in the config itself
				}
			}

			// labelPath
			datasource.labelPath = datasourceValue['labelPath'];

			// labelProperty
			datasource.labelProperty = datasourceValue['labelProperty'];

			// read optional sparqlEndpointUrl
			datasource.sparqlEndpointUrl = datasourceValue['sparqlEndpointUrl'];
		} else {
			// if datasource is a URI...
			// look it up in known datasources config
			datasource = Datasources.DATASOURCES_CONFIG.get(this._expand(datasourceValue));
			if(datasource == null) {
				// look it up in the config
				// TODO
			}			
		}

		return datasource;
	}

	this.getIcon = function(classId) {
		if(this._getResourceById(classId)["faIcon"] != null) {
			// use of fa-fw for fixed-width icons
			return "<span style='font-size: 170%;' >&nbsp;<i class='" + this._getResourceById(classId)["faIcon"] + " fa-fw'></i></span>";
		} else if (this._getResourceById(classId)["icon"] != null) {
			return this._getResourceById(classId)["icon"];
		} else {
			// this is ugly, just so it aligns with other entries having an icon
			return "<span style='font-size: 175%;' >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>";
		}
	}

	this.getHighlightedIcon = function(classId) {
		return this._getResourceById(classId)["highlightedIcon"];
	}

	this.getLabel = function(classOrPropertyId) {
		var item = this._getResourceById(classOrPropertyId) ;
		if (item !== null) {
			for(var i in item['label']) {
				var aLabel = item['label'][i];
				if (aLabel['@language'] == this.lang) {
					return aLabel['@value'] ;
				}
			}
		}

		return null ;
	}

	this.getTooltip = function(classOrPropertyId) {
		var item = this._getResourceById(classOrPropertyId) ;
		if (item !== null) {
			for(var i in item['tooltip']) {
				var aLabel = item['tooltip'][i];
				if (aLabel['@language'] == this.lang) {
					return aLabel['@value'] ;
				}
			}
		}

		return null ;
	}

	this.isEnablingOptional = function(propertyId) {
		var item = this._getResourceById(propertyId) ;
		if (item !== null) {
			return (item['enableOptional'] == true);
		}	

		return false;
	}

	this.isEnablingNegation = function(propertyId) {
		var item = this._getResourceById(propertyId) ;
		if (item !== null) {
			return (item['enableNegation'] == true);
		}	

		return false;
	}

	this.isMultilingual = function(propertyId) {
		var item = this._getResourceById(propertyId) ;
		if (item !== null) {
			return (item['isMultilingual'] == true);
		}	

		return false;
	}

	this.getAllSparnaturalClasses = function() {
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


	/* 
		List of possible Class relative to a Class
		return array of @type Class in jsonSpecs 
	*/
	this.getConnectedClasses = function(classId) {
		var items = [];

		for(var j in this.jsonSpecs['@graph']) {
			var item = this.jsonSpecs['@graph'][j];		
			if (this._isObjectProperty(item)) {
				if (this._inDomainOf(item, classId)) {
					var values = this._readRange(item);
					for(var i in values) {
						items = this._pushIfNotExist(values[i], items);
					}
				}
			}
		}

		// sort resulting array to garantee classes appear in the order
		// they are declared in the specs
		items = this._sortItemsByIndex(items);

		return items ;
	}

	this.hasConnectedClasses = function(classId) {
		return ( this.getConnectedClasses(classId).length > 0 );
	}

	/*
		Reads "first-level" classes, i.e. classes that are in the domain
		of at least one property that connects them to other classes
	*/
	this.getClassesInDomainOfAnyProperty = function() {
		var items = [];

		for(var j in this.jsonSpecs['@graph']) {
			var item = this.jsonSpecs['@graph'][j];		
			if (this._isObjectProperty(item)) {				
				var domains = this._readDomain(item);
				for(var i in domains) {
					var aClass = domains[i]
					// always exclude RemoteClasses from first list
		    		if(!this.isRemoteClass(aClass)) {
		    			items = this._pushIfNotExist(aClass, items);
		    		}
				}
			}
		}

		// sort resulting array to garantee classes appear in the order
		// they are declared in the specs
		items = this._sortItemsByIndex(items);

		return items ;
	}

	/* List of possible ObjectProperty relative to a Class
		@Id of Class
		return array of @type ObjectProperty in jsonSpecs 
	*/
	this.getConnectingProperties = function(domainClassId, rangeClassId) {
		var items = [];

		for(var i in this.jsonSpecs['@graph']) {
			var item = this.jsonSpecs['@graph'][i];
			if (this._isObjectProperty(item)) {
				if(
					(domainClassId === null || this._inDomainOf(item, domainClassId))
					&&
					(rangeClassId === null || this._inRangeOf(item, rangeClassId))
				) {
					items = this._pushIfNotExist(item['@id'], items);
				}
			}
		}

		return items ;
	}

	this.isRemoteClass = function(classUri) {
		var classEntity = this._getResourceById(classUri);
		
		if(classEntity['subClassOf']) {
			var superClasses = (classEntity['subClassOf'] === "object")?classEntity['subClassOf']:new Array(classEntity['subClassOf']);
			for(var i in superClasses) {
				var value = superClasses[i];
				if(this._expand(value) == Config.NOT_INSTANTIATED_CLASS) {
					return true;
				}
			}
		}

		return false;
	}

	this.isLiteralClass = function(classUri) {
		var classEntity = this._getResourceById(classUri);

		if(classEntity['subClassOf']) {
			var superClasses = (classEntity['subClassOf'] === "object")?classEntity['subClassOf']:new Array(classEntity['subClassOf']);
			for(var i in superClasses) {
				var value = superClasses[i];
				if(this._expand(value) == Config.RDFS_LITERAL) {
					return true;
				}
			}
		}

		return false;
	}

	this.expandSparql = function(sparql) {
		for(var i in this.jsonSpecs['@graph']) {
			var item = this.jsonSpecs['@graph'][i];

			if ( item['sparqlString'] != null) {
				var re = new RegExp("<" + item['@id'] + ">","g");
				sparql = sparql.replace(re, item['sparqlString']);
			}
		}

		return sparql;
	}


	this._sortItemsByIndex = function(items) {
		var me = this;
		items.sort(function(c1, c2) {
			const c1Value = me.jsonSpecs['@graph'].indexOf(me._getResourceById(c1));
			const c2Value = me.jsonSpecs['@graph'].indexOf(me._getResourceById(c2));

			let comparison = 0;
			if (c1Value > c2Value) {
				comparison = 1;
			} else if (c1Value < c2Value) {
				comparison = -1;
			}
			return comparison;
		});

		return items;	
	}


	this._inDomainOf = function(objectProperty, classId) {
		return this._readDomain(objectProperty).indexOf(classId) >= 0;
	}

	this._inRangeOf = function(objectProperty, classId) {
		return this._readRange(objectProperty).indexOf(classId) >= 0;
	}

	this._readDomain = function(objectProperty) {
		return this._readDomainOrRange(objectProperty, 'domain');
	}

	this._readRange = function(objectProperty) {
		return this._readDomainOrRange(objectProperty, 'range');
	}

	this._readDomainOrRange = function(objectProperty, domainOrRange) {
		var result = [];
		if (typeof objectProperty[domainOrRange] === "object") {
			for(var i in objectProperty[domainOrRange]['unionOf']['@list']) {
				var value = objectProperty[domainOrRange]['unionOf']['@list'][i];
				result.push(value['@id']);
			}
		} else {
			result.push(objectProperty[domainOrRange]);
		}

		return result;
	}

	this._isObjectProperty = function(item) {
		if (typeof item['@type'] === "object") {
			for(var i in item['@type']) {
				var value = item['@type'][i];
				if(value == 'ObjectProperty') {
					return true;
				}
			}

			return false;
		} else {
			return (item['@type'] == 'ObjectProperty')
		}
	}

	this._getResourceById = function(id) {
		for(var i in this.jsonSpecs['@graph']) {
			var anEntry = this.jsonSpecs['@graph'][i];
			if ( anEntry['@id'] == id ) {
				return anEntry;
			}
		}
		return null;
	}

	this._expand = function(id) {
		if(id.startsWith("http")) {
			return id;
		}

		if(id.indexOf(":") >= 0) {
			prefix = id.split(":")[0];
			if(this.jsonSpecs['@context'][prefix] == null) {
				// can't do anything
				return id;
			} else {
				return this.jsonSpecs['@context'][prefix]+id.split(":")[1];
			}
		} else {
			if(this.jsonSpecs['@context']['@vocab'] == null) {
				// can't do anything
				return id;
			} else {
				return this.jsonSpecs['@context']['@vocab']+id;
			}
		}		
	}

	this._pushIfNotExist = function(item, items) {
		if (items.indexOf(item) < 0) {
			items.push(item) ;
		}

		return items ;			
	}

}

module.exports = {
	JsonLdSpecificationProvider: JsonLdSpecificationProvider	
}