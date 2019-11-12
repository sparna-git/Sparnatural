var SimpleJsonLdSpecificationProvider = function(specs, lang) {

	this.specSearch = specs;
	this.lang = lang;

	this.getWidget = function(objectPropertyId) {
		var objectProperty = this._getResourceById(objectPropertyId);
		for(var i in objectProperty['@type']) {
			var value = objectProperty['@type'][i];
			switch(value) {
			  case "AutocompleteProperty":
			    return "AutocompleteProperty";
			    break;
			  case "ListProperty":
			    return "ListProperty";
			    break;
			  case "TimePeriodProperty":
			    return "TimePeriodProperty";
			    break;
			  case "SearchProperty":
			    return "SearchProperty";
				break;
			  case "TimeDatePickerProperty":
				return "TimeDatePickerProperty";
				break;
			  case "TimeDateDayPickerProperty":
				return "TimeDateDayPickerProperty";
				break;
			  case "NonSelectableProperty":
				return "NonSelectableProperty";
				break;
			  default:
			  	break;
			}
		}
	}

	this.getIcon = function(classId) {
		if(this._getResourceById(classId)["faIcon"] != null) {
			return "<span style='font-size: 170%;' >&nbsp;<i class='" + this._getResourceById(classId)["faIcon"] + "'></i></span>";
		} else {
			return this._getResourceById(classId)["icon"];
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

	/* 
		List of possible Class relative to a Class
		return array of @type Class in specSearch 
	*/
	this.getConnectedClasses = function(classId) {
		var items = [];

		for(var j in this.specSearch['@graph']) {
			var item = this.specSearch['@graph'][j];		
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

		for(var j in this.specSearch['@graph']) {
			var item = this.specSearch['@graph'][j];		
			if (this._isObjectProperty(item)) {				
				var domains = this._readDomain(item);
				for(var i in domains) {
					items = this._pushIfNotExist(domains[i], items);
				}
			}
		}

		// sort resulting array to garantee classes appear in the order
		// they are declared in the specs
		items = this._sortItemsByIndex(items);

		return items ;
	}

	this._sortItemsByIndex = function(items) {
		var me = this;
		items.sort(function(c1, c2) {
			const c1Value = me.specSearch['@graph'].indexOf(me._getResourceById(c1));
			const c2Value = me.specSearch['@graph'].indexOf(me._getResourceById(c2));

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

	/* List of possible ObjectProperty relative to a Class
		@Id of Class
		return array of @type ObjectProperty in specSearch 
	*/
	this.getConnectingProperties = function(domainClassId, rangeClassId) {
		var items = [];

		for(var i in this.specSearch['@graph']) {
			var item = this.specSearch['@graph'][i];
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
		for(var i in this.specSearch['@graph']) {
			var anEntry = this.specSearch['@graph'][i];
			if ( anEntry['@id'] == id ) {
				return anEntry;
			}
		}
		return null;
	}

	this._pushIfNotExist = function(item, items) {
		if (items.indexOf(item) < 0) {
			items.push(item) ;
		}

		return items ;			
	}

}

module.exports = {
	SimpleJsonLdSpecificationProvider: SimpleJsonLdSpecificationProvider	
}