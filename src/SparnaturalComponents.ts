/**
 * Utility function to find the criteria "above" a given criteria ID, being
 * either the "parent" in a WHERE criteria, or the "sibling"
 * in an AND criteria
 **/
export function findParentOrSiblingCriteria(thisForm_: { sparnatural: { components: any; }; }, id: string) {
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
			dependant = {
				type: dependant.type,
				element: this.CriteriaGroup
			}
		} 
	}) ;

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