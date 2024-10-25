/*export class SparnaturalFormI18n {
  static i18nLabelsResources: any = {
    // "en":
    // "fr":
  };

  public static labels: any;

  private constructor() {}

  static init(lang: any) {
    SparnaturalFormI18n.labels = SparnaturalFormI18n.i18nLabelsResources[lang];
  }
}
*/
export class SparnaturalFormI18n {
  public static labels: any = {};

  private constructor() {}

  // Méthode init qui prend la langue et formConfig
  static init(lang: string, formConfig: any) {
    formConfig.bindings.forEach((binding: any) => {
      const variable = binding.variable;
      console.log(lang);
      SparnaturalFormI18n.labels[variable] = binding.node.name[lang];
    });
  }

  // Méthode pour obtenir le label en fonction de la variable
  static getLabel(variable: string): string {
    return SparnaturalFormI18n.labels[variable] || variable;
  }
}
