import { DASH, Model, NodeShape, PropertyShape } from "rdf-shacl-commons";
import { VariableExpression, VariableTerm } from "../../../SparnaturalQueryIfc";
import {
  ObjectCriteria,
  PatternBgpSameSubject,
  PatternBind,
  PredicateObjectPair,
  SelectVariable,
  SparnaturalQuery,
  TermTypedVariable,
  TermVariable,
} from "../../../SparnaturalQueryIfc-v13";
import { ISparnaturalSpecification } from "../../../spec-providers/ISparnaturalSpecification";
import { SHACLSpecificationProperty } from "../../../spec-providers/shacl/SHACLSpecificationProperty";
import { SHACLSpecificationEntity } from "../../../spec-providers/shacl/SHACLSpecificationEntity";
import { DataFactory } from "rdf-data-factory";

const factory = new DataFactory();

export type SparnaturalQueryVisitor = {
  query?: (query: SparnaturalQuery) => void;
  bgpSameSubject?: (bgpSameSubject: PatternBgpSameSubject) => void;
  subject?: (subject: TermTypedVariable) => void;
  predicateObjectPair?: (pair: PredicateObjectPair) => void;
  objectCriteria?: (obj: ObjectCriteria) => void;
  variable?: (v: SelectVariable) => void;
};

export class SparnaturalQueryTraversal {

  static traverse(query: SparnaturalQuery, visitor: SparnaturalQueryVisitor) {    
    if (!query) return;

    if(visitor.query) visitor.query(query);

    if (visitor.variable && query.variables) {
      query.variables.forEach(visitor.variable);
    }

    if (!query.where) return;

    const where = query.where;

    if (visitor.bgpSameSubject && where) {
      visitor.bgpSameSubject(where)
    }

    if (visitor.subject && where.subject) {
      visitor.subject(where.subject);
    }

    const walkPair = (pair: PredicateObjectPair) => {
      if (!pair) return;
      if (visitor.predicateObjectPair) visitor.predicateObjectPair(pair);

      const obj = pair.object;
      if (obj && visitor.objectCriteria) visitor.objectCriteria(obj);

      const children = obj?.predicateObjectPairs;
      if (children && Array.isArray(children)) {
        children.forEach(walkPair);
      }
    };

    const pairs = where.predicateObjectPairs;
    if (pairs && Array.isArray(pairs)) {
      pairs.forEach(walkPair);
    }
  }
  
}

export class SparnaturalQueryUtils {

  static getVariableName(variable:SelectVariable):string {
    var varName;
    if((variable as any)["expression"]) {
      varName = (variable as PatternBind).expression.expression[0].value;
    } else {
      varName = (variable as TermVariable).value;
    }
    return varName;
  }

  static insertSelectVariable(query: SparnaturalQuery, newVariable: SelectVariable) {
    // 1. Get the newVariable name
    var newVarName = this.getVariableName(newVariable);

    // iterate through all variables in the query
    // if we find a variable name that starts with the newVariable name,
    // then insert the newVariable right after this one
    let found:boolean = false;
    for (var i = 0; i < query.variables.length; i++) {
      // extract name
      var currentVarName = this.getVariableName(query.variables[i]);

      if (newVarName.startsWith(currentVarName)) {
        // insert the new variable after this one
        query.variables.splice(i + 1, 0, newVariable);
        console.log("inserted after ",currentVarName);
        found = true;
        // don't forget, otherwise infinite loop
        break;
      }
    }

    // if no variable was found that starts with newVariable name, then insert it at the end
    if(!found) {
      // insert at the end
      console.log("inserted at the end ");
      query.variables.push(newVariable);
    }
  }

  /**
   * @param query The query to test
   * @param varName The variable to test the selection for
   * @returns true if the varName is selected in the query
   */
  static isVarSelected(query: SparnaturalQuery, varName: string): boolean {
    let result = SparnaturalQueryUtils.findSelectedVariableByName(query, varName) !== undefined;
    return result;
  }

  static findSelectedVariableByName(query: SparnaturalQuery, varName: string): SelectVariable | undefined {
    return (
      query.variables.find((v) => {
        // PatternBind (aggregate)
        if (v.type === "pattern" && v.subType === "bind") {
          if(v.expression.expression[0].value === varName) return true;        
        }
        // TermVariable
        return (
          v.type === "term" && v.subType === "variable" && v.value === varName
        );
      }) as SelectVariable
    );
  }

  static postProcessKeyInfo(query: SparnaturalQuery, specProvider: ISparnaturalSpecification) {
    let processor:AdditionalInfoProcessor = new AdditionalInfoProcessor(DASH.KEY_INFO_ROLE.value, specProvider);

    SparnaturalQueryTraversal.traverse(query, processor);
  }

}

class AdditionalInfoProcessor implements SparnaturalQueryVisitor {
  
  specProvider: ISparnaturalSpecification;
  extraPropertyRole: string;
  fullQuery?: SparnaturalQuery;

  constructor(extraPropertyRole:string, specProvider : ISparnaturalSpecification) {
    this.extraPropertyRole = extraPropertyRole;
    this.specProvider = specProvider;
  }

  query(query:SparnaturalQuery):void {
    this.fullQuery = query;
  }

