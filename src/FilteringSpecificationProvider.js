
export class FilteringSpecificationProvider {

	constructor(delegateSpecificationProvider, lang) {
		this.delegateSpecificationProvider = delegateSpecificationProvider;
		this.lang = lang;
		this.classesCount = [];
		this.propertiesCount = [];
	}


	notifyClassCount(classUri, count) {
		console.log("Notifed of class count : "+classUri+" = "+count);
		this.classesCount[classUri] = count;
	}

	notifyPropertyCount(domain, property, range, count) {
		var key = {
			'domain':domain,
			'property':property,
			'range':range
		};
		console.log("Notifed of properties count : "+key+" = "+count);
		this.propertiesCount[key] = count;
	}


	getClassesInDomainOfAnyProperty() {
		var items = this.delegateSpecificationProvider.getClassesInDomainOfAnyProperty();
		return items;
	}

	getConnectedClasses(classId) {
		var items = this.delegateSpecificationProvider.getConnectedClasses(classId);
		return items;
	}

	hasConnectedClasses(classId) {
		return ( this.getConnectedClasses(classId).length > 0 );
	}

	getConnectingProperties(domainClassId, rangeClassId) {
		var items = this.delegateSpecificationProvider.getConnectingProperties(domainClassId, rangeClassId);
		return items;
	}

	/** All these methods simply defer to delegate specification provider **/

	getAllSparnaturalClasses() {
		return this.delegateSpecificationProvider.getAllSparnaturalClasses();
	}

	getLabel(entityId) {
		return this.delegateSpecificationProvider.getLabel(entityId);
	}

	getIcon(classId) {
		return this.delegateSpecificationProvider.getIcon(classId);
	}

	getHighlightedIcon(classId) {
		return this.delegateSpecificationProvider.getHighlightedIcon(classId);
	}

	getObjectPropertyType(objectPropertyId) {
		return this.delegateSpecificationProvider.getObjectPropertyType(objectPropertyId);	
	}

	isRemoteClass(classUri) {
		return this.delegateSpecificationProvider.isRemoteClass(classUri);
	}

	isLiteralClass(classUri) {
		return this.delegateSpecificationProvider.isLiteralClass(classUri);
	}

	isSparnaturalClass(classUri) {
		return this.delegateSpecificationProvider.isSparnaturalClass(classUri);
	}

	expandSparql(sparql) {
		return this.delegateSpecificationProvider.expandSparql(sparql);
	}

	getDatasource(propertyOrClassId) {
		return this.delegateSpecificationProvider.getDatasource(propertyOrClassId);	
	}

}