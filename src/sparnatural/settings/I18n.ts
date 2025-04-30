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
}