  bgpSameSubject(bgpSameSubject:PatternBgpSameSubject):void {
    let extraPropertyRoles = this.findWithOfVariable(bgpSameSubject.subject.value);
    extraPropertyRoles.forEach((extraPropertyRole) => {
      // retrieve the properties with the given role
      let properties = this.getExtraPropertyRoles(bgpSameSubject.subject.rdfType);
      properties.forEach((property) => {
        let branchAndVar = this.#buildVirtualBranchAndSelectedVarForProperty(bgpSameSubject.subject.value, property); 
        console.log("bgpSamSubject")
        // add the variable in the select
        SparnaturalQueryUtils.insertSelectVariable(this.fullQuery!, branchAndVar.variable);

        // add the property as a sibling
        bgpSameSubject.predicateObjectPairs.push(branchAndVar.branch);
      });
    });    
  };

  objectCriteria(obj: ObjectCriteria):void {
    let extraPropertyRoles = this.findWithOfVariable(obj.variable.value);
    extraPropertyRoles.forEach((extraPropertyRole) => {
      // retrieve the properties with the given role
      let properties = this.getExtraPropertyRoles(obj.variable.rdfType);
      properties.forEach((property) => {
        let branchAndVar = this.#buildVirtualBranchAndSelectedVarForProperty(obj.variable.value, property); 

        // add the variable in the select
        SparnaturalQueryUtils.insertSelectVariable(this.fullQuery!, branchAndVar.variable);

        // add the property as a sibling
        if(!obj.predicateObjectPairs) obj.predicateObjectPairs = [];

        obj.predicateObjectPairs.push(branchAndVar.branch);
      });
    });
  };

  getExtraPropertyRoles(type:string): PropertyShape[] {
    let e = this.specProvider.getEntity(type);
    if(!(e instanceof SHACLSpecificationEntity)) return [];
    let entity = e as SHACLSpecificationEntity;
    return (entity.shape as NodeShape).findPropertyShapesByDashPropertyRole(factory.namedNode(this.extraPropertyRole));
  }

  findWithOfVariable(varName: string): string[] {
    let selectVar:SelectVariable | undefined = SparnaturalQueryUtils.findSelectedVariableByName(this.fullQuery!, varName);
    if(selectVar && selectVar.with) {
      return selectVar.with.map((t) => t.value);
    }
    return [];
  }

  #buildVirtualBranchAndSelectedVarForProperty(currentVariableName: string, property: PropertyShape)
  : { branch: PredicateObjectPair, variable: SelectVariable } {

    // generate a new variable name. Ideal is to use the range name, just as in Sparnatural
    // but we default to other options if we cannot
    let variableName;
    /*
    if(property.getRangeShapes().length == 1) {
      // single range, use the type of the range shape for the variable
      variableName = this.#translator.generateNewVariableName(property.getRangeShapes()[0].resource.value);
    } else 
    */
      
    if(property.getShPath().termType == "NamedNode") {
      // multiple ranges, but a simple property path, use the property name for the variable
      variableName = currentVariableName + "_" + Model.getSparqlVariableNameFromUri(property.getShPath().value);
    } else {
      variableName = currentVariableName + "_" + Model.getSparqlVariableNameFromUri(property.resource.value);
    }

    // either there is a single range and we use it, but we cannot set it if there are multiple ranges
    let range = property.getRangeShapes().length > 0 ? property.getRangeShapes()[0].resource.value : undefined;
    
    let variableTerm: TermTypedVariable = {
      type: "term",
      subType: "variable",
      value: variableName,
      rdfType: range
    };

    // 1. Build base virtual criteria
    let pair:PredicateObjectPair = {
      type: "predicateObjectPair",
      predicate: {
        type: "term",
        subType: "namedNode",
        value: property.resource.value
      },
      object: {
        type: "objectCriteria",
        variable: variableTerm,
      }
    };

    // 2. set subType to "optional" if the property is not mandatory according to SHACL shapes
    let specProperty = this.specProvider.getProperty(property.resource.value) as SHACLSpecificationProperty;
    if(
      specProperty
      && (
        // either no sh:minCount is defined, or sh:minCount is 0
        !(specProperty.shape as PropertyShape).getShMinCount()
        ||
        (specProperty.shape as PropertyShape).getShMinCount() === 0) 
    ) {
      pair.subType = "optional";
    }

    // 3. aggregate the variable if the property can be repeated according to SHACL shapes (maxCount > 1 or qualifiedMaxCount > 1 or no maxCount at all)
    var finalSelectedVar: SelectVariable = {
      type: "term",
      subType: "variable",
      value: variableName
    }

    if(
      specProperty
      && (
        // sh:maxCount is anything but 1
        (specProperty.shape as PropertyShape).getShMaxCount() !== 1
        ||
        // sh:qualifiedMaxCount is anything but 1
        (specProperty.shape as PropertyShape).getShQualifiedMaxCount() !== 1
      )
    ) {
      finalSelectedVar = {
        type: "pattern",
        subType: "bind",
        expression: {
          type: "expression",
          subType: "aggregate",
          distinct: true,
          aggregation: "GROUP_CONCAT",
          expression: [
            {
              type: "term",
              subType: "variable",
              value: variableName
            }
          ]
        },
        variable: {
          type: "term",
          subType: "variable",
          value: variableName+"_concat"
        }
      }
    }
    
    return {
      branch: pair,
      variable: finalSelectedVar
    }

  }
}
