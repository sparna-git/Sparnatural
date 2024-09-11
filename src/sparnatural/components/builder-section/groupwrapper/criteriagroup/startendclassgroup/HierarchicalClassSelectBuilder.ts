import { getSettings } from "../../../../../settings/defaultSettings";
import { Config } from "../../../../../ontologies/SparnaturalConfig";
import { SelectedVal } from "../../../../SelectedVal";
import HTMLComponent from "../../../../HtmlComponent";
import ISparnaturalSpecification from "../../../../../spec-providers/ISparnaturalSpecification";
import StartClassGroup from "./StartClassGroup";
import EndClassGroup from "./EndClassGroup";
import { WidgetValue } from "../../../../widgets/AbstractWidget";
import { I18n } from "../../../../../settings/I18n";
import { DagIfc, DagNodeIfc} from "../../../../../dag/Dag";
import ISpecificationEntity from "../../../../../spec-providers/ISpecificationEntity";
import UiuxConfig from "../../../../IconsConstants";
import tippy from "tippy.js";
import { TOOLTIP_CONFIG } from "../../../../../settings/defaultSettings";


export interface JsonDagRow {
  label: string,
  id: string,
  tooltip: string,
  color: string,
  icon: string,
  highlightedIcon:string,
  count: number,
  disabled: boolean,
  childs: Array<JsonDagRow>,
}
export interface DagWidgetDefaultValue {
  value: string,
  path: string,
}
export interface DagWidgetValue {
  value: string,
  path: string,
  icon: string,
}
export interface BreadCrumData {
  parentsLabels: Array<string>,
  returnPath: string,
}

/**
 * Builds a selector for a class based on provided domainId, by reading the
 * configuration. If the given domainId is null, this means we populate the first
 * class selection (starting point) so reads all classes that are domains of any property.
 *
 **/
export class HierarchicalClassSelectBuilder extends HTMLComponent {
    specProvider: ISparnaturalSpecification;
    html: JQuery<HTMLElement>; 
    //htmlCoreSelect: JQuery<HTMLElement>; 
    htmlSelectUiUx: JQuery<HTMLElement>; 
    htmlSelectUiUxBreadCrum: JQuery<HTMLElement>; 
    htmlBreadCrumBack: JQuery<HTMLElement>; 
    htmlBreadCrumPath: JQuery<HTMLElement>; 
    htmlBreadCrumPathHome: JQuery<HTMLElement>; 
    htmlBreadCrumPathParentsPrefix: JQuery<HTMLElement>; 
    htmlBreadCrumPathParents: JQuery<HTMLElement>; 
    htmlBreadCrumParentLabel: JQuery<HTMLElement>; 
    htmlSelectUiUxLists: JQuery<HTMLElement>; 
    //htmlCurentValue: JQuery<HTMLElement>; 
    breadcrumItems: Array<string> = [];
    hierarchyData: Array<JsonDagRow> = [];
    value: string;
    valuePath: string;
    defaultValue: DagWidgetDefaultValue = {
      value: '',
      path: ''
    };
    widgetValue: DagWidgetValue = {
      value: '',
      path: '',
      icon: ''
    };
    constructor(ParentComponent: HTMLComponent, specProvider: ISparnaturalSpecification, hierarchyData: Array<JsonDagRow>, defaultValue: DagWidgetDefaultValue) {
      super("HierarchicalClassSelectBuilder", ParentComponent, null);
      this.specProvider = specProvider;
      this.hierarchyData = hierarchyData;
      this.defaultValue = defaultValue;
    }
  
    render(): this {
      super.render();
      return this;
    }

    moveHasAncestor(el:any) {
      el.classList.remove('active-pane') ;
      el.classList.add('active-pane-hide-left');
      if (el.getAttribute('parent') == '') {
        this.htmlSelectUiUxLists[0].classList.add('root-display') ;
      }
    }
    moveHasChild(el:any) {
      el.classList.add('active-pane') ;
      this.htmlSelectUiUxLists[0].classList.remove('root-display') ;
      let parentItem = this.getParentLiToUl(el) ;
      let liParentLabel = parentItem.querySelector('.item-label').innerText ;
      this.downAncestorInParentLabel(liParentLabel) ;
      //test if liparent is not on root ul
      let ulOfLiParent = parentItem.closest('ul') ;
      if (ulOfLiParent.getAttribute('parent') != '') { //need to add ancestor item label to path, need to animate first acestor
        let liAncestor = this.getParentLiToUl(ulOfLiParent);
        let liAncestorLabel = liAncestor.querySelector('.item-label').innerText ;
        this.downAncestorInBreadcrumPath(liAncestorLabel) ;
      } else {
        this.htmlBreadCrumParentLabel[0].classList.add('display');
      }

    }
    moveHasLeaveChild(el:any) {
      el.classList.remove('active-pane') ;
    }
    moveHasEnterAncestor(el:any) {
      el.classList.remove('active-pane-hide-left');
      el.classList.add('active-pane') ;
      if (el.getAttribute('parent') == '') {
        this.htmlSelectUiUxLists[0].classList.add('root-display') ;
      }
      this.upAncestorInParentLabel() ;
    }

