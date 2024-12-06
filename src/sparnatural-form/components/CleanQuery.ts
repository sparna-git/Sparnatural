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
  private cleanQueryResult: ISparJson;
  private formConfig: Form;

  constructor(query: ISparJson, formAttributes: SparnaturalFormAttributes) {
    this.query = query;
    this.cleanQueryResult = JSON.parse(JSON.stringify(query)); // Copie profonde de la requête
    this.formConfig = this.loadFormConfig(formAttributes.form); // Charger la configuration depuis les attributs
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
  getFormVariables(): string[] {
    if (!this.formConfig || !this.formConfig.bindings) {
      console.error("formConfig ou ses bindings sont introuvables.");
      return [];
    }
    return this.formConfig.bindings.map((binding: Binding) => binding.variable);
  }

  //metthods to clean the querytouse
  cleanQueryToUse(): ISparJson {
    const formVariables = this.getFormVariables();

    // Vérifier et extraire les variables de la requête
    const queryVariables = Array.isArray(this.query.variables)
      ? this.query.variables.map((v) => ("value" in v ? v.value : null))
      : [];

    console.log("Form variables:", formVariables);
    console.log("Query variables:", queryVariables);

    const cleanBranches = (branches: Branch[]): Branch[] => {
      return branches
        .filter((branch) => {
          const variable = branch.line?.o;
          const hasValues = branch.line?.values?.length > 0;
          const isOptional = branch.optional || false;
          const parentOptional = this.isParentOptional(branch.line?.o);

          // Vérifier si la variable existe dans `queryVariables`
          const existsInQueryVariables = queryVariables.includes(variable);

          //remove the branches with o that exist on the form varibales which haven't any values not exist in query.variables and it's optional or his father is optional focus on formVariables and don't touch the other branches
          // Supprimer les branches selon les conditions
          const shouldRemove =
            formVariables.includes(variable) && // La variable est dans les form variables
            !existsInQueryVariables && // La variable n'existe pas dans les variables de la requête
            !hasValues && // Aucune valeur pour cette branche
            (isOptional || parentOptional); // La branche ou son parent est optionnel
          console.log("shouldRemove", variable, shouldRemove);
          return !shouldRemove;
        })
        .map((branch) => ({
          ...branch,
          children: cleanBranches(branch.children || []), // Nettoyer récursivement les enfants
        }));
    };

    this.cleanQueryResult.branches = cleanBranches(
      this.cleanQueryResult.branches
    );
    console.log("CleanQuery: Query cleaned:", this.cleanQueryResult);
    return this.cleanQueryResult;
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
}
export default CleanQuery;
