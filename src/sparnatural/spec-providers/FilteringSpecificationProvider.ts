import ISparnaturalSpecification from "./ISparnaturalSpecification";
import ISpecificationEntity from "./ISpecificationEntity";
import ISpecificationProperty from "./ISpecificationProperty";

interface CountMap {
  [key: string]: number;
}

/**
 * @deprecated don't use anymore
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

  getLanguages(): string[] {
    return this.delegateSpecificationProvider.getLanguages();
  }

  getEntity(entityUri: string): ISpecificationEntity {
    return this.delegateSpecificationProvider.getEntity(entityUri);
  }

  getProperty(property: string): ISpecificationProperty {
    return this.delegateSpecificationProvider.getProperty(property);
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
        this.getEntity(classUri).getConnectedEntities().length > 0
      );
    });
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

  expandSparql(sparql: string, prefixes: { [key: string]: string; }) {
    return this.delegateSpecificationProvider.expandSparql(sparql, prefixes);
  }

}