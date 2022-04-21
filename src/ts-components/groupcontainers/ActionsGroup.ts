import { FilteringSpecificationProvider } from "../../FilteringSpecificationProvider";

import ActionAnd from "./ActionAnd";
import ActionRemove from "./ActionRemove";
import ActionWhere from "../htmlcomponents/ActionWhere";
import CriteriaGroup from "./CriteriaGroup";
import ISettings from "../ISettings";
import * as SparnaturalComponents from "../../SparnaturalComponents.js"; //IMPORTANT : double import?
import GroupContenaire from "./GroupContenaire";
import HTMLComponent from "../htmlcomponents/HtmlComponent";
import JsonLdSpecificationProvider from "../../JsonLdSpecificationProvider";
import { RDFSpecificationProvider } from "../../RDFSpecificationProvider";


/**
	 * Groups all the actions on a line/criteria (AND / REMOVE / WHERE)
	 * even if they are visually not connected
	 **/
class ActionsGroup extends GroupContenaire {
    actions: {ActionWhere:ActionWhere,
        ActionAnd:ActionAnd,
        ActionRemove:ActionRemove};
    reinsert = false;
    settings:ISettings
    constructor(parentGroup:HTMLComponent, specProvider:JsonLdSpecificationProvider | RDFSpecificationProvider, settings:ISettings){
        super("ActionsGroup",parentGroup, specProvider)
        this.cssClasses = {
            ActionsGroup: true,
            Created : false
        }
        this.actions =  { 
            ActionWhere: new ActionWhere(this, specProvider,settings),
            ActionAnd: new ActionAnd(this,settings,specProvider),
            ActionRemove: new ActionRemove(this,specProvider)
        } ;

        this.settings = settings
        this.init()
    }
    onCreated = ()=> {
        this.actions.ActionRemove.init() ;
        
        $(this.actions.ActionRemove.html).find('a').on(
            'click',
            {
                arg1: this.parentCriteriaGroup,
                arg2: 'onRemoveCriteria'
            },
            SparnaturalComponents.eventProxiCriteria
        );

        if(this.parentCriteriaGroup.jsonQueryBranch != null) {
            var branch = this.parentCriteriaGroup.jsonQueryBranch;
            if(branch.children.length > 0) {
                $(this.actions.ActionWhere.html).find('a').trigger('click') ;
            }
            if(branch.nextSibling != null) {
                $(this.actions.ActionAnd.html).find('a').trigger('click') ;
            }
        }
    }

    onObjectPropertyGroupSelected = () => {
        this.actions.ActionWhere.HtmlContainer.html = $(this.parentCriteriaGroup.EndClassGroup.html).find('.EditComponents') ;
        if (this.reinsert == true) {
            this.actions.ActionWhere.reload() ;
            this.actions.ActionAnd.reload() ;
        } else {
            this.actions.ActionWhere.init() ;
            this.actions.ActionAnd.init() ;
            this.reinsert = true ;
        }			
        
        $(this.actions.ActionWhere.html).find('a').on(
            'click', 
            {
                arg1: this,
                arg2: 'onAddWhere'
            },
            SparnaturalComponents.eventProxiCriteria
        );
        $(this.actions.ActionAnd.html).find('a').on(
            'click',
            {
                arg1: this,
                arg2: 'onAddAnd'
            },
            SparnaturalComponents.eventProxiCriteria
        );
        
        this.initGeneralEvent(this.parentCriteriaGroup.thisForm_);
    }
    onAddWhere = ()=> {	
        this.parentCriteriaGroup.html.parent('li').addClass('haveWhereChild') ;
        this.parentCriteriaGroup.initCompleted() ;
        
        var new_component = this.addComponent(
            this.parentCriteriaGroup.thisForm_,
            this.parentCriteriaGroup.ComponentHtml,
            (this.parentCriteriaGroup.jsonQueryBranch && this.parentCriteriaGroup.jsonQueryBranch.children && this.parentCriteriaGroup.jsonQueryBranch.children.length > 0)?this.parentCriteriaGroup.jsonQueryBranch.children[0]:null
        ) ;
        
        // trigger 2 clicks to select the same class as the object class (?)
        $(new_component).find('.StartClassGroup .nice-select:not(.disabled)').trigger('click') ;
        $(new_component).find('.StartClassGroup .nice-select:not(.disabled)').trigger('click') ;
    }
    onAddAnd = () =>{
        var new_component = this.addComponent(
            this.parentCriteriaGroup.thisForm_,
            this.parentCriteriaGroup.AncestorComponentHtml,
            (this.parentCriteriaGroup.jsonQueryBranch)?this.parentCriteriaGroup.jsonQueryBranch.nextSibling:null
        ) ;
        
        // trigger 2 clicks to select the same class as the current criteria (?)
        $(new_component).find('.StartClassGroup .nice-select:not(.disabled)').trigger('click') ;
        $(new_component).find('.StartClassGroup .nice-select:not(.disabled)').trigger('click') ;

        return false ;			
    }

