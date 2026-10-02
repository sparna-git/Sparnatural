import { SparqlHandlerFactory } from "rdf-shacl-commons";
import CriteriaGroup from "./CriteriaGroup";
import GroupWrapper from "../GroupWrapper";
import { OptionTypes } from "./optionsgroup/OptionsGroup";
import SparnaturalComponent from "../../../SparnaturalComponent";
import { SparnaturalJsonGeneratorV13 } from "../../../../generators/json/SparnaturalJson-v13Generator";
import { AskQueryBuilder } from "../../../../generators/sparql/AskQueryBuilder";
import { getSettings } from "../../../../settings/defaultSettings";

/**
 * #809 : before a line shows its widget, asks the endpoint if the whole query, this line
 * included, can have a result. If not, this line (the user's last move) gets a red light in
 * place of its widget and is left out of the generated query. The other lines are left as they
 * are. A red line is checked again at each query change, to come back when it can.
 */
export class PossibleValuesCheck {
  #line: CriteriaGroup;
  #state: "checking" | "none" | null = null;
  // last ASK sent : the same query is not sent twice, and an answer to an older one is ignored
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

  // red light shown, this line is left out of the query
  hasNoPossibleValue(): boolean {
    return this.#state === "none";
  }

  // object variables of the lines with a red light, to leave them out of the query. Never the
  // first line, it carries the subject of the whole query.
  static redLineVariables(sparnatural: SparnaturalComponent, except?: CriteriaGroup): string[] {
    const root = sparnatural.BgWrapper.componentsList.rootGroupWrapper;
    const variables: string[] = [];
    root?.traversePreOrder((grp: GroupWrapper) => {
      const line = grp.criteriaGroup;
      if (grp !== root && line !== except && line.possibleValuesCheck.hasNoPossibleValue()) {
        variables.push(line.endClassGroup.getVarName());
      }
    });
    return variables;
  }

  // a change elsewhere in the query can bring a red line back
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
      // only a red line is checked again : the red light stays on the line of the user's last
      // move, a line in use is never turned red by what happens on another line
      if (this.#state === "none") this.#check(false);
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
    // already sent : its answer is shown or on its way
    if (!withSpinner && ask === this.#lastAsk) return;
    this.#lastAsk = ask;
    if (withSpinner) this.#setState("checking");

    const settings = getSettings();
    if (settings.debug) console.log("[#809] ASK query :\n" + ask);
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
          if (settings.debug) console.log("[#809] ASK answer :", data?.boolean);
          // only an explicit false is a dead end, anything else shows the widget
          if (ask === this.#lastAsk) this.#apply(data?.boolean !== false);
        },
        (error: any) => {
          if (ask !== this.#lastAsk) return;
          // a failing endpoint must never block the user with a wrong red light
          console.warn("[#809] ASK query failed, widget shown anyway", error);
          this.#apply(true);
        },
      );
  }

  // the ASK of the whole query, this line included. Null when this line is not to be checked.
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
      // the query of the screen, red lines left out except this one : it must be in its own
      // ASK, or it could never come back
      const jsonQuery = AskQueryBuilder.withoutLines(
        new SparnaturalJsonGeneratorV13(sparnatural).generateQuery(false, 0),
        PossibleValuesCheck.redLineVariables(sparnatural, line),
      );
      const ask = new AskQueryBuilder(line.specProvider, settings).build(jsonQuery);
      return line.specProvider.expandSparql(ask, settings.sparqlPrefixes);
    } catch (err) {
      console.warn("[#809] could not build the ASK query", err);
      return null;
    }
  }

  #apply(hasResult: boolean) {
    const state = hasResult ? null : "none";
    // nothing to redraw when the answer confirms what is shown
    if (state !== this.#state) this.#setState(state);
  }

  #setState(state: "checking" | "none" | null) {
    const line = this.#line;
    const wasNone = this.#state === "none";
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
    // the line enters or leaves the query, the generated query must follow
    if (wasNone !== (state === "none")) {
      line.html[0].dispatchEvent(
        new CustomEvent("generateQuery", { bubbles: true }),
      );
    }
  }
}
