import { BaseRDFReader, RDF, RDFS } from "../BaseRDFReader";
import ISpecificationEntity from "../ISpecificationEntity";
import { Quad, Store } from "n3";
import { OWLSpecificationEntry } from "./OWLSpecificationEntry";
import { OWL, OWLSpecificationProvider } from "./OWLSpecificationProvider";
import factory from "@rdfjs/data-model";
import { Config } from "../../ontologies/SparnaturalConfig";
import { OWLSpecificationProperty } from "./OWLSpecificationProperty";

export class OWLSpecificationEntity extends OWLSpecificationEntry implements ISpecificationEntity {

    constructor(uri:string, provider: OWLSpecificationProvider, n3store: Store<Quad>, lang: string) {
        super(uri, provider, n3store, lang);
    }


    getConnectedEntities(): string[] {
        var items: any[] = [];

        const properties = this.#_readPropertiesWithDomain(this.uri);

        // now read their ranges
        for (const aProperty of properties) {
          let prop = new OWLSpecificationProperty(aProperty, this.provider, this.store, this.lang);
          var classesInRange = prop.getRange();
          for (const aClass of classesInRange) {
              // if it is not a Sparnatural Class, read all its subClasses that are Sparnatural classes
              if (!this.#_isSparnaturalClass(aClass)) {
              // TODO : recursivity
              var subClasses = this.#_readImmediateSubClasses(aClass);
              for (const aSubClass of subClasses) {
                  if (this.#_isSparnaturalClass(aSubClass)) {
                  this._pushIfNotExist(aSubClass, items);
                  }
              }
              } else {
              this._pushIfNotExist(aClass, items);
              }
          }
        }

        items = this.provider._sort(items);

        return items;
    }


    hasConnectedEntities(): boolean {
        return this.getConnectedEntities().length > 0;
    }

    getConnectingProperties(range: string): string[] {
        var items: any[] = [];

        const properties = this.#_readPropertiesWithDomain(this.uri);
    
        for (const aProperty of properties) {
          let prop = new OWLSpecificationProperty(aProperty, this.provider, this.store, this.lang);
          var classesInRange = prop.getRange();
    
          if (classesInRange.indexOf(range) > -1) {
            this._pushIfNotExist(aProperty, items);
          } else {
            // potentially the select rangeClassId is a subClass, let's look up
            for (const aClass of classesInRange) {
              // TODO : recursivity
              var subClasses = this.#_readImmediateSubClasses(aClass);
              if (subClasses.indexOf(range) > -1) {
                this._pushIfNotExist(aProperty, items);
              }
            }
          }
        }
    
        items = this.provider._sort(items);
    
        return items;
    }

    isLiteralEntity(): boolean {
        return (
        this.store.getQuads(
            factory.namedNode(this.uri),
            RDFS.SUBCLASS_OF,
            factory.namedNode(Config.RDFS_LITERAL),
            null
        ).length > 0
        );
    }

    isRemoteEntity(): boolean {
        return (
            this.store.getQuads(
              factory.namedNode(this.uri),
              RDFS.SUBCLASS_OF,
              factory.namedNode(Config.NOT_INSTANTIATED_CLASS),
              null
            ).length > 0
          );
    }

    getDefaultLabelProperty(): string | null {
        return this._readAsSingleResource(this.uri, Config.DEFAULT_LABEL_PROPERTY);
    }

    #_isSparnaturalClass(classUri: string) {
        return (
          this.store.getQuads(
            factory.namedNode(classUri),
            RDFS.SUBCLASS_OF,
            factory.namedNode(Config.SPARNATURAL_CLASS),
            null
          ).length > 0 ||
          this.store.getQuads(
            factory.namedNode(classUri),
            RDFS.SUBCLASS_OF,
            factory.namedNode(Config.NOT_INSTANTIATED_CLASS),
            null
          ).length > 0 ||
          this.store.getQuads(
            factory.namedNode(classUri),
            RDFS.SUBCLASS_OF,
            factory.namedNode(Config.RDFS_LITERAL),
            null
          ).length > 0
        );
      }

    #_readPropertiesWithDomain(classId: string) {
    var properties: any[] = [];

    const propertyQuads = this.store.getQuads(
      null,
      RDFS.DOMAIN,
      factory.namedNode(classId),
      null
    );

    for (const aQuad of propertyQuads) {
      // only select properties with proper Sparnatural configuration
      if (new OWLSpecificationProperty(aQuad.subject.id, this.provider, this.store, this.lang).getPropertyType()) {
        this._pushIfNotExist(aQuad.subject.id, properties);
      }
    }

    // read also the properties having as a domain a union containing this class
    var unionsContainingThisClass = this._readUnionsContaining(classId);

    for (const aUnionContainingThisClass of unionsContainingThisClass) {
      const propertyQuadsHavingUnionAsDomain =
        this.store.getQuads(
          null,
          RDFS.DOMAIN,
          aUnionContainingThisClass,
          null
        );

      for (const aQuad of propertyQuadsHavingUnionAsDomain) {
        // only select properties with proper Sparnatural configuration
        if (new OWLSpecificationProperty(aQuad.subject.id, this.provider, this.store, this.lang).getPropertyType()) {
          this._pushIfNotExist(aQuad.subject.id, properties);
        }
      }
    }

    // read also the properties having as a domain a super-class of this class
    var superClassesOfThisClass = this.#_readImmediateSuperClasses(classId);

    for (const anImmediateSuperClass of superClassesOfThisClass) {
      var propertiesFromSuperClass = this.#_readPropertiesWithDomain(
        anImmediateSuperClass
      );
      for (const aProperty of propertiesFromSuperClass) {
        this._pushIfNotExist(aProperty, properties);
      }
    }

    return properties;
  }

  #_readImmediateSuperClasses(classId: any) {
    var classes: any[] = [];

    const subClassQuads = this.store.getQuads(
      factory.namedNode(classId),
      RDFS.SUBCLASS_OF,
      null,
      null
    );

    for (const aQuad of subClassQuads) {
      this._pushIfNotExist(aQuad.object.id, classes);
    }

    return classes;
  }

  #_readImmediateSubClasses(classId: any) {
    var classes: any[] = [];

    const subClassQuads = this.store.getQuads(
      null,
      RDFS.SUBCLASS_OF,
      factory.namedNode(classId),
      null
    );

    for (const aQuad of subClassQuads) {
      this._pushIfNotExist(aQuad.subject.id, classes);
    }

    return classes;
  }

    /*** Handling of UNION classes ***/
    
      _isInUnion(classUri: any) {
        return (
          this.store.getQuads(
            null,
            RDF.FIRST,
            classUri,
            null
          ).length > 0
        );
      }
  
    
      _readUnionsContaining(classId: any) {
        var unions = Array<any>();
    
        var listsContainingThisClass = this.store
          .getQuads(null, RDF.FIRST, factory.namedNode(classId), null)
          .map((quad: { subject: any }) => quad.subject);
    
        for (const aListContainingThisClass of listsContainingThisClass) {
          var rootList = this._readRootList(aListContainingThisClass);
    
          // now read the union pointing to this list
          var unionPointingToThisList = this.store
            .getQuads(null, OWL.UNION_OF, rootList, null)
            .map((quad: { subject: any }) => quad.subject);
    
          if (unionPointingToThisList.length > 0) {
            unions.push(unionPointingToThisList[0]);
          }
        }
    
        return unions;
      }
    
}