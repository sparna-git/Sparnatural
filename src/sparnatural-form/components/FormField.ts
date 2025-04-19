import { WidgetFactory } from "../../sparnatural/components/builder-section/groupwrapper/criteriagroup/edit-components/WidgetFactory";
import { SparnaturalFormI18n } from "../settings/SparnaturalFormI18n";
import UnselectBtn from "../../sparnatural/components/buttons/UnselectBtn";
import {
  Branch,
  CriteriaLine,
  SparnaturalQueryIfc,
} from "../../sparnatural/SparnaturalQuery";
import ISparnaturalSpecification from "../../sparnatural/spec-providers/ISparnaturalSpecification";
import OptionalCriteriaManager from "./optionalCriteria/OptionalCriteriaManager";
import { AbstractWidget } from "../../sparnatural/components/widgets/AbstractWidget";
import { Binding } from "../FormStructure";
import tippy from "tippy.js";

class FormField {
  private binding: Binding;
  private formContainer: HTMLElement;
  private specProvider: ISparnaturalSpecification;
  private query: SparnaturalQueryIfc;
  private widgetFactory: WidgetFactory;
  private optionalCriteriaManager!: OptionalCriteriaManager; // Optional Criteria Manager instance

  constructor(
    binding: Binding,
    formContainer: HTMLElement,
    specProvider: ISparnaturalSpecification,
    query: SparnaturalQueryIfc,
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

    // Initialize Tippy.js on the help icon
    setTimeout(() => {
      tippy(".help-icon", {
        allowHTML: true,
        theme: "sparnatural",
        arrow: false,
        placement: "right",
        animation: "scale-extreme",
        delay: [200, 200],
        duration: [200, 200],
      });
    }, 500);

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

  // Method to create a label with an SVG tooltip icon
  private createLabel(variable: string): HTMLLabelElement {
    const label = document.createElement("label");
    label.setAttribute("for", variable);
    label.classList.add("form-label");

    // Get the field label
    const labelText = SparnaturalFormI18n.getLabel(variable);
    label.innerHTML = `<strong>${labelText}</strong>`;

    // Create an SVG help icon
    const helpIcon = document.createElement("span");
    helpIcon.classList.add("help-icon");
    helpIcon.setAttribute("tabindex", "0");

    helpIcon.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 512 512" fill="currentColor">
          <path d="M504 256c0 136.997-111.043 248-248 248S8 392.997 8 256C8 119.083 119.043 8 256 8s248 111.083 248 248zM262.655 90c-54.497 0-89.255 22.957-116.549 63.758-3.536 5.286-2.353 12.415 2.715 16.258l34.699 26.31c5.205 3.947 12.621 3.008 16.665-2.122 17.864-22.658 30.113-35.797 57.303-35.797 20.429 0 45.698 13.148 45.698 32.958 0 14.976-12.363 22.667-32.534 33.976C247.128 238.528 216 254.941 216 296v4c0 6.627 5.373 12 12 12h56c6.627 0 12-5.373 12-12v-1.333c0-28.462 83.186-29.647 83.186-106.667 0-58.002-60.165-102-116.531-102zM256 338c-25.365 0-46 20.635-46 46 0 25.364 20.635 46 46 46s46-20.636 46-46c0-25.365-20.635-46-46-46z"/>
      </svg>`;

    // Get the help text if it exists on form config
    const helpText = SparnaturalFormI18n.getHelp(variable);
    if (helpText) {
      helpIcon.setAttribute("data-tippy-content", helpText.replace(/"/g, '&quot;'));
      label.appendChild(helpIcon);
    }
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
        console.log("here");
        typeof valueToInject[0] === "string";
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
