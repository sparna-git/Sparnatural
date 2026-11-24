import { SparqlHandlerFactory } from "rdf-shacl-commons";
import CriteriaGroup from "./CriteriaGroup";
import { OptionTypes } from "./optionsgroup/OptionsGroup";
import SparnaturalComponent from "../../../SparnaturalComponent";
import { SparnaturalJsonGeneratorV13 } from "../../../../generators/json/SparnaturalJson-v13Generator";
import { AskQueryBuilder } from "../../../../generators/sparql/AskQueryBuilder";
import { getSettings } from "../../../../settings/defaultSettings";
import { Config } from "../../../../ontologies/SparnaturalConfig";

import { PredicateObjectPair } from "../../../../SparnaturalQueryIfc-v13";

/**
 * #809 : before a line shows its widget, asks the endpoint if the whole query, this line
 * included, has at least one result. If not, a red light "No results" replaces the widget.
 * Every line waiting for its value is checked again at each query change, whatever its widget.
 */

// #816 : below this number of possible values, an autocomplete becomes a list
const MAX_LIST_VALUES = 500;

// what the endpoint says about the line. count : only when a COUNT was sent
type Answer = { hasResult: boolean; count?: number };

export class PossibleValuesCheck {
  // answers by ASK query. Every waiting line asks the same question, the whole query : kept
  // as promises, so that it is sent only once.
  static #answers = new Map<string, Promise<Answer>>();

  #line: CriteriaGroup;
  #state: "checking" | "none" | null = null;
  // last ASK of this line : the same one is not asked twice, an answer to an older one is ignored
  #lastAsk: string = null;
  #queryListener: () => void = null;
  // builds the widget of the line, given by start()
  #renderWidget: (forcedWidgetType?: string) => void = null;

  constructor(line: CriteriaGroup) {
    this.#line = line;
  }

  // called when the property of the line is selected. Without facetedBrowsing, the widget is
  // built right away, as before
  start(renderWidget: (forcedWidgetType?: string) => void) {
    this.#renderWidget = renderWidget;
    if (!getSettings().facetedBrowsing) {
      renderWidget();
      return;
    }
    this.#check(true);
    this.#listenToQueryChanges();
  }

  // neither a value, nor "Any", nor a WHERE : its widget is shown, or would be. Only called
  // after start(), the property of the line is known
  #isWaitingForValue(): boolean {
    const line = this.#line;
    return (
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
      this.#apply({ hasResult: true });
      return;
    }
    // already asked : its answer is shown or on its way
    if (!withSpinner && ask === this.#lastAsk) return;
    this.#lastAsk = ask;
    if (withSpinner) this.#setState("checking");

    this.#ask(ask).then((answer) => {
      // the query changed meanwhile, or the line got its value : the answer is no longer needed
      if (ask === this.#lastAsk && this.#isWaitingForValue())
        this.#apply(answer);
    });
  }

  // #817 : the number of lines of the query, those under a WHERE included
  static #countLines(pairs: PredicateObjectPair[] = []): number {
    let count = 0;
    for (const pair of pairs) {
      count +=
        1 + PossibleValuesCheck.#countLines(pair.object?.predicateObjectPairs);
    }
    return count;
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
      option === OptionTypes.NOTEXISTS
    ) {
      return null;
    }

    try {
      const jsonQuery = new SparnaturalJsonGeneratorV13(
        sparnatural,
      ).generateQuery(false, 0);
      // #817 : a line alone, nothing else can restrict its values
      if (
        PossibleValuesCheck.#countLines(
          jsonQuery.where?.predicateObjectPairs,
        ) <= 1
      )
        return null;

      const builder = new AskQueryBuilder(line.specProvider, settings);
      const ask = this.#canBecomeList()
        ? builder.buildCount(jsonQuery, line.endClassGroup.endClassVal.variable)
        : builder.build(jsonQuery);
      return line.specProvider.expandSparql(ask, settings.sparqlPrefixes);
    } catch (err) {
      console.warn("[#809] could not build the ASK query", err);
      return null;
    }
  }

  // true when the query has at least one result
  #ask(ask: string): Promise<Answer> {
    const settings = getSettings();
    // the same query on other endpoints is another question, all of them count
    const key = settings.endpoints.join(" ") + "\n" + ask;
    let answer = PossibleValuesCheck.#answers.get(key);
    if (answer) return answer;

    if (settings.debug) console.log("[#809] ASK query :\n" + ask);
    answer = new Promise<Answer>((resolve) => {
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
            // a COUNT answers with one ?count, an ASK with a boolean
            const count = data?.results?.bindings?.[0]?.count?.value;
            if (count !== undefined) {
              if (settings.debug) console.log("[#816] COUNT answer :", count);
              resolve({ hasResult: Number(count) > 0, count: Number(count) });
              return;
            }
            if (settings.debug)
              console.log("[#809] ASK answer :", data?.boolean);
            // only an explicit false means no result
            resolve({ hasResult: data?.boolean !== false });
          },
          (error: any) => {
            // a failing endpoint must never bring a wrong red light, it is asked again next time
            console.warn("[#809] ASK query failed, widget shown anyway", error);
            PossibleValuesCheck.#answers.delete(key);
            resolve({ hasResult: true });
          },
        );
    });
    PossibleValuesCheck.#answers.set(key, answer);
    return answer;
  }

  #apply(answer: Answer) {
    const wasRed = this.#state === "none";
    if (answer.hasResult) {
      const editComponents = this.#line.endClassGroup.editComponents;
      // first green answer : the widget, and its datasource query, only start now
      if (!editComponents) this.#renderWidget(this.#widgetTypeFor(answer));
      // back from a red light : load it again with the current query
      else if (wasRed) editComponents.render();
    }

    const state = answer.hasResult ? null : "none";
    // nothing to redraw when the answer confirms what is shown
    if (state !== this.#state) this.#setState(state);
  }

  // #816 : few possible values, the autocomplete is shown as a list. Undefined : the configured widget
  #widgetTypeFor(answer: Answer): string {
    if (answer.count !== undefined && answer.count < MAX_LIST_VALUES)
      return Config.LIST_PROPERTY;
    return undefined;
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

  // #816 : an autocomplete whose values have a label (LabelRole). Only before its widget
  // is built, the type does not change afterwards
  #canBecomeList(): boolean {
    const line = this.#line;
    if (line.endClassGroup.editComponents) return false;
    const endClass = line.endClassGroup.endClassVal.type;
    const widgetType = line.specProvider
      .getProperty(line.objectPropertyGroup.objectPropVal.type)
      .getPropertyType(endClass);
    return (
      widgetType === Config.AUTOCOMPLETE_PROPERTY &&
      !!line.specProvider.getEntity(endClass).getDefaultLabelProperty()
    );
  }
}
