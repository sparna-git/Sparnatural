import Datasources from "./SparnaturalConfigDatasources"
import {Config} from "./configs/fixed-configs/SparnaturalConfig"

interface IDataSources {
	queryString: string,
	queryTemplate: any,
	labelPath: any,
	labelProperty: any,
	childrenPath: any,
	childrenProperty: any,
	sparqlEndpointUrl: any,
	noSort: any
}

export default class JsonLdSpecificationProvider {
	jsonSpecs:any;
	lang:any;
	constructor(specs:any, lang:any){
		this.jsonSpecs = specs;
		this.lang = lang;
	}

	getObjectPropertyType = function(objectPropertyId: any) {
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
				||
				value == "sparnatural:BooleanProperty"
				||
				value == "sparnatural:TreeProperty"
			) {
				return this._expand(value);
			}
		}
	}

	getDatasource = function(propertyOrClassId: any) {
		var propertyOrClass = this._getResourceById(propertyOrClassId);
		return this._buildDatasource(propertyOrClass['datasource']);
	}

	getTreeRootsDatasource = function(propertyOrClassId: any) {
		var propertyOrClass = this._getResourceById(propertyOrClassId);
		return this._buildDatasource(propertyOrClass['treeRootsDatasource']);
	}

	getTreeChildrenDatasource = function(propertyOrClassId: any) {
		var propertyOrClass = this._getResourceById(propertyOrClassId);
		return this._buildDatasource(propertyOrClass['treeChildrenDatasource']);
	}

	/**
	 * {
	 *   queryString: "...",
	 *   queryTemplate: "...",
	 *   labelPath: "...",
	 *   labelProperty: "...",
	 *   childrenPath: "...",
	 *   childrenProperty: "..."
	 * }
	 **/
	_buildDatasource = function(datasourceObject: { [x: string]: any; }) {
		if(datasourceObject == null) {
			return null;
		}

		var datasource:IDataSources;
		
		if (typeof datasourceObject === "object") {
			// if datasource is an object...

			// Alternative 1 : read optional queryString
			datasource.queryString = datasourceObject['queryString'];

			// Alternative 2 : queryTemplate + labelPath
			var queryTemplate = datasourceObject['queryTemplate'];

			if(queryTemplate != null) {
				var expandedQueryTemplate = this._expand(queryTemplate);
				var knownQueryTemplate = Datasources.QUERY_STRINGS_BY_QUERY_TEMPLATE.get(expandedQueryTemplate);
				if(knownQueryTemplate != null) {
					// 2.1 It is known in default Sparnatural ontology
					datasource.queryTemplate = knownQueryTemplate;
				} else {
					// 2.2 Unknown, could be defined in the config itself
					// TODO
					console.log("Reference to custom query template currently unsupported in JSON config");
				}
			}

			// labelPath
			datasource.labelPath = datasourceObject['labelPath'];

			// labelProperty
			datasource.labelProperty = datasourceObject['labelProperty'];

			// childrenPath
			datasource.childrenPath = datasourceObject['childrenPath'];

			// childrenProperty
			datasource.childrenProperty = datasourceObject['childrenProperty'];

			// read optional sparqlEndpointUrl
			datasource.sparqlEndpointUrl = datasourceObject['sparqlEndpointUrl'];

			// read optional noSort
			datasource.noSort = datasourceObject['noSort'];
		} else {
			// if datasource is a URI...
			// look it up in known datasources config
			datasource = Datasources.DATASOURCES_CONFIG.get(this._expand(datasourceObject));
			if(datasource == null) {
				// look it up in the config
				console.log("Reference to custom datasource URI currently unsupported in JSON config");
			}			
		}

		return datasource;
	}

	getIcon = function(classId: any) {
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

	getHighlightedIcon = function(classId: any) {
		return this._getResourceById(classId)["highlightedIcon"];
	}

	getLabel = function(classOrPropertyId: any) {
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

	getTooltip = function(classOrPropertyId: any) {
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

	getDefaultLabelProperty = function(classId: any) {
		return this._readValue(classId, 'defaultLabelProperty');
	}

	getBeginDateProperty = function(propertyId: any) {
		return this._readValue(propertyId, 'beginDateProperty');
	}

	getEndDateProperty = function(propertyId: any) {
		return this._readValue(propertyId, 'endDateProperty');
	}

	getExactDateProperty = function(propertyId: any) {
		return this._readValue(propertyId, 'exactDateProperty');
	}

	isEnablingOptional = function(propertyId: any) {
		var item = this._getResourceById(propertyId) ;
		if (item !== null) {
			return (item['enableOptional'] == true);
		}	

		return false;
	}

	isEnablingNegation = function(propertyId: any) {
		var item = this._getResourceById(propertyId) ;
		if (item !== null) {
			return (item['enableNegation'] == true);
		}	

		return false;
	}

	isMultilingual = function(propertyId: any) {
		var item = this._getResourceById(propertyId) ;
		if (item !== null) {
			return (item['isMultilingual'] == true);
		}	

		return false;
	}

	getAllSparnaturalClasses = function() {
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
	getConnectedClasses = function(classId: any) {
		var items: any[] = [];

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

	hasConnectedClasses = function(classId: any) {
		return ( this.getConnectedClasses(classId).length > 0 );
	}

	/*
		Reads "first-level" classes, i.e. classes that are in the domain
		of at least one property that connects them to other classes
	*/
	getClassesInDomainOfAnyProperty = function() {
		var items: any[] = [];

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
	getConnectingProperties = function(domainClassId: any, rangeClassId: any) {
		var items: any[] = [];

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

	isRemoteClass = function(classUri: any) {
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

	isLiteralClass = function(classUri: any) {
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

	expandSparql = function(sparql: string) {
		for(var i in this.jsonSpecs['@graph']) {
			var item = this.jsonSpecs['@graph'][i];

			if ( item['sparqlString'] != null) {
				var re = new RegExp("<" + item['@id'] + ">","g");
				sparql = sparql.replace(re, item['sparqlString']);
			}
		}

		return sparql;
	}

	readRange = function(objectProperty: any) {
		var propertyEntity = this._getResourceById(objectProperty);
		if(propertyEntity != null) {
			return this._readRange(propertyEntity);
		}
		return null;
	}


	_sortItemsByIndex = function(items: any[]) {
		var me = this;
		items.sort(function(c1: any, c2: any) {
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


	_inDomainOf = function(objectProperty: any, classId: any) {
		return this._readDomain(objectProperty).indexOf(classId) >= 0;
	}

	_inRangeOf = function(objectProperty: any, classId: any) {
		return this._readRange(objectProperty).indexOf(classId) >= 0;
	}

	_readDomain = function(objectProperty: any) {
		return this._readDomainOrRange(objectProperty, 'domain');
	}

	_readRange = function(objectProperty: any) {
		return this._readDomainOrRange(objectProperty, 'range');
	}

	_readDomainOrRange = function(objectProperty: { [x: string]: any; }, domainOrRange: string | number) {
		var result = [];
		if (typeof objectProperty[domainOrRange] === "object") {
			for(var i in objectProperty[domainOrRange]['unionOf']['@list']) {
				var value = objectProperty[domainOrRange]['unionOf']['@list'][i];
				result.push(value['@id']);
			}
		} else if (objectProperty[domainOrRange]) {
			result.push(objectProperty[domainOrRange]);
		}

		return result;
	}

	_readValue = function(id: any, key: string | number) {
		var theObject = this._getResourceById(id);

		if(theObject !== null && theObject[key]) {
			return theObject[key];
		}

		return null;
	}

	_isObjectProperty = function(item: { [x: string]: any; }) {
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

	_getResourceById = function(id: any) {
		for(var i in this.jsonSpecs['@graph']) {
			var anEntry = this.jsonSpecs['@graph'][i];
			if ( anEntry['@id'] == id ) {
				return anEntry;
			}
		}
		return null;
	}

	_expand = function(id: string) {
		if(id.startsWith("http")) {
			return id;
		}

		if(id.indexOf(":") >= 0) {
			let prefix = id.split(":")[0];
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

	_pushIfNotExist = function(item: any, items: any[]) {
		if (items.indexOf(item) < 0) {
			items.push(item) ;
		}

		return items ;			
	}

}
	
