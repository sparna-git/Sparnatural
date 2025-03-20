import { Binding, Form } from "../FormStructure";

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
  public static labels: Record<string, string> = {};
  public static helpMessages: Record<string, string> = {};

  private constructor() {}

  // Initialize labels and help messages
  static init(lang: string, formConfig: Form) {
    formConfig.bindings.forEach((binding: any) => {
      const variable = binding.variable;

      // Store the label
      SparnaturalFormI18n.labels[variable] =
        binding.node.name[lang] || variable;

      // Store the help message if it exists
      if (binding.node.help && binding.node.help[lang]) {
        // get the help message from config in right language
        SparnaturalFormI18n.helpMessages[variable] = binding.node.help[lang];
      }
    });
  }

  // Method to get the label for a variable
  static getLabel(variable: string): string {
    return SparnaturalFormI18n.labels[variable] || variable;
  }

  // Method to get the help message for a variable
  static getHelp(variable: string): string {
    return SparnaturalFormI18n.helpMessages[variable] || "";
  }
}
