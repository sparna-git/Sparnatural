import ISpecProvider from "../../spec-providers/ISpecProvider";
import DisplayBtn from "../buttons/DisplayBtn";
import HTMLComponent from "../HtmlComponent";
import VariableOrderMenu from "./variableorder/VariableOrderMenu";
import VariableSortOption from "./variablesort/VariableSortOptions";

class VariableSection extends HTMLComponent {
  displayBtn: DisplayBtn;
  variableSortOption: VariableSortOption;
  variableOrderMenu: VariableOrderMenu;
  linesWrapper: JQuery<HTMLElement>;
  specProvider: ISpecProvider;

  constructor(ParentComponent: HTMLComponent, specProvider: ISpecProvider) {
    super("variablesSelection", ParentComponent, null);
    this.specProvider = specProvider;
  }

  render(): this {
    super.render();
    this.linesWrapper = $('<div class="linesWrapper"></div>');
    let line1 = $('<div class="line1"></div>');
    let line2 = $('<div class="line2"></div>');
    this.linesWrapper.append(line1).append(line2);
    this.html.append(this.linesWrapper);
    this.variableOrderMenu = new VariableOrderMenu(
      this,
      this.specProvider
    ).render();
    this.variableSortOption = new VariableSortOption(this).render();

    this.#renderShowHideBtn();
    this.#addMutationObserver()
    return this;
  }

  #renderShowHideBtn() {
    let displayaction = (display: boolean) => {
      if (display) {
        $(this.linesWrapper).animate(
          {
            height: $(this.linesWrapper).get(0).scrollHeight,
          },
          500,
          () => {
            $(this.linesWrapper).height("auto");
          }
        );
      } else {
        $(this.linesWrapper).animate(
          {
            height: 0,
          },
          500
        );
      }
    };

    this.displayBtn = new DisplayBtn(this, displayaction).render();
  }

   // See: https://github.com/sparna-git/Sparnatural/issues/391
   #addMutationObserver() {
    let observer = new MutationObserver(mutationRecords => {
      const firstItem = (this.variableOrderMenu.html[0].getElementsByClassName('sortableItem').item(0) as HTMLElement);
      const sortOption = (this.variableSortOption.html[0] as HTMLElement)
      
      if(!firstItem || firstItem.getBoundingClientRect().width === sortOption.getBoundingClientRect().width) return

      sortOption.style.width = `${firstItem.getBoundingClientRect().width}px`
    });
    
    observer.observe(this.html[0], {
      childList: true, // observe direct children
      subtree: true, // and lower descendants too
      attributes: true
    });
  }
}
export default VariableSection;
