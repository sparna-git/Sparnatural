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


export interface JsonDagRow {
  label: string,
  id: string,
  tooltip: string,
  color: string,
  icon: string,
  highlightedIcon:string,
  count: number,
  childs: Array<JsonDagRow>,
}
export interface DagWidgetDefaultValue {
  value: string,
  path: string,
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
    htmlSelectUiUxLists: JQuery<HTMLElement>; 
    htmlInputValueClass: JQuery<HTMLElement>; 
    htmlInputValuePath: JQuery<HTMLElement>; 
    htmlCurentValue: JQuery<HTMLElement>; 
    breadcrumItems: Array<string> = [];
    hierarchyData: Array<JsonDagRow> = [];
    value: string;
    valuePath: string;
    defaultValue: DagWidgetDefaultValue = {
      value: '',
      path: ''
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
    }
    moveHasChild(el:any) {
      el.classList.add('active-pane') ;
    }
    moveHasLeaveChild(el:any) {
      el.classList.remove('active-pane') ;
    }
    moveHasEnterAncestor(el:any) {
      el.classList.remove('active-pane-hide-left');
      el.classList.add('active-pane') ;
    }

    getInput() {
      return this.htmlInputValueClass ;
    }

    setCurrentContent() {
      let entity_path = this.htmlInputValuePath.val() as string;
      let entity_id = this.htmlInputValueClass.val() as string;

      let entity = this.specProvider.getEntity(entity_id) ;

      this.htmlCurentValue.html(`${entity.getIcon()} ${entity.getLabel()} `) ;
    }

