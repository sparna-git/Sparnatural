var SimpleJsonLdSpecificationProvider = function(specs, lang) {

	this.specSearch = specs;
	this.lang = lang;

	this.gatLabel = function(graphItemID) {
		for(var i in graphItemID['label']) {
			var aLabel = graphItemID['label'][i];
			if ( aLabel['@language'] == this.lang) {
				return aLabel['@value'] ;
			}
		}
		return '';		
	}

	this.getResourceById = function(id) {
		for(var i in this.specSearch['@graph']) {
			var anEntry = this.specSearch['@graph'][i];
			if ( anEntry['@id'] == id) {
				return anEntry;
			}
		}
		return null;
	}

	this.getClassLabel = function(ClassId) {
		var classLabel = null ;
		var classObject = this.getResourceById(ClassId) ;
		if (classObject !== null) {
			for(var i in classObject['label']) {
				var aLabel = classObject['label'][i];
				if (aLabel['@language'] == this.lang) {
					return aLabel['@value'] ;
				}
			}
		}
		return null ;
	}

	/* List of possible Class relative to a Class
	@Id of Class or null if is the first list selection
	return array of @type Class in specSearch 
	*/
	this.getAllClassFor = function(ClassID) {
		var items = [];

		for(var j in this.specSearch['@graph']) {			
			if (this.specSearch['@graph'][j]['@type'] == 'ObjectProperty') {
				var objectProperty = this.specSearch['@graph'][j];
				
				// if ClassIf is null, we are looking for all domain values
				if (ClassID === null) {
					var values = this.readDomain(objectProperty);
					for(var i in values) {
						items = this.pushIfNotInArray(this.getResourceById(values[i]), items);
					}
				// otherwise we are looking for range values of all properties
				// for which this class is in the domain
				} else if (this.inDomainOf(objectProperty, ClassID)) {
					var values = this.readRange(objectProperty);
					for(var i in values) {
						var item = this.getResourceById(values[i]) ;
						items = this.pushIfNotInArray(item, items);
					}
				}
			}
		}

		return items ;
	}

	this.ClassHaveRange = function(ClassID) {
		if (this.getAllClassFor(ClassID).length > 0 ) {
			return true;
		} else {
			return false ;
		}
	}

	/* List of possible ObjectProperty relative to a Class
		@Id of Class
		return array of @type ObjectProperty in specSearch 
	*/
	this.getAllObjectPropertyFor = function(domainClassID, rangeClassID) {
		var items = [];

		for(var i in this.specSearch['@graph']) {
			var item = this.specSearch['@graph'][i];
			if (item['@type'] == 'ObjectProperty') {
				if(
					(domainClassID === null || this.inDomainOf(item, domainClassID))
					&&
					(rangeClassID === null || this.inRangeOf(item, rangeClassID))
				) {
					items = this.pushIfNotInArray(item, items);
				}
			}
		}

		return items ;
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

	this.readDomain = function(objectProperty) {
		return this._readDomainOrRange(objectProperty, 'domain');
	}

	this.readRange = function(objectProperty) {
		return this._readDomainOrRange(objectProperty, 'range');
	}

	this.inDomainOf = function(objectProperty, classId) {
		return this.readDomain(objectProperty).indexOf(classId) >= 0;
	}

	this.inRangeOf = function(objectProperty, classId) {
		return this.readRange(objectProperty).indexOf(classId) >= 0;
	}

	this.pushIfNotInArray = function(item, items) {
		if (items.indexOf(item) < 0) {
			items.push(item) ;
		}

		return items ;			
	}

}

module.exports = {
	SimpleJsonLdSpecificationProvider: SimpleJsonLdSpecificationProvider	
}