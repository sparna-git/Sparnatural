export function eventProxiCriteria(e: { data: { arg1: any; arg2: any } }) {
  var arg1 = e.data.arg1;
  var arg2 = e.data.arg2;
  arg1[arg2](e);
}

export function localName(uri: string) {
  if (uri.indexOf("#") > -1) {
    return uri.split("#")[1];
  } else {
    var components = uri.split("/");
    return components[components.length - 1];
  }
}

export function redrawBottomLink(parentElementLi: JQuery<HTMLElement>) {
  var ul = $(parentElementLi).children("ul").first();
  if (ul.length == 1) {
    let n_width: any =
      getOffset(
        $(parentElementLi).find(">div>.EndClassGroup"),
        $(ul) as JQuery<HTMLUListElement>
      ) -
      111 +
      15 +
      11 +
      20 +
      5 +
      3;

    var t_width =
      getOffset(
        $(parentElementLi).find(">div>.EndClassGroup"),
        $(ul) as JQuery<HTMLUListElement>
      ) +
      15 +
      11 +
      20 +
      5;
    $(ul).find(">.lien-top").css("width", n_width);
    $(parentElementLi).find(">.link-where-bottom").css("left", t_width);
  }
}

function getOffset(elem: JQuery<HTMLElement>, elemParent: JQuery<HTMLElement>) {
  return $(elem.html).offset().left - $(elemParent.html).offset().left;
}
