import enLabels from "../lang/en.json";
import frLabels from "../lang/fr.json";

export class I18n {
  static i18nLabelsResources: any = {
    en: enLabels,
    fr: frLabels,
  };

  public static labels: any;

  private constructor() {}

  static init(lang: any) {
    I18n.labels = I18n.i18nLabelsResources[lang];
  }

  // fills the {name} parts of a label, e.g. "Ligne {n} ajoutée"
  static format(key: string, params: { [name: string]: string | number }): string {
    let label: string = I18n.labels[key];
    Object.keys(params).forEach((name) => {
      label = label.replace(`{${name}}`, String(params[name]));
    });
    return label;
  }
}
