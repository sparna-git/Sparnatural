import { getSettings } from "../../../../../settings/defaultSettings";
import { Config } from "../../../../../ontologies/SparnaturalConfig";
import { SelectedVal } from "../../../../SelectedVal";
import HTMLComponent from "../../../../HtmlComponent";
import ISparnaturalSpecification from "../../../../../spec-providers/ISparnaturalSpecification";
import StartClassGroup from "./StartClassGroup";
import EndClassGroup from "./EndClassGroup";
import { WidgetValue } from "../../../../widgets/AbstractWidget";
import { I18n } from "../../../../../settings/I18n";



/**
 * Builds a selector for a class based on provided domainId, by reading the
 * configuration. If the given domainId is null, this means we populate the first
 * class selection (starting point) so reads all classes that are domains of any property.
 *
 **/
class HierarchicalClassSelectBuilder extends HTMLComponent {
    specProvider: ISparnaturalSpecification;
    html: JQuery<HTMLElement>; 
    htmlCoreSelect: JQuery<HTMLElement>; 
    htmlSelectUiUx: JQuery<HTMLElement>; 
    htmlSelectUiUxBreadCrum: JQuery<HTMLElement>; 
    htmlSelectUiUxLists: JQuery<HTMLElement>; 
    breadcrumItems: Array<string> = [];
    constructor(ParentComponent: HTMLComponent, specProvider: ISparnaturalSpecification) {
      super("HierarchicalClassSelectBuilder", ParentComponent, null);
      this.specProvider = specProvider;
    }
  
    render(): this {
      super.render();
      return this;
    }

    parentIsAfter( parent:any, child:any ) {
        var all = this.htmlSelectUiUx[0].querySelectorAll('ul') ;
    
        for( var i = 0; i < all.length; ++i ) {
            if( all[i] === parent )
                return false;  
            else if( all[i] === child )
                return true;
        }
    }

    getParentsClass(idClass: string, parents: Array<string> = []): Array<string>  {
      let parent_class = this.htmlSelectUiUx[0].querySelector('li[value="'+idClass+'"]');
      let parent_id = parent_class.parentElement.getAttribute('parent') ;
      if (parent_id != '') {
        parents.push(parent_id);
        return this.getParentsClass(parent_id, parents);
      }
      return parents ;
    }

    addBreadcrumItem(idClass: string, label: string) {
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
            /*let index_remove = this.breadcrumItems.indexOf(ul_elements[i].getAttribute('parent'));
            this.breadcrumItems.splice(index_remove, 1);*/
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
    }

    initClassSelector() {
      console.log('initClassSelector') ;
      console.log(this.html) ;
      console.log(this.htmlCoreSelect) ;
      /*Search class with childs*/ 
      let li_elements = this.htmlSelectUiUx[0].querySelectorAll('li');
      let ul_elements = this.htmlSelectUiUx[0].querySelectorAll('ul') ;
      for (var element of li_elements) {
        let class_id = element.getAttribute('value') ;
        //Search in all ul if have parent attr with this class_id
        let hasChild = this.htmlSelectUiUx[0].querySelector('ul[parent="'+class_id+'"]');
        if (hasChild !== null) {
          element.classList.add("have-childs");
          // if parent is after in dom move before
          if(this.parentIsAfter( element.parentElement, hasChild ) ) {
            element.parentElement.before(hasChild);
          }
          element.querySelector('span.item-traverse');
          element.querySelector('span.item-traverse').addEventListener(
            "click",
            (e: CustomEvent) => {
              let class_target = (e.target as any).parentElement.getAttribute('value') ;
              this.htmlSelectUiUx[0].querySelector('ul[parent="'+class_target+'"]').classList.add("active-pane");
              this.addBreadcrumItem(class_target, (e.target as any).parentElement.innerHTML ) ;
            }
          );
          
        }

      }
    }
  
    buildSelect_FirstStartClassGroup() {
      return this.buildClassSelectFromItems(
        this.specProvider.getEntitiesInDomainOfAnyProperty(),
        null
      );
    }
  
    buildSelect_EndClassGroup(domainId: string) {
      return this.buildClassSelectFromItems(
        this.specProvider.getEntity(domainId).getConnectedEntities(),
        null
      );
    }
  
    /**
     * Return it with a single selected class inside
     */
    buildSelect_StartClassGroupInWhere(selectedClass:string) {
      return this.buildClassSelectFromItems(
        [selectedClass],
        null
      );
    }
  
    buildClassSelectFromItems(items:any[], default_value: string) {
      let list: Array<string> = [];
      this.htmlSelectUiUx = $(`<div class="htmlSelectUiUx"></div>`) ;
      this.htmlSelectUiUxLists = $(`<div class="htmlSelectUiUxLists"></div>`) ;
      this.htmlSelectUiUxBreadCrum = $(`<div class="htmlSelectUiUxBreadCrum"></div>`) ;
      let rootUl = $(`<ul class="root active-pane" parent=""></ul>`) ;
      let childs: Array<any> = [];
      let childsItems: Array<any> = [];
      for (var key in items) {
        console.log(items[key]);
        var val = items[key];
        var label = this.specProvider.getEntity(val).getLabel();
        var icon = this.specProvider.getEntity(val).getIcon();
        var highlightedIcon = this.specProvider.getEntity(val).getHighlightedIcon();
        var color = this.specProvider.getEntity(val).getColor();
        var parent = this.specProvider.getEntity(val).getParentClass() as string;
  
        // highlighted icon defaults to icon
        if (!highlightedIcon || 0 === highlightedIcon.length) {
          highlightedIcon = icon;
        }
        let parent_class ='' ;
        
        let image = icon != null ? `data-icon="${icon}" data-iconh="${highlightedIcon}"` :""
        //var selected = (default_value == val)?'selected="selected"':'';
        var desc = this.specProvider.getEntity(val).getTooltip();
        var selected = default_value == val ? ' selected="selected"' : "";
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
          childsItems[parent_index].push(`<li value="${val}" data-id="${val}" ${parent_class} ${image} ${selected} ${description_attr} ${bgColor}><span class="item-sel">${label}</span><span class="item-traverse"> > </span></li>`) ;
          
          
        } else {
          // Add root level items
          rootUl[0].append($(`<li value="${val}" data-id="${val}" ${parent_class} ${image} ${selected} ${description_attr} ${bgColor}><span class="item-sel">${label}</span><span class="item-traverse"> > </span></li>`)[0]) ;
        }
        list.push(`<option value="${val}" data-id="${val}" ${parent_class} ${image} ${selected} ${description_attr} ${bgColor}> ${label}</option>` );
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
    }
  }
  
  
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

export default HierarchicalClassSelectBuilder;
