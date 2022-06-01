import { getSettings } from "../../../../../../configs/client-configs/settings";
import { Config } from "../../../../../../configs/fixed-configs/SparnaturalConfig";
import { SelectedVal } from "../../../../../sparql/ISparJson";
import ISpecProvider from "../../../../../spec-providers/ISpecProviders";
import ActionWhere from "../../../../actions/actioncomponents/ActionWhere";
import HTMLComponent from "../../../../HtmlComponent";
import EndClassGroup from "../startendclassgroup/EndClassGroup";
import { SelectAllValue } from "./widgets/IWidget";
import WidgetWrapper from "./WidgetWrapper";


enum RENDER_WHERE_ENUM {
    LIST_PROPERTY = Config.LIST_PROPERTY,
    LITERAL_LIST_PROPERTY= Config.LITERAL_LIST_PROPERTY,
    AUTOCOMPLETE_PROPERTY=Config.AUTOCOMPLETE_PROPERTY,
    TREE_PROPERTY=Config.TREE_PROPERTY,
    NON_SELECTABLE_PROPERTY = Config.NON_SELECTABLE_PROPERTY
  }

class EditComponents extends HTMLComponent {
    startClassVal: SelectedVal;
    objectPropVal: SelectedVal;
    endClassVal: SelectedVal;
    actionWhere:ActionWhere
    widgetWrapper:WidgetWrapper
    specProvider: ISpecProvider;
    RENDER_WHERE = RENDER_WHERE_ENUM
    constructor(parentComponent:EndClassGroup,startCassVal:SelectedVal,objectPropVal:SelectedVal,endClassVal:SelectedVal,specProvider:ISpecProvider){
        super('EditComponents',parentComponent,null)
        this.startClassVal = startCassVal
        this.objectPropVal = objectPropVal
        this.endClassVal = endClassVal
        this.specProvider = specProvider
    }
    render(): this {
      super.render()

      this.renderWidgetsWrapper(true)

      let widgetType = this.widgetWrapper.getWidgetType()
      if(Object.values(this.RENDER_WHERE).includes(widgetType)){
        this.actionWhere = new ActionWhere(
          this,
          this.specProvider,
          this.#onAddWhere
        ).render();
      }
      this.#addEventListeners()
        return this
    }
    renderWidgetsWrapper(add_all:boolean){
      super.render()
      this.widgetWrapper = new WidgetWrapper(
        this,
        this.specProvider,
        this.startClassVal,
        this.objectPropVal,
        this.endClassVal,
        add_all
      ).render();
    }
    
    #addEventListeners(){
        // binds a selection in an input widget with the display of the value in the line
        this.widgetWrapper.html[0].addEventListener("selectAll", (e:CustomEvent) => {
            e.stopImmediatePropagation()
            this.#onSelectAll();
        });
    }

    #onSelectAll() {
      let selectAllVal:SelectAllValue ={
        label: getSettings().langSearch.SelectAllValues
      }
      this.html[0].dispatchEvent(
        new CustomEvent("renderWidgetVal", { bubbles: true,detail:selectAllVal })
      );
    }
    

    //MUST be arrowfunction
     #onAddWhere = () => {
    // render the ViewVarBtn
    this.html[0].dispatchEvent(
      new CustomEvent("addWhereComponent", {
        bubbles: true,
        detail: this.endClassVal,
      })
    );
  };
}

export default EditComponents