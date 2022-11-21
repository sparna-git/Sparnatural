/*
    The Factory decides which html tag a certain component gets. 
    Default value is <div class='[cssBaseClase]'></div>
    If you would like to register new htmlbaseclasses, do it here
    Here you can also register imported custom HTMLElements
*/
class BaseClassFactory {
  liTags: Array<string> = ["groupe"];
  ulTags: Array<string> = ["componentsListe", "childsList"];
  spanTags: Array<string> = [
    "link-where-bottom",
    "selectViewVariable",
    "unselect",
    "circle-info",
    "loadingspinner"
  ];
  aTags: Array<string> = ["asc", "dsc", "none", "playBtn"];
  labelTags: Array<string> = ["switch"];

  constructor() {}

  getBaseClass(baseCssClass: string) {
    if (!baseCssClass)
      throw Error("No baseCssClass found when rendering element!");
    let findCallBack = (el: string) => {
      if (el == baseCssClass) return true;
    };
    let html: JQuery<HTMLElement>;
    switch (baseCssClass) {
      case this.liTags.find(findCallBack):
        html = $(`<li class="${baseCssClass}"></li>`);
        break;
      case this.ulTags.find(findCallBack):
        html = $(`<ul class="${baseCssClass}"></ul>`);
        break;
      case this.spanTags.find(findCallBack):
        html = $(`<span class="${baseCssClass}"></span>`);
        break;
      case this.labelTags.find(findCallBack):
        html = $(`<label class="${baseCssClass}"></label>`);
        break;
      case this.aTags.find(findCallBack):
        html = $(`<a class="${baseCssClass}"></a>`);
        break;
      default:
        html = $(`<div class="${baseCssClass}"></div>`);
    }
    return html;
  }
}
export default BaseClassFactory;
