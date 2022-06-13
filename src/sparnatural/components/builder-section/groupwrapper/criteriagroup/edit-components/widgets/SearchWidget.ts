import { BaseExpression, Expression, Pattern } from "sparqljs";
import { getSettings } from "../../../../../../../configs/client-configs/settings";
import AddUserInputBtn from "../../../../../buttons/AddUserInputBtn";
import HTMLComponent from "../../../../../HtmlComponent";
import { AbstractWidget, ValueType, WidgetValue } from "./AbstractWidget";

export interface SearchWidgetValue extends WidgetValue{
    value:{
        key:string
        label:string
        search:string
    }
  }

export class SearchWidget extends AbstractWidget {

    addValueBtn: AddUserInputBtn;
    searchInput: JQuery<HTMLElement>;
  
    constructor(parentComponent: HTMLComponent) {
      super('search-widget',parentComponent,null)
    }
  
    render() {
      super.render()
      this.searchInput = $(`<input />`)
      this.html.append(this.searchInput)
      this.addValueBtn = new AddUserInputBtn(this,getSettings().langSearch.ButtonAdd,this.#addValueBtnClicked).render()
      return this
    }
    #addValueBtnClicked = () =>{
      this.searchInput.trigger('change')
      let searchWidgetValue:SearchWidgetValue = {
          valueType:ValueType.SINGLE,
          value:{
            key:this.searchInput.val().toString(),
            label:this.searchInput.val().toString(),
            search:this.searchInput.val().toString()
          }
      }
      this.renderWidgetVal(this.#validateInput(searchWidgetValue))
    }
  
    //TODO add dialog for input sanitation
    #validateInput(val:SearchWidgetValue){
      if(this.searchInput.val().toString() == ''){
        console.warn('empty string provided in searchWidget')
        val = null
      }
      return val
    }

    getRdfJsPattern(): Pattern[] {
        throw new Error("Method not implemented.");
    }
  }
  