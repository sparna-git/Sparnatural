import { RDFTerm } from "../../SparnaturalQueryIfc";

// Small link to the URI of an item, rendered next to its label so that the resource
// can be opened without selecting the item. A template can also write its own
// <a class="item-link"> : the click handling below applies to both.

// list and autocomplete : a real link, so middle click and "open in new tab" work
export function uriLinkHtml(term: RDFTerm): string {
  if (term?.type !== "uri") return "";
  let uri = escapeHtml(term.value);
  return ` <a class="item-link" href="${uri}" target="_blank" rel="noopener" title="${uri}"></a>`;
}

// jstree renders the item inside its own <a>, and an <a> nested in an <a> is invalid
// HTML : the parser would pull the link out of the node. A span opened by script instead.
export function uriLinkHtmlNoAnchor(term: RDFTerm): string {
  if (term?.type !== "uri") return "";
  let uri = escapeHtml(term.value);
  return ` <span class="item-link" role="link" tabindex="-1" data-href="${uri}" title="${uri}"></span>`;
}

/**
 * Stops the events the widgets select on, but only on a link : select2 selects on
 * mouseup, awesomplete and jstree on click. The browser is then free to follow the
 * link while the widget never sees the click.
 * @param element the item, or the widget container when items are rendered as HTML
 * @param capture true to run before a handler the widget bound on that same container
 */
export function keepLinksClickable(element: HTMLElement, capture: boolean = false) {
  element.addEventListener(
    "mouseup",
    (event: Event) => {
      if (linkIn(event, element)) event.stopPropagation();
    },
    capture
  );
  element.addEventListener(
    "click",
    (event: Event) => {
      let link = linkIn(event, element);
      if (!link) return;
      event.stopPropagation();
      // the span flavour has no navigation of its own
      let href = link.getAttribute("data-href");
      if (href) {
        event.preventDefault();
        window.open(href, "_blank", "noopener");
      }
    },
    capture
  );
}

// jstree wraps every node in its own <a class="jstree-anchor" href="#">, and we bind
// on the tree container : without the :not() any click on a node would look like a
// link click and the node would stop being selectable.
const LINK_SELECTOR = "a[href]:not(.jstree-anchor), [data-href]";

// closest() walks past the element, so a link of the widget itself is not ours
function linkIn(event: Event, element: HTMLElement): HTMLElement | null {
  let link = (event.target as HTMLElement)?.closest?.(
    LINK_SELECTOR
  ) as HTMLElement;
  return link && element.contains(link) ? link : null;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