    initSelectUiUxListsHeight() {
      let listToDisplay = this.htmlSelectUiUx[0].querySelector('ul[parent].active-pane') ;
      let allLists = this.htmlSelectUiUx[0].querySelectorAll('ul[parent]') ;
      let listToDisplayLiCount = this.htmlSelectUiUx[0].querySelectorAll('ul[parent].active-pane li').length ;
      let breadcrumHeight = 15;
      if (listToDisplay.classList.contains('root')) {
        breadcrumHeight = 0 ;
      }
      let newHeight = 40 * listToDisplayLiCount + breadcrumHeight ;
      if (newHeight > 400) {
        newHeight = 400 ;
      }
      this.htmlSelectUiUxLists[0].style.height = newHeight+'px' ;
      
      this.htmlSelectUiUx[0].querySelectorAll('ul[parent]').forEach((el:HTMLElement) => el.style.height = newHeight+'px' );
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
          // if parent is after in dom move before
          /*if(this.parentIsAfter( element.parentElement, hasChild ) ) {
            element.parentElement.before(hasChild);
          }*/
          //element.querySelector('span.item-traverse');
          element.querySelector('span.item-traverse').addEventListener(
            "click",
            (e: CustomEvent) => {
              let class_target = (e.target as any).closest('li').getAttribute('list-child-id') ;
              this.htmlSelectUiUx[0].querySelectorAll('ul[parent].active-pane').forEach(el => this. moveHasAncestor(el));
              this.moveHasChild(this.htmlSelectUiUx[0].querySelector('ul[parent="'+class_target+'"]'));
              this.initSelectUiUxListsHeight() ;
              //this.addBreadcrumItem(class_target, (e.target as any).parentElement.innerHTML ) ;
            }
          );
        }
      }
      //All breadcrum return action 
      let ul_breadcrum_elements = this.htmlSelectUiUx[0].querySelectorAll('div.returnBtn') ;
      for (var br_element of ul_breadcrum_elements) {
        br_element.addEventListener(
          "click",
          (e: CustomEvent) => {
            let class_target = (e.target as any).closest('.returnBtn').getAttribute('return-target') ;
            this.htmlSelectUiUx[0].querySelectorAll('ul[parent].active-pane').forEach(el => this.moveHasLeaveChild(el));
            //this.htmlSelectUiUx[0].querySelector('ul[parent="'+class_target+'"]').classList.add("active-pane");
            
            this.moveHasEnterAncestor(this.htmlSelectUiUx[0].querySelector('ul[parent="'+class_target+'"]'));
            this.initSelectUiUxListsHeight() ;
            //this.addBreadcrumItem(class_target, (e.target as any).parentElement.innerHTML ) ;
          }
        );
      }

      let li_elements_sel = this.htmlSelectUiUx[0].querySelectorAll('li .item-sel');
      li_elements_sel.forEach(element => {
        element.addEventListener(
          "click",
          (e: CustomEvent) => {
            let class_id = (e.target as any).closest('li').getAttribute('data-id') ;
            let class_path = (e.target as any).closest('li').getAttribute('data-parent') ;

            this.htmlInputValuePath.val(class_path) ;
            this.htmlInputValueClass.val(class_id).trigger("change");
            this.setCurrentContent() ;

          }
        );

      });
    }
    
    buildClassSelectList(arrayNode: Array<JsonDagRow>, parentClass: string, path: string, breadCrumData: BreadCrumData) {
      if(arrayNode.length > 0) {
        //let Ul = $(`<ul class=`+parentClass+` parent="`+path+`"></ul>`) ;
        let Ul = $(`<ul class="`+parentClass+`" parent="${path}"></ul>`) ;

        if(breadCrumData.parentsLabels.length > 1) {
          let htmlBreadCrum = $(`<li class="SubBreadcrum"><div class="wrapper"><div class="returnBtn" return-target="${breadCrumData.returnPath}"><span>${UiuxConfig.ICON_DAG_ARROW_LEFT}</span></div></div></li>`);
          let breadcrumParentsList = $('<div class="parents-items"></div>') ;
          breadCrumData.parentsLabels.forEach(labelItem => {
            breadcrumParentsList.append($(`<div class="parentLabel">${labelItem}</div>`)) ;
          });
          $(htmlBreadCrum[0].querySelector('div.wrapper')).append(breadcrumParentsList) ;
          Ul.append(htmlBreadCrum) ;
        }
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
      let image = element.icon != null ? `data-icon="${element.icon}" data-iconh="${element.highlightedIcon}"` :"" ;
      var selected = this.defaultValue.value == element.id ? ' selected="selected"' : "";
      let item = $(`<li value="${element.id}" data-id="${element.id}" data-parent="`+ parent +`" ${image} ${selected} ${element.tooltip} ${element.color}><span class="item-sel">${element.label}</span><span class="item-traverse">${UiuxConfig.ICON_DAG_ARROW_RIGHT}</span></li>`) ;
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
      this.htmlSelectUiUxLists = $(`<div class="htmlSelectUiUxLists"></div>`) ;
      this.htmlSelectUiUxBreadCrum = $(`<div class="htmlSelectUiUxBreadCrum"></div>`) ;
      this.htmlInputValueClass = $(`<input type="hidden" name="value-class" value="">`) ;
      this.htmlInputValuePath = $(`<input type="hidden" name="value-path" value="">`) ;
      this.htmlCurentValue = $('<span class="current">Chercher des ressources</span>') ;
      let initBreadcrumData: BreadCrumData = {
        parentsLabels: ['Tout'],
        returnPath: '',
      }

      this.buildClassSelectList(this.hierarchyData, 'root active-pane', '', initBreadcrumData) ;


      /*this.htmlCoreSelect = $("<select/>", {
        // open triggers the niceselect to be open
        class: "my-new-list input-val open",
        html: selectOptionList.join(""),
      });*/
      this.html = $('<div></div>');
      //this.html.append(this.htmlCoreSelect) ;
      let currentWrapper = $('<div class="currentWrapper"></div>') ;
      currentWrapper.append(this.htmlCurentValue) ;
      this.htmlSelectUiUx.append(currentWrapper) ;
      //this.htmlSelectUiUx.append(this.htmlSelectUiUxBreadCrum) ;
      this.htmlSelectUiUx.append(this.htmlSelectUiUxLists) ;
      this.htmlSelectUiUx.append(this.htmlInputValueClass) ;
      this.htmlSelectUiUx.append(this.htmlInputValuePath) ;
      this.html.append(this.htmlSelectUiUx) ;
      this.initClassSelector() ;
      this.displayClassSelector() ;

      this.htmlInputValueClass.on("change", () => {
        let selectedValue: any = this.htmlInputValueClass.val();
        this.value = selectedValue ;
        this.valuePath = this.htmlInputValuePath.val() as string;
        this.html[0].dispatchEvent(
          new CustomEvent("change", {
            bubbles: true,
            detail: {value: this.value, valuePath: this.valuePath},
          })
        );
        this.hideClassSelector() ;
      });

      return this.html.children();
    }

    /*parentIsAfter( parent:any, child:any ) {
        var all = this.htmlSelectUiUx[0].querySelectorAll('ul') ;
    
        for( var i = 0; i < all.length; ++i ) {
            if( all[i] === parent )
                return false;  
            else if( all[i] === child )
                return true;
        }
    }*/

    /*getParentsClass(idClass: string, parents: Array<string> = []): Array<string>  {
      let parent_class = this.htmlSelectUiUx[0].querySelector('li[value="'+idClass+'"]');
      let parent_id = parent_class.parentElement.getAttribute('parent') ;
      if (parent_id != '') {
        parents.push(parent_id);
        return this.getParentsClass(parent_id, parents);
      }
      return parents ;
    }*/

    /*addBreadcrumItem(idClass: string, label: string) {
      console.log('addBreadcrumItem start') ;
      console.log(idClass) ;
      let li_elements = this.htmlSelectUiUx[0].querySelectorAll('li');
      let ul_elements = this.htmlSelectUiUx[0].querySelectorAll('ul.active-pane');
      let parent_class = this.htmlSelectUiUx[0].querySelector('li[value="'+idClass+'"]');
      let parent_id = parent_class.parentElement.getAttribute('parent') ;
      console.log(this.breadcrumItems.indexOf(parent_id));
      console.log(ul_elements);
      console.log(this.breadcrumItems);
      console.log(parent_id);
      if ((this.breadcrumItems.length > 0) && (this.breadcrumItems.indexOf(parent_id) != this.breadcrumItems.length-1 )) {
        for (var i = 0; i < ul_elements.length; i++){
          if (i > this.breadcrumItems.indexOf(parent_id)+1) {
            ul_elements[i].classList.remove('active-pane');
            //let index_remove = this.breadcrumItems.indexOf(ul_elements[i].getAttribute('parent'));
            //this.breadcrumItems.splice(index_remove, 1);
          }
        }
        this.htmlSelectUiUx[0].querySelector('ul[parent="'+idClass+'"]').classList.add("active-pane");
      }
      if ((this.breadcrumItems.length > 0) && (this.breadcrumItems.indexOf(parent_id) == -1 )) {
        console.log('no parents selected') ;
        //no parent on selected breadcreaItems
        this.breadcrumItems = [] ;
        let parents = this.getParentsClass(idClass).reverse() ;
        this.breadcrumItems = parents ;
        this.htmlSelectUiUxBreadCrum[0].innerHTML = '';
        for (var i = 0; i < ul_elements.length; i++){
          if (i > 0) { // dont remove active pane on root
            ul_elements[i].classList.remove('active-pane');
            
            let index_remove = this.breadcrumItems.indexOf(ul_elements[i].getAttribute('parent'));
            this.breadcrumItems.splice(index_remove, 1);

          }
          
        }
        //Reinit pane and breadcrum intems
        for (var element of parents) {
          let parent_element = this.htmlSelectUiUx[0].querySelector('li[value="'+element+'"]');
          let new_item = $(`<div class="breadcrumItem" data-value="${element}">${parent_element.innerHTML}</div>`)
          
          this.htmlSelectUiUxBreadCrum[0].append(new_item[0]) ;
          let parent_list = parent_element.parentElement.classList.add('active-pane');

          new_item[0].addEventListener(
            "click",
            (e: CustomEvent) => {
              
      console.log('click start') ;
      console.log(e.currentTarget ) ;
              let class_target = (e.currentTarget  as any).getAttribute('data-value') ;
              //this.htmlSelectUiUx[0].querySelector('ul[parent="'+class_target+'"]').classList.add("active-pane");
              this.addBreadcrumItem(class_target, (e.currentTarget  as any).innerHTML ) ;
            }
          );
          
        }
          this.htmlSelectUiUx[0].querySelector('ul[parent="'+idClass+'"]').classList.add("active-pane");
      }


      this.breadcrumItems.push(idClass) ;
      let new_item = $(`<div class="breadcrumItem" data-value="${idClass}">${label}</div>`) ;
      this.htmlSelectUiUxBreadCrum[0].append(new_item[0]) ;
      new_item[0].addEventListener(
        "click",
        (e: CustomEvent) => {
          console.log('click start') ;
          console.log(e.currentTarget ) ;
          let class_target = (e.currentTarget  as any).getAttribute('data-value') ;
          //this.htmlSelectUiUx[0].querySelector('ul[parent="'+class_target+'"]').classList.add("active-pane");
          this.addBreadcrumItem(class_target, (e.currentTarget as any).innerHTML ) ;
        }
      );

      let Scroll_y = 0 ;
      console.log(this.breadcrumItems.length);
      if(this.breadcrumItems.length > 1) {
        Scroll_y = ((this.breadcrumItems.length * 200) - 200) ;
      }
      
      //Refesh actives panes list 
      ul_elements = this.htmlSelectUiUx[0].querySelectorAll('ul.active-pane');
      for( var arrayItem of this.breadcrumItems) {
        if (!this.htmlSelectUiUx[0].querySelector('ul[parent="'+arrayItem+'"]').classList.contains('active-pane')) {
          this.breadcrumItems.splice(this.breadcrumItems.indexOf(arrayItem), 1) ;
        }

      }

      // Update breadcrum items list
      for (var breadcrumItem of this.htmlSelectUiUx[0].querySelectorAll('div.breadcrumItem')) {
        console.log(breadcrumItem.getAttribute('data-value')) ;
        console.log(this.breadcrumItems) ;
        if(this.breadcrumItems.indexOf(breadcrumItem.getAttribute('data-value') )  == -1) {
          breadcrumItem.remove() ;
        }
      }

      //Display needed class List on main view
      let hide_befor = ul_elements.length - 2 ;
      let iter_to_hide = 0 ;
      for (var element_to_hide of ul_elements) {
        console.log(iter_to_hide +'<'+ hide_befor) ;
        if (iter_to_hide < hide_befor) {
          element_to_hide.classList.add("active-pane-hide-left") 
        } else {
          element_to_hide.classList.remove("active-pane-hide-left") 
        }
        iter_to_hide++ ;
      }
      
      console.log(Scroll_y);
      //this.htmlSelectUiUxLists[0].scrollLeft = Scroll_y ;
    }*/
  
  
    /*buildSelect_FirstStartClassGroup() {
      console.log('------------- test dag context buildSelect_FirstStartClassGroup -----------------')
      return this.buildClassSelectFromItems(
        this.specProvider.getEntitiesTreeInDomainOfAnyProperty(),
        null
      );
    }*/
  
    /*buildSelect_EndClassGroup(domainId: string) {
      // testing hierarchy
      // console.log(this.specProvider.getEntity(domainId).getConnectedEntitiesTree().toDebugString())
      return this.buildClassSelectFromItems(
        this.specProvider.getEntity(domainId).getConnectedEntitiesTree(),
        null
      );
    }*/
  
    /**
     * Return it with a single selected class inside
     */
    /*buildSelect_StartClassGroupInWhere(selectedClass:string) {
      
      return this.buildClassSelectFromItems(
        [selectedClass],
        null
      );
    }*/

    /*buildFlatClassList(elements:any[], list: any[]) {
  
      elements.forEach(element => {
        list.push(element);
        if (element.children.length > 0) {
          list = this.buildFlatClassList(element.children, list) ;
        }
      });
  
      return list ;
    }*/
  
    /*buildClassSelectFromItems(items:DagIfc<ISpecificationEntity>, default_value: string) {
      let list: Array<string> = [];
      this.htmlSelectUiUx = $(`<div class="htmlSelectUiUx"></div>`) ;
      this.htmlSelectUiUxLists = $(`<div class="htmlSelectUiUxLists"></div>`) ;
      this.htmlSelectUiUxBreadCrum = $(`<div class="htmlSelectUiUxBreadCrum"></div>`) ;
      let rootUl = $(`<ul class="root active-pane" parent=""></ul>`) ;
      let childs: Array<any> = [];
      let childsItems: Array<any> = [];
      
      console.log('----------------------test--------------') ;
      console.log(items) ;
      let flatList = this.buildFlatClassList(items.roots, list) ;


      for (var key in flatList) {
        console.log(flatList[key]);
        var val = flatList[key];
        var label = this.specProvider.getEntity(val.id).getLabel();
        var icon = this.specProvider.getEntity(val.id).getIcon();
        var highlightedIcon = this.specProvider.getEntity(val.id).getHighlightedIcon();
        var color = this.specProvider.getEntity(val.id).getColor();
        // var parent = this.specProvider.getEntity(val).getParents() as string;
        var parent = null;
  
        // highlighted icon defaults to icon
        if (!highlightedIcon || 0 === highlightedIcon.length) {
          highlightedIcon = icon;
        }
        let parent_class ='' ;
        
        let image = icon != null ? `data-icon="${icon}" data-iconh="${highlightedIcon}"` :""
        //var selected = (default_value == val)?'selected="selected"':'';
        var desc = this.specProvider.getEntity(val.id).getTooltip();
        var selected = default_value == val.id ? ' selected="selected"' : "";
        var description_attr = "";
        if (desc) {
          description_attr = ' data-desc="' + desc + '"';
        }
        var bgColor = color ? `style='background: ${color};'`:"";

        if (parent != undefined) {
          parent_class = ' data-parent="' + parent + '"';
          let parent_index = childs.indexOf(parent) ;
          console.log(childs.indexOf(parent)) ;
          if (! (parent_index >= 0)) {
            childs.push(parent) ;
            parent_index = childs.indexOf(parent);
            childsItems[parent_index] = [] ;
          } 
          childsItems[parent_index].push(`<li value="${val.id}" data-id="${val.id}" ${parent_class} ${image} ${selected} ${description_attr} ${bgColor}><span class="item-sel">${label}</span><span class="item-traverse"> > </span></li>`) ;
          
          
        } else {
          // Add root level items
          rootUl[0].append($(`<li value="${val.id}" data-id="${val.id}" ${parent_class} ${image} ${selected} ${description_attr} ${bgColor}><span class="item-sel">${label}</span><span class="item-traverse"> > </span></li>`)[0]) ;
        }
        list.push(`<option value="${val.id}" data-id="${val.id}" ${parent_class} ${image} ${selected} ${description_attr} ${bgColor}> ${label}</option>` );
      }

      this.htmlSelectUiUxLists.append(rootUl) ;
      //add childs level items
      console.log(childs) ;
      console.log(childsItems) ;
      for (var value of childs) {
        let blockChildItems = $(`<ul class="root-child" parent="${value}"></ul>`) ;
        let parent_index = childs.indexOf(value) ;
        console.log(parent_index) ;
        for (var child of childsItems[parent_index]) {
          blockChildItems[0].append($(child)[0]) ;
        }

        this.htmlSelectUiUxLists[0].append($(blockChildItems)[0]) ;
      }

      
  
      this.htmlCoreSelect = $("<select/>", {
        // open triggers the niceselect to be open
        class: "my-new-list input-val open",
        html: list.join(""),
      });this.htmlSelectUiUxBreadCrum
      this.html = $('<div></div>');
      this.html.append(this.htmlCoreSelect) ;
      this.htmlSelectUiUx.append(this.htmlSelectUiUxBreadCrum) ;
      this.htmlSelectUiUx.append(this.htmlSelectUiUxLists) ;
      this.html.append(this.htmlSelectUiUx) ;
      this.initClassSelector() ;
      return this.html.children();
    }*/
  }
  
  /*
  function isStartClassGroup(
    ParentComponent: HTMLComponent
  ): ParentComponent is StartClassGroup {
    return (
      (ParentComponent as unknown as StartClassGroup).baseCssClass ===
      "StartClassGroup"
    );
  } // https://www.typescriptlang.org/docs/handbook/advanced-types.html#user-defined-type-guards
  
  
  function isEndClassGroup(
    ParentComponent: HTMLComponent
  ): ParentComponent is EndClassGroup {
    return (
      (ParentComponent as unknown as EndClassGroup).baseCssClass ===
      "EndClassGroup"
    );
  } // https://www.typescriptlang.org/docs/handbook/advanced-types.html#user-defined-type-guards
  */
export default HierarchicalClassSelectBuilder;
