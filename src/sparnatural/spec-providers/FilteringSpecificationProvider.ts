import ISparnaturalSpecification from "./ISparnaturalSpecification";

interface CountMap {
  [key: string]: number;
}

/**
 * This class should not be used anymore
 */
export class FilteringSpecificationProvider implements ISparnaturalSpecification {
  delegateSpecificationProvider: ISparnaturalSpecification;
  lang: string;
  classesCount:CountMap;
  propertiesCount:CountMap;

  
  constructor(delegateSpecificationProvider: ISparnaturalSpecification, lang: string) {
    this.delegateSpecificationProvider = delegateSpecificationProvider;
    this.lang = lang;
    this.classesCount = {};
    this.propertiesCount = {};
  }

  getDefaultLabelProperty(entityUri: string): string | null {
    throw new Error("Method not implemented.");
  }
  getTooltip(value_selected: string): string {
    throw new Error("Method not implemented.");
  }
  getTreeChildrenDatasource(propertyId: string) {
    throw new Error("Method not implemented.");
  }
  getTreeRootsDatasource(propertyId: string) {
    throw new Error("Method not implemented.");
  }
  isMultilingual(propertyId: string): boolean {
    throw new Error("Method not implemented.");
  }
  getBeginDateProperty(propertyId: string): string | null {
    throw new Error("Method not implemented.");
  }
  getEndDateProperty(propertyId: string): string | null {
    throw new Error("Method not implemented.");
  }
  getExactDateProperty(propertyId: string): string | null {
    throw new Error("Method not implemented.");
  }
  isEnablingNegation(propertyId: string): boolean {
    throw new Error("Method not implemented.");
  }
  isEnablingOptional(propertyId: string): boolean {
    throw new Error("Method not implemented.");
  }
  getServiceEndpoint(propertyId: string): string | null {
    throw new Error("Method not implemented.");
  }
  isLogicallyExecutedAfter(propertyId: string): boolean {
    throw new Error("Method not implemented.");
  }

  notifyClassCount(classUri: string, count: number) {
    console.log("Notified of class count : " + classUri + " = " + count);
    this.classesCount[classUri] = count;
  }

  notifyPropertyCount(domain: string, property: string, range: string, count: number) {
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

  getEntitiesInDomainOfAnyProperty() {
    var items =
      this.delegateSpecificationProvider.getEntitiesInDomainOfAnyProperty();
    return items.filter((classUri:string) => {
      return (
        this._isClassAvailable(classUri) &&
        this.getConnectedEntities(classUri).length > 0
      );
    });
  }

  getConnectedEntities(domainClassUri: string) {
    var items =
      this.delegateSpecificationProvider.getConnectedEntities(domainClassUri);
    return items.filter((rangeClassUri) => {
      return (
        this._isClassAvailable(rangeClassUri) &&
        this.getConnectingProperties(domainClassUri, rangeClassUri).length > 0
      );
    });
  }

  getConnectingProperties(domainClassId: string, rangeClassId: string) {
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

  hasConnectedEntities(classId: string) {
    return this.getConnectedEntities(classId).length > 0;
  }

  _isClassAvailable(classUri: string) {
    return (
      // we don't have statistics for this class
      typeof this.classesCount[classUri] == "undefined" ||
      // of we have a count > 0
      this.classesCount[classUri] > 0
    );
  }

  _isPropertyAvailable(domainClassId: string, propertyId: string, rangeClassId: string) {
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

  getAllSparnaturalEntities() {
    return this.delegateSpecificationProvider.getAllSparnaturalEntities();
  }

  getLabel(entityId: string) {
    return this.delegateSpecificationProvider.getLabel(entityId);
  }

  getIcon(classId: string) {
    return this.delegateSpecificationProvider.getIcon(classId);
  }

  getHighlightedIcon(classId: string) {
    return this.delegateSpecificationProvider.getHighlightedIcon(classId);
  }

  getPropertyType(objectPropertyId: string) {
    return this.delegateSpecificationProvider.getPropertyType(
      objectPropertyId
    );
  }

  isRemoteEntity(classUri: string) {
    return this.delegateSpecificationProvider.isRemoteEntity(classUri);
  }

  isLiteralEntity(classUri: string) {
    return this.delegateSpecificationProvider.isLiteralEntity(classUri);
  }

  expandSparql(sparql: string, prefixes: { [key: string]: string; }) {
    return this.delegateSpecificationProvider.expandSparql(sparql, prefixes);
  }

  getDatasource(propertyOrClassId: string) {
    return this.delegateSpecificationProvider.getDatasource(propertyOrClassId);
  }
}
