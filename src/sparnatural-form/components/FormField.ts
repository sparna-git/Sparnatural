import { WidgetFactory } from "../../sparnatural/components/builder-section/groupwrapper/criteriagroup/edit-components/WidgetFactory";
import { SparnaturalFormI18n } from "../settings/SparnaturalFormI18n";
import UnselectBtn from "../../sparnatural/components/buttons/UnselectBtn";
import {
  Branch,
  CriteriaLine,
  ISparJson,
} from "../../sparnatural/generators/json/ISparJson";
import ISparnaturalSpecification from "../../sparnatural/spec-providers/ISparnaturalSpecification";
import OptionalCriteriaManager from "./optionalCriteria/OptionalCriteriaManager";
import { AbstractWidget } from "../../sparnatural/components/widgets/AbstractWidget";
import { Binding } from "../FormStructure";

class FormField {
  private binding: Binding;
  private formContainer: HTMLElement;
  private specProvider: ISparnaturalSpecification;
  private query: ISparJson;
  private widgetFactory: WidgetFactory;
  private optionalCriteriaManager!: OptionalCriteriaManager; // Optional Criteria Manager instance

  constructor(
    binding: Binding,
    formContainer: HTMLElement,
    specProvider: ISparnaturalSpecification,
    query: ISparJson,
    widgetFactory: WidgetFactory
  ) {
    this.binding = binding;
    this.formContainer = formContainer;
    this.specProvider = specProvider;
    this.query = query;
    this.widgetFactory = widgetFactory;
  }

  generateField(): void {
    const variable = this.binding.variable;

    // Create a container for the field
    const formFieldDiv = document.createElement("div");
    formFieldDiv.classList.add("formField");
    this.formContainer.appendChild(formFieldDiv);

    // Create a label for the widget
    const label = this.createLabel(variable);
    formFieldDiv.appendChild(label);

    // Find the line in the query corresponding to the variable
    const queryLine = this.findInBranches(this.query.branches, variable);

    if (queryLine) {
      const widget = this.createWidget(queryLine);
      formFieldDiv.appendChild(widget.html[0]);

      // Initialize OptionalCriteriaManager
      this.optionalCriteriaManager = new OptionalCriteriaManager(
        this.query,
        variable,
        queryLine,
        widget,
        formFieldDiv
      );

      // Add options like "An'y value" and "Not Exist"
      this.addValuesAndOptions(formFieldDiv, queryLine, widget, variable);
    }
  }

  //method to create a label for the widget in the form
  private createLabel(variable: string): HTMLLabelElement {
    const label = document.createElement("label");
    label.setAttribute("for", variable);
    label.innerHTML = `<strong>${SparnaturalFormI18n.getLabel(
      variable
    )}</strong>`;
    label.style.fontSize = "18px";
    return label;
  }

  //method to find the line in the query corresponding to the variable
  private findInBranches(
    branches: Branch[],
    variable: string
  ): CriteriaLine | null {
    for (const branch of branches) {
      if (branch.line.o === variable) return branch.line;
      if (branch.children && branch.children.length > 0) {
        const result = this.findInBranches(branch.children, variable);
        if (result) return result;
      }
    }
    return null;
  }

  //method to create a widget in the form
  private createWidget1(queryLine: CriteriaLine): AbstractWidget {
    const subject = queryLine.sType;
    const predicate = queryLine.p;
    const object = queryLine.oType;

    const specEntity = this.specProvider.getEntity(subject);
    const connectingProperty = this.specProvider.getProperty(predicate);
    const propertyType = connectingProperty.getPropertyType(object);

    const widget = this.widgetFactory.buildWidget(
      propertyType,
      { variable: queryLine.s, type: specEntity.getId() },
      { variable: "predicate", type: connectingProperty.getId() },
      { variable: queryLine.o, type: object }
    );
    widget.render();
    //console.log("widget", widget);
    return widget;
  }

  private createWidget(queryLine: CriteriaLine): AbstractWidget {
    const subject = queryLine.sType;
    const predicate = queryLine.p;
    const object = queryLine.oType;

    const specEntity = this.specProvider.getEntity(subject);
    const connectingProperty = this.specProvider.getProperty(predicate);
    const propertyType = connectingProperty.getPropertyType(object);

    const widget = this.widgetFactory.buildWidget(
      propertyType,
      { variable: queryLine.s, type: specEntity.getId() },
      { variable: "predicate", type: connectingProperty.getId() },
      { variable: queryLine.o, type: object }
    );
    widget.render();
    // console.log("widget", widget);
    return widget;
  }