    getParentLiToUl(el:any):any {
      let uniqPath = el.getAttribute('parent')  ;
      return this.htmlSelectUiUx[0].querySelector(`li[list-child-id="${uniqPath}"]`) ;
    }

    getInput() {
      return this.html ;
    }

    downAncestorInBreadcrumPath(newAcestorLabel:any) {
      let parentList = this.htmlBreadCrumPathParents[0].querySelectorAll('span:not(.onHiddenUp)') ;
      if (parentList.length == 2) {
        parentList[0].classList.add('onHiddenUp');
        this.htmlBreadCrumPathHome[0].classList.add('onHiddenUp');
        this.htmlBreadCrumPathParentsPrefix[0].classList.add('onHiddenUp');
      }
      let NewAncestor = $(`<span class="ancestor-item">&nbsp;/ ${newAcestorLabel}</span>`) ;
      //this.htmlBreadCrumPathParents[0].innerHTML = '' ;
      this.htmlBreadCrumPathParents.append(NewAncestor) ;
      setTimeout(function() {
        NewAncestor[0].classList.toggle('appened');
      }, 1);
      
    }
    
    /*upAncestorInBreadcrumPath() {
      let parentList = this.htmlBreadCrumPathParents[0].querySelectorAll('span') ;
      if (parentList.length == 2) {
        this.htmlBreadCrumPathParents[0].querySelector('span:last-of-type').classList.remove('appened') ;
        let htmlBreadCrumPathParents = this.htmlBreadCrumPathParents[0] ;
        setTimeout(function() {
          htmlBreadCrumPathParents.querySelector('span:last-of-type').remove() ;
        }, 500);
        return true;
      }
      
    }*/
    downAncestorInParentLabel(newParentLabel:any) {
      let new_item = $(`<span>${newParentLabel}</span>`) ;
      if(this.htmlBreadCrumParentLabel[0].querySelector('span:last-of-type') != null) {
        this.htmlBreadCrumParentLabel[0].querySelector('span:last-of-type').classList.add('move-left') ;
        this.htmlBreadCrumParentLabel[0].querySelector('span:last-of-type').classList.remove('move-to-display') ;
      }
      this.htmlBreadCrumParentLabel.append(new_item) ;
      let htmlBreadCrumParentLabel = this.htmlBreadCrumParentLabel[0] ;
      setTimeout(function() {
        htmlBreadCrumParentLabel.querySelector('span:last-of-type').classList.add('move-to-display')
      }, 1);
    }
    upAncestorInParentLabel() {
      let parentList = this.htmlBreadCrumParentLabel[0].querySelectorAll('span') ;
      if (parentList.length == 1) {
        let htmlBreadCrumParentLabel = this.htmlBreadCrumParentLabel[0] ;
        setTimeout(function() {
          htmlBreadCrumParentLabel.querySelector('span:last-of-type').remove() ;
        }, 500);
        return true;
      }
      if(this.htmlBreadCrumParentLabel[0].querySelector('span:last-of-type') != null) {
        this.htmlBreadCrumParentLabel[0].querySelector('span:last-of-type').classList.add('move-right') ;
        this.htmlBreadCrumParentLabel[0].querySelector('span:last-of-type').classList.remove('move-to-display') ;
      }
      let indexToDisplay = parentList.length - 2;
      if (indexToDisplay >= 0) {
        parentList[indexToDisplay].classList.remove('move-left') ;
        parentList[indexToDisplay].classList.add('move-to-display') ;

        this.htmlBreadCrumPathParents[0].querySelector('span:last-of-type').classList.remove('appened') ;
        let htmlBreadCrumPathParents = this.htmlBreadCrumPathParents[0] ;
        setTimeout(function() {
          htmlBreadCrumPathParents.querySelector('span:last-of-type').remove() ;
        }, 500);
        
        let pathHiddenParentList = this.htmlBreadCrumPathParents[0].querySelectorAll('span.onHiddenUp') ;
        if (pathHiddenParentList.length > 0) {
          pathHiddenParentList[(pathHiddenParentList.length - 1)].classList.remove('onHiddenUp');
        } 
        if (this.htmlBreadCrumPathParents[0].querySelectorAll('span.onHiddenUp').length == 0) {
          this.htmlBreadCrumPathHome[0].classList.remove('onHiddenUp');
          this.htmlBreadCrumPathParentsPrefix[0].classList.remove('onHiddenUp');
        }
      }
      let htmlBreadCrumParentLabel = this.htmlBreadCrumParentLabel[0] ;
      setTimeout(function() {
        htmlBreadCrumParentLabel.querySelector('span:last-of-type').remove() ;
      }, 500);
    }