    addComponent(thisForm_: { sparnatural: any; submitOpened?: boolean; firstInit: any; preLoad?: boolean; }, contexte: any, jsonQueryBranch:any = null) {
		var new_index; //TODO : Refactor this index if else to a better solution...
		if (thisForm_.sparnatural.components.length > 0 ) {
			new_index = thisForm_.sparnatural.components[thisForm_.sparnatural.components.length-1].index + 1 ;
		} else {
			new_index = 0 ;
		}
		
		// disable the WHERE if we have reached maximum depth
		var classWherePossible = 'addWereEnable' ;
		if (($(contexte).parents('li.groupe').length + 1 ) == (this.settings.maxDepth - 1) ) {
			classWherePossible = 'addWereDisable' ;
		}
		
		var gabari = '<li class="groupe" data-index="'+new_index+'"><span class="link-and-bottom"><span>'+this.settings.langSearch.And+'</span></span><span class="link-where-bottom"></span><input name="a-'+new_index+'" type="hidden" value=""><input name="b-'+new_index+'" type="hidden" value=""><input name="c-'+new_index+'" type="hidden" value=""></li>' ;
		
		// si il faut descendre d'un niveau
		if ($(contexte).is('li')) {
			if ($(contexte).find('>ul').length == 0) {
				var ul = $('<ul class="childsList"><div class="lien-top"><span>'+this.settings.langSearch.Where+'</span></div></ul>').appendTo($(contexte)) ;
				var parent_li = $(ul).parent('li') ;
				var n_width = 0;
				n_width = n_width + this.getOffset( $(parent_li).find('>div>.EndClassGroup'), $(ul) ) - 111 + 15 + 11 + 20 + 5 + 3 ;
				var t_width = this.getOffset( $(parent_li).find('>div>.EndClassGroup'), $(ul) ) + 15 + 11 + 20 + 5  ;
				$(ul).attr('data-test', this.getOffset( $(parent_li).find('>div>.EndClassGroup'), $(ul) ) );
				$(ul).find('>.lien-top').css('width', n_width) ;
				$(parent_li).find('>.link-where-bottom').css('left', t_width) ;
			} else {
				var ul = $(contexte).find('>ul') ;
			}
			
			var gabariEl = $(gabari).appendTo(ul); //IMPORTANT :Introduced new var gabariEl
		} else {
			var gabariEl = $(gabari).appendTo(contexte) ; // IMPORTANT : Introduced new var gabariEl
		}
	
		$(gabariEl).addClass(classWherePossible) ;		
		
		var UnCritere = new CriteriaGroup(
			{ 
				AncestorHtmlContext: contexte,
				HtmlContext : gabari,
				FormContext: thisForm_,
				ContextComponentIndex: new_index
			},
			this.settings,
			this.specProvider,
			// pass the JSON query branch as an input parameter
			jsonQueryBranch
		);
		
		thisForm_.sparnatural.components.push({index: new_index, CriteriaGroup: UnCritere });			
		this.initGeneralEvent(thisForm_);
	
		//le critère est inséré et listé dans les composants, on peut lancer l'event de création
		$(UnCritere).trigger( "Created" ) ;
		if (thisForm_.firstInit == false) {
			thisForm_.firstInit = true ;
			$(thisForm_.sparnatural).trigger('initialised') ;
		}
		
	
		return $(gabari) ;
	}

    getOffset( elem: JQuery<HTMLElement>, elemParent: JQuery<HTMLElement> ) {
		return elem.offset()!.left - elemParent.offset()!.left ;
	} //TODO This function also exists as export in SparnaturalComponents

    initGeneralEvent(thisForm_: { sparnatural: any; }) {
		$('li.groupe').off( "mouseover" ) ;
		$('li.groupe').off( "mouseleave" ) ;
		$('li.groupe').on( "mouseover", function(event: { stopImmediatePropagation: () => void; }) {
			event.stopImmediatePropagation();
			$('li.groupe').removeClass('OnHover') ;
			$(this).addClass('OnHover') ;
			
		} );
		$('li.groupe').on( "mouseleave", function(event: { stopImmediatePropagation: () => void; }) {
			event.stopImmediatePropagation();
			$('li.groupe').removeClass('OnHover') ;
		} );
			/*background: linear-gradient(180deg, rgba(255,0,0,1) 0%, rgba(255,0,0,1) 27%, rgba(5,193,255,1) 28%, rgba(5,193,255,1) 51%, rgba(255,0,0,1) 52%, rgba(255,0,0,1) 77%, rgba(0,0,0,1) 78%, rgba(0,0,0,1) 100%); /* w3c */
			
		// var $all_li = $(thisForm_.sparnatural).find('li.groupe') ;
		var $all_li = $(thisForm_.sparnatural).find('li.groupe') ;
		var leng = $all_li.length ;
		if (leng  <= 10 ) {
			leng = 10 ;
		}
		var ratio = 100 / leng / 100 ;
		var prev = 0 ;
		var cssdef = 'linear-gradient(180deg' ; 
		let that = this //IMPORTANT : make this available in foreach function -> this.settings
		$all_li.each(function(index: number) {
			var a = (index + 1 ) * ratio ;
			var height = $(this).find('>div').outerHeight(true) ;
			if(height){
				cssdef += ', rgba('+that.settings.backgroundBaseColor+','+a+') '+prev+'px, rgba('+that.settings.backgroundBaseColor+','+a+') '+(prev+height)+'px' ;
				prev = prev + height+1 ;
				if ($(this).next().length > 0 ) {
					$(this).addClass('hasAnd') ;
					var this_li = $(this) ;
					
					var this_link_and = $(this).find('.link-and-bottom') ;
					var height = this_li.height()
					if(height){
						$(this_link_and).height(height) ;
					} else {
						console.warn("this_li.height() not found in $(this)")
					}
				} else {
						$(this).removeClass('hasAnd') ;
				}
			} else {
				console.warn("Height not found in parent element.")
			}
		});
	
		$(thisForm_.sparnatural).find('div.bg-wrapper').css({background : cssdef+')' }) ;
	
	}

    

}
export default ActionsGroup