  //methode to add values and options to the widget in the form
  private addValuesAndOptions(
    formFieldDiv: HTMLElement,
    queryLine: CriteriaLine,
    widget: AbstractWidget,
    variable: string
  ): void {
    const valueDisplay = document.createElement("div");
    valueDisplay.setAttribute("id", `selected-value-${variable}`);
    valueDisplay.classList.add("value-display-container");
    valueDisplay.style.marginTop = "5px";
    formFieldDiv.appendChild(valueDisplay);

    // Add a set to store selected values and a method to update the display

    const selectedValues = new Set<any>();
    const updateValueDisplay = () => {
      valueDisplay.innerHTML = "";
      selectedValues.forEach((val) => {
        const valueContainer = document.createElement("div");
        valueContainer.classList.add("selected-value-container");
        const valueLabel = document.createElement("span");
        valueLabel.innerText = `${val.label}`;
        valueLabel.classList.add("selected-value-label");
        valueContainer.appendChild(valueLabel);

        const removeBtn = new UnselectBtn(widget, () => {
          selectedValues.delete(val);
          console.log(selectedValues);
          updateValueDisplay();
          queryLine.values = Array.from(selectedValues);
          console.log(true);
          console.log("QUERYLINE ", queryLine);
          formFieldDiv.dispatchEvent(
            new CustomEvent("valueRemoved", {
              bubbles: true,
              detail: { value: val, variable: variable },
            })
          );

          // Update options visibility
          if (this.optionalCriteriaManager) {
            this.optionalCriteriaManager.updateOptionVisibility();
          }
        }).render();
        valueContainer.appendChild(removeBtn.html[0]);
        valueDisplay.appendChild(valueContainer);
      });
    };

    // Add existing values to the widget

    // Add an event listener to add values to the widget
    widget.html[0].addEventListener("renderWidgetVal", (e: CustomEvent) => {
      //console.log("widget", widget);
      console.log("e.detail", e.detail);

      let valueToInject: any[];

      // Handle different cases for e.detail
      if (Array.isArray(e.detail)) {
        // Case: e.detail is an array
        valueToInject = e.detail.map((item: any) => item.value);
      } else if (e.detail.value) {
        // Case: e.detail contains a single value or a wrapped object
        valueToInject = Array.isArray(e.detail.value)
          ? e.detail.value
          : [e.detail.value];
      } else {
        console.warn("Unexpected e.detail format:", e.detail);
        return; // Exit early if the format is not recognized
      }

      console.log("valueToInject", valueToInject);

      valueToInject.forEach((val: any) => {
        const existingValue = Array.from(selectedValues).find(
          (existingVal: any) => existingVal.label === val.label
        );

        if (!existingValue) {
          selectedValues.add(val);

          updateValueDisplay();
          queryLine.values = Array.from(selectedValues);

          formFieldDiv.dispatchEvent(
            new CustomEvent("valueAdded", {
              bubbles: true,
              detail: { value: val, variable: variable },
            })
          );

          // Update options visibility
          if (this.optionalCriteriaManager) {
            this.optionalCriteriaManager.updateOptionVisibility();
          }
        }
      });
    });

    // Add An'yValue and NotExist options
    this.optionalCriteriaManager = new OptionalCriteriaManager(
      this.query,
      variable,
      queryLine,
      widget,
      formFieldDiv
    );
  }
}
export default FormField;

/*

    // Add an event listener to add values to the widget
    widget.html[0].addEventListener("renderWidgetVal", (e: CustomEvent) => {
      console.log("widget", widget);
      console.log("e.detail", e.detail);
      const valueToInject = Array.isArray(e.detail.value)
        ? e.detail.value
        : [e.detail.value];
      console.log("valueToInject", valueToInject);

      valueToInject.forEach((val: any) => {
        const existingValue = Array.from(selectedValues).find(
          (existingVal: any) => existingVal.label === val.label
        );

        if (!existingValue) {
          selectedValues.add(val);

          updateValueDisplay();
          queryLine.values = Array.from(selectedValues);

          formFieldDiv.dispatchEvent(
            new CustomEvent("valueAdded", {
              bubbles: true,
              detail: { value: val, variable: variable },
            })
          );

          // Update options visibility
          if (this.optionalCriteriaManager) {
            this.optionalCriteriaManager.updateOptionVisibility();
          }
        }
      });
    });
*/
