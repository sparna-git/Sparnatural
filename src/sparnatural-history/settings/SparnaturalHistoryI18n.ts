// will using the same class I18 or a new class I18History and same thing for labels on assests lang ?

export class SparnaturalHistoryI18n {
  static i18nLabelsResources: any = {
    en: require("../../assets/lang/en-Hist.json"),
    fr: require("../../assets/lang/fr-Hist.json"),
  };

  public static labels: any;

  private constructor() {}

  static init(lang: any) {
    SparnaturalHistoryI18n.labels =
      SparnaturalHistoryI18n.i18nLabelsResources[lang];
  }
}
