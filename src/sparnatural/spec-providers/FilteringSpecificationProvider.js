export class FilteringSpecificationProvider {
  constructor(delegateSpecificationProvider, lang) {
    this.delegateSpecificationProvider = delegateSpecificationProvider;
    this.lang = lang;
    this.classesCount = [];
    this.propertiesCount = [];
  }

  notifyClassCount(classUri, count) {
    console.log("Notified of class count : " + classUri + " = " + count);
    this.classesCount[classUri] = count;
  }

  notifyPropertyCount(domain, property, range, count) {
    var key =
      "domain=" +
      domain +
      "|" +
      "property=" +
      property +
      "|" +
      "range=" +
      range;
    console.log("Notified of properties count : " + key + " = " + count);
    this.propertiesCount[key] = count;
  }

  getClassesInDomainOfAnyProperty() {
    var items =
      this.delegateSpecificationProvider.getClassesInDomainOfAnyProperty();
    return items.filter((classUri) => {
      return (
        this._isClassAvailable(classUri) &&
        this.getConnectedClasses(classUri).length > 0
      );
    });
  }

  getConnectedClasses(domainClassUri) {
    var items =
      this.delegateSpecificationProvider.getConnectedClasses(domainClassUri);
    return items.filter((rangeClassUri) => {
      return (
        this._isClassAvailable(rangeClassUri) &&
        this.getConnectingProperties(domainClassUri, rangeClassUri).length > 0
      );
    });
  }

  getConnectingProperties(domainClassId, rangeClassId) {
    var items = this.delegateSpecificationProvider.getConnectingProperties(
      domainClassId,
      rangeClassId
    );
    return items.filter((propertyUri) => {
      return this._isPropertyAvailable(
        domainClassId,
        propertyUri,
        rangeClassId
      );
    });
  }

  hasConnectedClasses(classId) {
    return this.getConnectedClasses(classId).length > 0;
  }

  _isClassAvailable(classUri) {
    return (
      // we don't have statistics for this class
      typeof this.classesCount[classUri] == "undefined" ||
      // of we have a count > 0
      this.classesCount[classUri] > 0
    );
  }

  _isPropertyAvailable(domainClassId, propertyId, rangeClassId) {
    var key =
      "domain=" +
      domainClassId +
      "|" +
      "property=" +
      propertyId +
      "|" +
      "range=" +
      rangeClassId;
    return (
      // we don't have statistics for this class
      typeof this.propertiesCount[key] == "undefined" ||
      this.propertiesCount[key] > 0
    );
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
    return this.delegateSpecificationProvider.getObjectPropertyType(
      objectPropertyId
    );
  }

  isNotInstantiatedClass(classUri) {
    return this.delegateSpecificationProvider.isNotInstantiatedClass(classUri);
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