    /*setCurrentContent() {
      let entity = this.specProvider.getEntity(this.widgetValue.value) ;
      let entity_icon = entity.getIcon() ;
      let icon = `` ;
      if (entity_icon != '') {
        icon = `<span><i class="fa ${entity_icon} fa-fw"></i></span>` ;
      }
      this.htmlCurentValue.html(`${icon} ${entity.getLabel()} `) ;
      this.htmlCurentValue[0].classList.add('selected') ;
    }*/

    initSelectUiUxListsHeight() {
      let listToDisplay = this.htmlSelectUiUx[0].querySelector('ul[parent].active-pane') ;
      //let allLists = this.htmlSelectUiUx[0].querySelectorAll('ul[parent]') ;
      let listToDisplayLiCount = this.htmlSelectUiUx[0].querySelectorAll('ul[parent].active-pane li').length ;
      let breadcrumHeight = 55;
      if (listToDisplay.classList.contains('root')) {
        breadcrumHeight = 0 ;
      }
      let newHeight = 40 * listToDisplayLiCount + breadcrumHeight ;
      if (newHeight > 400) {
        newHeight = 400 ;
      }
      this.htmlSelectUiUxLists[0].style.height = newHeight+'px' ;
      this.htmlSelectUiUx[0].querySelectorAll('ul[parent]').forEach((el:HTMLElement) => el.style.height = (newHeight - breadcrumHeight) +'px' );
    }


