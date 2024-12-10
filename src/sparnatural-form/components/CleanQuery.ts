import { Branch, ISparJson } from "../../sparnatural/generators/json/ISparJson";
import { SparnaturalFormAttributes } from "../../SparnaturalFormAttributes";
import { Binding, Form } from "../FormStructure";

/**
 * @param query : the query to clean
 * from query to use remove the branchs with o that exist on the form varibales
 * the condition is that the o haven't any values, not exist in query.variables and it's optional or his father is optional
 * @returns the cleaned query
 */

class CleanQuery {
  private query: ISparJson;
  private formConfig:Form;
  private variablesUsedInFormConfig: string[];

  constructor(query: ISparJson, formAttributes: SparnaturalFormAttributes) {
    this.query = query;
    // init the form variables
    // TODO : should not be here
    this.formConfig = this.loadFormConfig(formAttributes.form); // Charger la configuration depuis les attributs
    this.variablesUsedInFormConfig = this.getFormVariables(this.formConfig);    
  }

  private loadFormConfig(formUrl: string): Form {
    let config: Form = null;
    $.ajax({
      url: formUrl,
      dataType: "json",
      async: false,
      success: (data) => {
        config = data;
      },
      error: (error) => {
        console.error("Erreur lors du chargement de form.json:", error);
      },
    });
    return config;
  }

  // Obtenir les form variables à partir de formConfig
  getFormVariables(form:Form): string[] {
    return form.bindings.map((binding: Binding) => binding.variable);
  }

  //metthods to clean the querytouse
  cleanQueryToUse(): ISparJson {

    // deep copy of the initial query
    let cleanQueryResult:ISparJson = JSON.parse(JSON.stringify(this.query));

    // remove selected variables if onscreen display
    // we remove variables from the SELECT clause
    // further cleaning steps will remove the corresponding criteria from the WHERE clause if they are optional,
    // and they have no value, and they are no more in the SELECT clause
    cleanQueryResult = this.removeUnusedVariablesFromSelect(cleanQueryResult, "onscreen");

    // re-list the variables used in the result set, after the previous filtering step
    let variablesUsedInResultSet:string[] = this.getVariablesUsedInResultSet(cleanQueryResult);

    // clean the branches (= the WHERE clause)
    cleanQueryResult.branches = this.cleanBranches(
      cleanQueryResult.branches,
      variablesUsedInResultSet
    );
    console.log("CleanQuery: Query cleaned:", cleanQueryResult);
    return cleanQueryResult;
  }

  private cleanBranches(branches: Branch[], variablesUsedInResultSet:string[]) : Branch[] {
    return branches
        .filter((branch) => {
          const variable = branch.line?.o;
          const hasValues = branch.line?.values?.length > 0;
          const isOptional = branch.optional || false;
          const parentOptional = this.isParentOptional(branch.line?.o);

          // Vérifier si la variable existe dans `queryVariables`
          const existsInQueryVariables = variablesUsedInResultSet.includes(variable);

          //remove the branches with o that exist on the form varibales which haven't any values not exist in query.variables and it's optional or his father is optional focus on formVariables and don't touch the other branches
          // Supprimer les branches selon les conditions
          const shouldRemove =
            // this.variablesUsedInFormConfig.includes(variable) && // La variable est dans les form variables
            !existsInQueryVariables && // La variable n'existe pas dans les variables de la requête
            !hasValues && // Aucune valeur pour cette branche
            (isOptional || parentOptional); // La branche ou son parent est optionnel
          console.log("shouldRemove", variable, shouldRemove);
          return !shouldRemove;
        })
        .map((branch) => ({
          ...branch,
          children: this.cleanBranches(branch.children || [], variablesUsedInResultSet), // Nettoyer récursivement les enfants
        }));
  }

  /**
   * @return the array of all queries that are used in the query result, either directly or as aggregated variables
   */
  private getVariablesUsedInResultSet(theQuery:ISparJson):string[] {
    return Array.isArray(theQuery.variables)
      // either this is a simple variable, or this is an aggregated variable
      ? theQuery.variables.map((v) => ("value" in v ? v.value : v.expression.expression.value))
      : [];
  }

  // Vérifier si le parent d'une branche est optionnel
  private isParentOptional(childVariable: string): boolean {
    const findParent = (branches: Branch[], target: string): Branch => {
      for (const branch of branches) {
        if (
          branch.children?.some((child: Branch) => child.line?.o === target)
        ) {
          return branch;
        }
        if (branch.children) {
          const result = findParent(branch.children, target);
          if (result) return result;
        }
      }
      return null;
    };

    const parent = findParent(this.query.branches, childVariable);
    return parent?.optional || false;
  }

  /**
   * 
   * @param query The query from which to remove the selected variables
   * @param resultType The type of expected result. Depending on the type of result, only some columns are kept in the result set
   * @returns 
   */
  private removeUnusedVariablesFromSelect(query: ISparJson, resultType:"onscreen"|"export"):ISparJson {
    if(resultType == "onscreen") {
      query.variables = query.variables.filter(v => {
        // retain only the columns that are useful for an onscreen display
        // the list of columns for onscreen display is a section in the form config
        let varName = ("value" in v ? v.value : v.expression.expression.value);
        return !this.formConfig.variables?.onscreen || this.formConfig.variables?.onscreen?.includes(varName)
      });

      return query;
    }
  }

}
export default CleanQuery;
