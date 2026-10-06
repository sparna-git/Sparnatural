import { SparqlHandlerFactory } from "rdf-shacl-commons";
import CriteriaGroup from "./CriteriaGroup";
import { OptionTypes } from "./optionsgroup/OptionsGroup";
import SparnaturalComponent from "../../../SparnaturalComponent";
import { SparnaturalJsonGeneratorV13 } from "../../../../generators/json/SparnaturalJson-v13Generator";
import { AskQueryBuilder } from "../../../../generators/sparql/AskQueryBuilder";
import { getSettings } from "../../../../settings/defaultSettings";

/**
 * #809 : before a line shows its widget, asks the endpoint if the whole query, this line
 * included, has at least one result. If not, a red light "No results" replaces the widget.
 * Every line waiting for its value is checked again at each query change, whatever its widget.
 */
export class PossibleValuesCheck {
  // answers by ASK query. Every waiting line asks the same question, the whole query : kept
  // as promises, so that it is sent only once.
  static #answers = new Map<string, Promise<boolean>>();

  #line: CriteriaGroup;
  #state: "checking" | "none" | null = null;
  // last ASK of this line : the same one is not asked twice, an answer to an older one is ignored
  #lastAsk: string = null;
  #queryListener: () => void = null;

  constructor(line: CriteriaGroup) {
    this.#line = line;
  }

  // called when the property of the line is selected. Only with facetedBrowsing on : without it,
  // Sparnatural behaves exactly as before
  start() {
    if (!getSettings().facetedBrowsing) return;
    this.#check(true);
    this.#listenToQueryChanges();
  }

  // a line with its property, and neither a value, nor "Any", nor a WHERE : its widget is
  // shown, or would be
  #isWaitingForValue(): boolean {
    const line = this.#line;
    return (
      !!line.endClassGroup?.editComponents &&
      !line.parentGroupWrapper.whereChild &&
      !(line.endClassWidgetGroup?.widgetValues?.length > 0) &&
      !line.endClassWidgetGroup?.isSelectAll
    );
  }

  // a change anywhere in the query can close this line, or open it again
  #listenToQueryChanges() {
    if (this.#queryListener) return;
    // kept so that the listener can remove itself from the very same element
    const root = this.#line.getRootComponent().html[0];

    this.#queryListener = () => {
      // the line was removed, nothing left to check
      if (!this.#line.html[0].isConnected) {
        root.removeEventListener("queryUpdated", this.#queryListener);
        return;
      }
      if (this.#isWaitingForValue()) this.#check(false);
    };

    root.addEventListener("queryUpdated", this.#queryListener);
  }

  // with spinner, the widget is hidden until the answer. Without, the display only changes
  // with the answer.
  #check(withSpinner: boolean) {
    const ask = this.#buildAsk();
    // nothing to check : the widget is shown
    if (!ask) {
      this.#lastAsk = null;
      this.#apply(true);
      return;
    }
    // already asked : its answer is shown or on its way
    if (!withSpinner && ask === this.#lastAsk) return;
    this.#lastAsk = ask;
    if (withSpinner) this.#setState("checking");

    this.#ask(ask).then((hasResult) => {
      // the query changed meanwhile, or the line got its value : the answer is no longer needed
      if (ask === this.#lastAsk && this.#isWaitingForValue())
        this.#apply(hasResult);
    });
  }

  // the ASK of the whole query, as it is on screen. Null when this line is not to be checked.
  #buildAsk(): string {
    const line = this.#line;
    const sparnatural = line.getRootComponent() as SparnaturalComponent;
    const settings = getSettings();
    const option = line.parentGroupWrapper.currentOptionState;
    if (
      // not while a query is loaded, the loader needs the widget right away
      sparnatural.actionStore?.quiet ||
      // no result is expected in a NOT EXISTS, and irrelevant in an OPTIONAL
      option === OptionTypes.OPTIONAL ||
      option === OptionTypes.NOTEXISTS ||
      // the multiple endpoints handler cannot merge ASK answers
      settings.endpoints?.length !== 1
    ) {
      return null;
    }

    try {
      const jsonQuery = new SparnaturalJsonGeneratorV13(
        sparnatural,
      ).generateQuery(false, 0);
      const ask = new AskQueryBuilder(line.specProvider, settings).build(
        jsonQuery,
      );
      return line.specProvider.expandSparql(ask, settings.sparqlPrefixes);
    } catch (err) {
      console.warn("[#809] could not build the ASK query", err);
      return null;
    }
  }

  // true when the query has at least one result
  #ask(ask: string): Promise<boolean> {
    const settings = getSettings();
    // the same query on another endpoint is another question
    const key = settings.endpoints[0] + "\n" + ask;
    let answer = PossibleValuesCheck.#answers.get(key);
    if (answer) return answer;

    if (settings.debug) console.log("[#809] ASK query :\n" + ask);
    answer = new Promise<boolean>((resolve) => {
      new SparqlHandlerFactory(
        settings.language,
        settings.localCacheDataTtl,
        settings.customization?.headers,
        settings.customization?.sparqlHandler,
        (this.#line.getRootComponent() as SparnaturalComponent).catalog,
      )
        .buildSparqlHandler(settings.endpoints)
        .executeSparql(
          ask,
          (data: any) => {
            if (settings.debug)
              console.log("[#809] ASK answer :", data?.boolean);
            // only an explicit false means no result
            resolve(data?.boolean !== false);
          },
          (error: any) => {
            // a failing endpoint must never bring a wrong red light, it is asked again next time
            console.warn("[#809] ASK query failed, widget shown anyway", error);
            PossibleValuesCheck.#answers.delete(key);
            resolve(true);
          },
        );
    });
    PossibleValuesCheck.#answers.set(key, answer);
    return answer;
  }

  #apply(hasResult: boolean) {
    const state = hasResult ? null : "none";
    const wasRed = this.#state === "none";
    // nothing to redraw when the answer confirms what is shown
    if (state === this.#state) return;

    this.#setState(state);
    // back from a red light : its widget was loaded with a query that had no result, load it
    // again with the current one
    if (wasRed) this.#line.endClassGroup.editComponents.render();
  }

  #setState(state: "checking" | "none" | null) {
    const line = this.#line;
    this.#state = state;
    line.html[0].classList.toggle("checking-values", state === "checking");
    line.html[0].classList.toggle("no-possible-value", state === "none");
    if (state) {
      line.endClassWidgetGroup.showStatusChip(state === "checking");
    } else {
      line.endClassWidgetGroup.hideStatusChip();
    }
    line.html[0].dispatchEvent(
      new CustomEvent("redrawBackgroundAndLinks", { bubbles: true }),
    );
    // a line with a red light will never get a value, which is what normally updates the
    // query : generate it now, so that it shows this line like the screen does
    if (state === "none") {
      line.html[0].dispatchEvent(
        new CustomEvent("generateQuery", { bubbles: true }),
      );
    }
  }
}