    initClassSelector() {
      /*Search class with childs*/ 
      let li_elements = this.htmlSelectUiUx[0].querySelectorAll('li ');
      //let ul_elements = this.htmlSelectUiUx[0].querySelectorAll('ul') ;
      for (var element of li_elements) {
        //let class_id = element.getAttribute('value') ;
        let class_childs_list_id = element.getAttribute('list-child-id') ;
        //Search in all ul if have parent attr with this class_id
        let hasChild = this.htmlSelectUiUx[0].querySelector('ul[parent="'+class_childs_list_id+'"]');
        if (hasChild !== null) {
          element.classList.add("have-childs");
          element.querySelector('span.item-traverse').addEventListener(
            "click",
            (e: CustomEvent) => {
              let class_target = (e.target as any).closest('li').getAttribute('list-child-id') ;
              let parent_ul_return = (e.target as any).closest('ul').getAttribute('parent') ;
              this.htmlSelectUiUx[0].querySelectorAll('ul[parent].active-pane').forEach(el => this. moveHasAncestor(el));
              this.moveHasChild(this.htmlSelectUiUx[0].querySelector('ul[parent="'+class_target+'"]'));
              this.initSelectUiUxListsHeight() ;
              this.htmlBreadCrumBack[0].setAttribute('return-target', parent_ul_return)  ;
            }
          );
        }
      }

      let li_elements_disabled = this.htmlSelectUiUx[0].querySelectorAll('li.disabled');
      //let ul_elements = this.htmlSelectUiUx[0].querySelectorAll('ul') ;
      for (var element of li_elements_disabled) {
        //let class_id = element.getAttribute('value') ;
        let class_childs_list_id = element.getAttribute('list-child-id') ;
        //Search in all ul if have parent attr with this class_id
        let hasChild = this.htmlSelectUiUx[0].querySelector('ul[parent="'+class_childs_list_id+'"]');
        if (hasChild !== null) {
          element.classList.add("have-childs");
          element.querySelector('span.item-sel').addEventListener(
            "click",
            (e: CustomEvent) => {
              let class_target = (e.target as any).closest('li').getAttribute('list-child-id') ;
              let parent_ul_return = (e.target as any).closest('ul').getAttribute('parent') ;
              this.htmlSelectUiUx[0].querySelectorAll('ul[parent].active-pane').forEach(el => this. moveHasAncestor(el));
              this.moveHasChild(this.htmlSelectUiUx[0].querySelector('ul[parent="'+class_target+'"]'));
              this.initSelectUiUxListsHeight() ;
              this.htmlBreadCrumBack[0].setAttribute('return-target', parent_ul_return) ;
            }
          );
        }
      }
      //All breadcrum return action 
      this.htmlBreadCrumBack[0].addEventListener(
        "click",
        (e: CustomEvent) => {
          let class_target = (e.target as any).closest('.htmlBreadCrumBack').getAttribute('return-target') ;
          this.htmlSelectUiUx[0].querySelectorAll('ul[parent].active-pane').forEach(el => this.moveHasLeaveChild(el));
          this.moveHasEnterAncestor(this.htmlSelectUiUx[0].querySelector('ul[parent="'+class_target+'"]'));
          this.initSelectUiUxListsHeight() ;
          if (class_target != '') {
            let new_tareget_back = this.getParentLiToUl(this.htmlSelectUiUx[0].querySelector('ul[parent="'+class_target+'"]')).closest('ul').getAttribute('parent') ;
            this.htmlBreadCrumBack[0].setAttribute('return-target', new_tareget_back)  ;
          }
        }
      );

      // Listen click for selectable class
      let li_elements_sel = this.htmlSelectUiUx[0].querySelectorAll('li.enabled .item-sel');
      li_elements_sel.forEach(element => {
        element.addEventListener(
          "click",
          (e: CustomEvent) => {
            let class_id = (e.target as any).closest('li').getAttribute('data-id') ;
            let class_path = (e.target as any).closest('li').getAttribute('data-parent') ;
            let class_icon = (e.target as any).closest('li').getAttribute('data-icon') ;

            this.widgetValue = {
              value: class_id,
              path: class_path,
              icon: class_icon,
            };
      
            this.html[0].dispatchEvent(
              new CustomEvent("widgetItemSelected", {
                bubbles: true,
                detail: this.widgetValue,
              })
            );
            //this.setCurrentContent() ;

          }
        );

      });
    }
    initBreadCrum() {
      this.htmlBreadCrumBack = $('<div class="htmlBreadCrumBack"></div>'); 
      let BackContent = $(`<span>${UiuxConfig.ICON_DAG_ARROW_LEFT}</span>`); 
      this.htmlBreadCrumPath = $('<div class="htmlBreadCrumPath"></div>'); 
      this.htmlBreadCrumPathHome = $('<div class="htmlBreadCrumPathHome">Tout</div>'); 
      this.htmlBreadCrumPathParentsPrefix = $('<div class="htmlBreadCrumPathParentsPrefix">...</div>'); 
      this.htmlBreadCrumPathParents = $('<div class="htmlBreadCrumPathParents"></div>');  
      this.htmlBreadCrumParentLabel = $('<div class="htmlBreadCrumParentLabel"></div>'); 
      //First block for backward action
      let leftBlock = $('<div class="htmlBreadCrumLeft"></div>') ;
      this.htmlBreadCrumBack.append(BackContent) ;
      leftBlock.append(this.htmlBreadCrumBack) ;
      this.htmlSelectUiUxBreadCrum.append(leftBlock) ;
      //Second block for navigation path display
      let rightBlock = $('<div class="htmlBreadCrumRight"></div>') ;
      this.htmlBreadCrumPath.append(this.htmlBreadCrumPathHome) ;
      this.htmlBreadCrumPath.append(this.htmlBreadCrumPathParentsPrefix) ;
      this.htmlBreadCrumPath.append(this.htmlBreadCrumPathParents) ;
      rightBlock.append(this.htmlBreadCrumPath) ;
      rightBlock.append(this.htmlBreadCrumParentLabel) ;
      this.htmlSelectUiUxBreadCrum.append(rightBlock) ;
    }
    
    buildClassSelectList(arrayNode: Array<JsonDagRow>, parentClass: string, path: string, breadCrumData: BreadCrumData) {
      if(arrayNode.length > 0) {
        let Ul = $(`<ul class="`+parentClass+`" parent="${path}"></ul>`) ;
        let i = 0 ;
        arrayNode.forEach(element => {
          let htmlItem = this.buildClassSelectItem(element, path) ;
          let child_path = path+'$'+element.id ;
          Ul.append(htmlItem) ;
          i++ ;
          if (element.childs.length > 0) {
            let element_breadCrumData = null ;
            element_breadCrumData = JSON.parse(JSON.stringify(breadCrumData));
            element_breadCrumData.parentsLabels.push(element.label) ;
            element_breadCrumData.returnPath = path ;
            this.buildClassSelectList(element.childs, 'root-child', child_path, element_breadCrumData) ;
            htmlItem.attr('list-child-id', path+'$'+element.id) ;
          }
        });
        let breadcrumHeight = 55;
        if (Ul[0].classList.contains('root')) {
          breadcrumHeight = 0 ;
          this.htmlSelectUiUxLists[0].style.height = (40*i)+'px' ;
        }
        if (i > 10) {
          Ul[0].style.height = 400+'px' ;
        } else {
          Ul[0].style.height = (40*i + breadcrumHeight)+'px' ;
        }
        this.htmlSelectUiUxLists.append(Ul);
      }
    }

