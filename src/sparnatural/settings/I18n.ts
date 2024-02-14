


export class I18n {

    static i18nLabelsResources:any = {
        "en": require("../../assets/lang/en.json"),
        "fr": require("../../assets/lang/fr.json")
    };

    public static labels:any;

    private constructor() {}

    static init(lang:any) {
        I18n.labels = I18n.i18nLabelsResources[lang];
    }

}