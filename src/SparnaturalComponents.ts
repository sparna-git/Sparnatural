import tippy from 'tippy.js';
import {UiuxConfig} from "./UiuxConfig";
import * as SparnaturalComponents from "./SparnaturalComponents";
import ISettings from './ts-components/ISettings';
import GroupContenaire from './ts-components/groupcontainers/GroupContenaire';
import HTMLComponent from './ts-components/htmlcomponents/HtmlComponent';


/**
 * Builds a selector for a class based on provided domainId, by reading the
 * configuration. If the given domainId is null, this means we populate the first
 * class selection (starting point) so reads all classes that are domains of any property.
 * 
 **/
class ClassSelectBuilder {
	specProvider:any
	constructor(specProvider:any) {
		this.specProvider = specProvider;
	}

	buildClassSelect(domainId: any, inputID: string, default_value: any) {
		var list = [] ;
		var items = [] ;

		if(domainId === null) {
			// if we are on the first class selection
		 	items = this.specProvider.getClassesInDomainOfAnyProperty() ;
		} else {
			items = this.specProvider.getConnectedClasses(domainId) ;
		}

		for (var key in items) {
			var val = items[key];
			var label = this.specProvider.getLabel(val) ;
			var icon = this.specProvider.getIcon(val) ;
			var highlightedIcon = this.specProvider.getHighlightedIcon(val) ;

			// highlighted icon defaults to icon
			if (!highlightedIcon || 0 === highlightedIcon.length) {
				highlightedIcon = icon ;
			}
			
			var image = (icon != null)?' data-icon="' + icon + '" data-iconh="' + highlightedIcon + '"':'' ;
			//var selected = (default_value == val)?'selected="selected"':'';
			var desc = this.specProvider.getTooltip(val) ;
			var selected = (default_value == val)?' selected="selected"':'';
			var description_attr = '';
			if(desc) {
				description_attr = ' data-desc="'+desc+'"';
			} 
			list.push( '<option value="'+val+'" data-id="'+val+'"'+image+selected+' '+description_attr+'  >'+ label + '</option>' );
		}

		var html_list = $( "<select/>", {
			"class": "my-new-list input-val",
			"id": 'select-'+inputID,
			html: list.join( "" )
		  });

		return html_list ;
	}
}


/**
 * 
 **/
 class OptionSelectBuilder {
	specProvider: any
	OptionTypeId: any
 	constructor(specProvider: any, OptionTypeId: any) {
 		this.specProvider = specProvider;
		this.OptionTypeId = OptionTypeId ;
 	}		

	buildOptionSelect(objectId: any, inputID: string, default_value: { [x: string]: any; optional?: boolean; notExists?: boolean; }) {			
		let items:{optional?:string, notExists?:string} ;
		if(this.specProvider.isEnablingOptional(objectId)) {
			items['optional'] = this.OptionTypeId.parentComponent.parentCriteriaGroup.thisForm_.langSearch.labelOptionOptional ;
		}
		
		if(this.specProvider.isEnablingNegation(objectId)) {
			items['notExists'] = this.OptionTypeId.parentComponent.parentCriteriaGroup.thisForm_.langSearch.labelOptionNotExists ;
		}

		var list = [] ;
		for (const [key, value] of Object.entries(items)) {
			let label = value;
			let selected = (default_value[key]?' checked="checked"':'')
			list.push( '<label class="flexWrap"><input type="radio" name="'+inputID+'" data-id="'+key+'"'+selected+' '+'  />' + '<div class="componentBackArrow">' + UiuxConfig.COMPONENT_ARROW_BACK + '</div><span>'+ label + '</span><div class="componentFrontArrow">' + UiuxConfig.COMPONENT_ARROW_FRONT + '</div></label>' );
		  }

		var html_list = $( "<div/>", {
			"class": "optionsGroupe-list input-val flexWrap",
			"id": 'select-'+inputID,
			html: list.join( "" )
		});

		return html_list ;
	}
}


/**
 * Builds a selector for property based on provided domain and range, by reading the
 * configuration.
 **/
class PropertySelectBuilder {
	constructor(specProvider) {
		this.specProvider = specProvider;
	}

	buildPropertySelect(domainClassID, rangeClassID, inputID, default_value) {
		var list = [] ;
		var items = this.specProvider.getConnectingProperties(domainClassID,rangeClassID) ;
		
		for (var key in items) {
			var val = items[key];
			var label = this.specProvider.getLabel(val) ;
			var desc = this.specProvider.getTooltip(val) ;
			var selected = (default_value == val)?'selected="selected"':'';
			var description_attr = '';
			if(desc) {
				description_attr = ' data-desc="'+desc+'"';
			} 
			list.push( '<option value="'+val+'" data-id="'+val+'"'+selected+' '+description_attr+'  >'+ label + '</option>' );
		}

		var html_list = $( "<select/>", {
			"class": "select-list input-val",
			"id": inputID,
			html: list.join( "" )
		});
		return html_list ;
	}
}

/**
 * Utility function to find the criteria "above" a given criteria ID, being
 * either the "parent" in a WHERE criteria, or the "sibling"
 * in an AND criteria
 **/
export function findParentOrSiblingCriteria(thisForm_: { sparnatural: { components: any; }; }, id: string) {
	console.warn("searching for it...")
	let dependant:{type:any,element:any} = {
		type: null,
		element: null
	}
	var dep_id: string = null ;
	var element = $(thisForm_.sparnatural).find('li[data-index="'+id+'"]') ;
	
	if ($(element).parents('li').length > 0) {			
		dep_id = $($(element).parents('li')[0]).attr('data-index') ;
		dependant = {type : 'parent', element: null}  ;
	} else {
		if ($(element).prev().length > 0) {
			dep_id = $(element).prev().attr('data-index') ;
			dependant = {type : 'sibling', element: null}  ;				
		}
	} 

	$(thisForm_.sparnatural.components).each(function(index) {			
		if (this.index == dep_id) {
			console.log("forEach")
			dependant = {
				type: dependant.type,
				element: this.CriteriaGroup
			}
			console.log(dependant)
		} 
	}) ;
	console.log("end searchings")

	return dependant ;
}

export function eventProxiCriteria(e: { data: { arg1: any; arg2: any; }; }) {
	var arg1 = e.data.arg1;
	var arg2 = e.data.arg2;
	arg1[arg2](e) ;
}

export function localName(uri: string) {
	if (uri.indexOf("#") > -1) {
		return uri.split("#")[1] ;
	} else {
		var components = uri.split("/") ;
		return components[components.length - 1] ;
	}
}
export function redrawBottomLink(parentElementLi: JQuery<HTMLElement>) {
	var n_width = 0;
	var ul = $(parentElementLi).children('ul').first() ;
	if (ul.length == 1) {
		n_width = n_width + getOffset( $(parentElementLi).find('>div>.EndClassGroup'), $(ul) ) - 111 + 15 + 11 + 20 + 5 + 3 ;
		var t_width = getOffset( $(parentElementLi).find('>div>.EndClassGroup'), $(ul) ) + 15 + 11 + 20 + 5  ;
		$(ul).find('>.lien-top').css('width', n_width) ;
		$(parentElementLi).find('>.link-where-bottom').css('left', t_width) ;
	}
}
export function getOffset( elem: JQuery<HTMLElement>, elemParent: JQuery<HTMLUListElement> ) {
	return elem.offset().left - $(elemParent).offset().left ;
}