    buildClassSelectItem(element: JsonDagRow, parent:string) {
      let enabledClass = element.disabled == true ? ` disabled` : `enabled` ;
      let icon = `` ;
      let iconValue = ``;
      if (element.icon != '') {
        icon = `<span><i class="fa ${element.icon} fa-fw"></i></span>` ;
        iconValue = `data-icon="${element.icon}"` ;
      }
      let selected = this.defaultValue.value == element.id ? 'selected="selected"' : "";
      //Add tooltip content if description
      let tooltip = element.tooltip != undefined ? `${element.tooltip}` : "";
      // Prepand label if contain more than 32 caracteres
      if (element.label.length > 32) {
        let sep = tooltip != '' ? ` - ` : "" ;
        tooltip = `${element.label}${sep}${tooltip}` ;
      }
      // set typpy attribute if tooltip content
      if (tooltip != '') {
        tooltip = `data-tippy-content="${tooltip}"` ;
      }

      let color = element.color != undefined ? `data-color="${element.color}"` : "";

      let item = $(`<li value="${element.id}" data-id="${element.id}" data-parent="`+ parent +`" ${selected} ${color} ${iconValue} class="${enabledClass}"><span class="item-sel" ${tooltip}><span class="label-icon">${icon}</span><span class="item-label">${element.label}</span></span><span class="item-traverse">${UiuxConfig.ICON_DAG_ARROW_RIGHT}</span></li>`) ;
      return item ;
    }

    displayClassSelector() {
      this.htmlSelectUiUx.addClass('open') ;
    }
    hideClassSelector() {
      this.htmlSelectUiUx.removeClass('open') ;
    }

    submitSelectedValue() {
      if (this.defaultValue.value != '') {
        /*this.setCurrentContent() ;
        this.html[0].dispatchEvent(
          new CustomEvent("change", {
            bubbles: true,
            detail: {value: this.defaultValue.value, valuePath: this.defaultValue.path},
          })
        );
        this.hideClassSelector() ;*/
        let clickEvent = new Event( 'click', { bubbles: true } );
        //let changeEvent = new Event( 'change', { bubbles: true } );
        let allWithId = this.htmlSelectUiUx[0].querySelectorAll(`li[value="${this.defaultValue.value}"] .item-sel`);
        allWithId[0].dispatchEvent(clickEvent);
        //this.htmlInputValueClass[0].dispatchEvent(changeEvent);
      }
    }

    buildClassSelectFromJson() {
      //init select options array
      let selectOptionList: Array<string> = [];
      this.htmlSelectUiUx = $(`<div class="htmlSelectUiUx"></div>`) ;
      this.htmlSelectUiUxLists = $(`<div class="htmlSelectUiUxLists root-display"></div>`) ;
      this.htmlSelectUiUxBreadCrum = $(`<div class="htmlSelectUiUxBreadCrum"></div>`) ;
      //this.htmlCurentValue = $('<span class="current">Chercher des ressources</span>') ;
      let initBreadcrumData: BreadCrumData = {
        parentsLabels: ['Tout'],
        returnPath: '',
      }

      
      this.initBreadCrum() ;
      this.htmlSelectUiUxLists.append(this.htmlSelectUiUxBreadCrum) ;

      this.buildClassSelectList(this.hierarchyData, 'root active-pane', '', initBreadcrumData) ;

      this.html = $('<div></div>');
      //let currentWrapper = $('<div class="currentWrapper"></div>') ;
      //currentWrapper.append(this.htmlCurentValue) ;
      //this.htmlSelectUiUx.append(currentWrapper) ;

      this.htmlSelectUiUx.append(this.htmlSelectUiUxLists) ;
      this.html.append(this.htmlSelectUiUx) ;
      this.initClassSelector() ;

      this.displayClassSelector() ;

      tippy(
        this.html[0].querySelectorAll(".item-sel[data-tippy-content]"),
        TOOLTIP_CONFIG
      );
      
      this.html[0].addEventListener(
        "widgetItemSelected",
        (e: CustomEvent) => {
          this.html[0].dispatchEvent(
            new CustomEvent("change", {
              bubbles: true,
              detail: e.detail,
            })
          );
          this.hideClassSelector() ;

        }
      );

      return this.html.children();
    }

}
export default HierarchicalClassSelectBuilder;
