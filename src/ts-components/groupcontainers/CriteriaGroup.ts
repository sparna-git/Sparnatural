import ActionsGroup from "../actions/ActionsGroup";
import ISettings from "../ISettings";
import GroupContenaire from "./GroupContenaire";
import StartClassGroup from "./startendclassgroup/StartClassGroup";
import { OptionsGroup } from "./OptionsGroup";
import ObjectPropertyGroup from "./ObjectPropertyGroup";
import EndClassGroup from "./startendclassgroup/EndClassGroup";
import { findParentOrSiblingCriteria } from "../../SparnaturalComponents";
/**
* A single line/criteria
**/

class CriteriaGroup {
    thisForm_ :any;
    ComponentHtml:any;
    AncestorComponentHtml:any;
    settings:any;
    // JSON query line from which this line needs to be initialized
    jsonQueryBranch:any;
    context:{ AncestorHtmlContext: any; HtmlContext: any; FormContext: any; ContextComponentIndex: any;  }
    id:any;
    html:any;
    // create all the elements of the criteria
    StartClassGroup:any;
    OptionsGroup:any;
    ObjectPropertyGroup:any;
    EndClassGroup:any;
    EndClassWidgetGroup:any;
    ActionsGroup:any;
    specProvider:any;
    ParentComponent:any
    constructor(ParentComponent:any,context: { AncestorHtmlContext: any; HtmlContext: any; FormContext: any; ContextComponentIndex: any; }, settings: ISettings, specProvider: any, jsonQueryBranch:any){
       // IMPORTANT Check what has to come into the constructor
        this.ParentComponent = ParentComponent
        this.context = context
        this.thisForm_ = context.FormContext ;
        this.ComponentHtml = context.HtmlContext ;
        this.AncestorComponentHtml = context.AncestorHtmlContext ;
        this.jsonQueryBranch = jsonQueryBranch;
        //TODO: Refactor to have only context variable and not for example this.thisForm_ = context.FormContext
        this.id = context.ContextComponentIndex ;
        this.html = $('<div id="CriteriaGroup-'+this.id+'" class="CriteriaGroup"></div>').appendTo(this.ComponentHtml)
        // create all the elements of the criteria
        this.StartClassGroup = new StartClassGroup(this, specProvider, settings) ;
        this.OptionsGroup = new OptionsGroup(this, specProvider) ;
        this.ObjectPropertyGroup = new ObjectPropertyGroup(this, specProvider, settings, settings.langSearch.ObjectPropertyTemporaryLabel) ;
        this.EndClassGroup = new EndClassGroup(this, specProvider, settings) ;
        this.EndClassWidgetGroup = {}//new EndClassWidgetGroup(this, this.settings, specProvider) ;
        this.ActionsGroup = new ActionsGroup(this, specProvider,settings) ;
        this.assembleComponents()
    }
    //this._this = this ; IMPORTANT : unused var?
    children:Array<any> = [];

    cssClasses = {
        HasAllComplete : false,
        IsOnEdit : false
    } 
    
    assembleComponents = () => {
        // hook all components together
        $(this).on('StartClassGroupSelected', function () { this.ObjectPropertyGroup.onStartClassGroupSelected(); });
        $(this).on('StartClassGroupSelected', function () { this.EndClassGroup.onStartClassGroupSelected(); });
        $(this).on('Created', function () { this.StartClassGroup.onCreated(); });
        $(this).on('EndClassGroupSelected', function () { this.ObjectPropertyGroup.onEndClassGroupSelected(); });
        $(this).on('ObjectPropertyGroupSelected', function () { this.EndClassWidgetGroup.onObjectPropertyGroupSelected(); });
        $(this).on('ObjectPropertyGroupSelected', function () { this.OptionsGroup.onObjectPropertyGroupSelected(); });
        $(this).on('Created', function () { this.ActionsGroup.onCreated(); });
        $(this).on('ObjectPropertyGroupSelected', function () {	this.ActionsGroup.onObjectPropertyGroupSelected();  });

    }

    onRemoveCriteria = () => {
        var index_to_remove = this.id ;

        //RemoveSelectedVariable names 
        if (this.EndClassGroup.variableSelector != null) {
            this.EndClassGroup.variableSelector.remove() ;
            this.EndClassGroup.variableSelector = null;
        }
        //Remove option selected if enbled
        if ($(this.html).parents('li').first().hasClass('optionEnabled')) {
            $(this.html).parents('li').first().parents('li.groupe').each(function() {
                $(this).find('>div>.OptionsGroup .EditComponents').first().addClass('Enabled') ;
                $(this).find('>div>.OptionsGroup .EditComponents').first().removeClass('Disabled') ;
            });
            $(this.html).parents('li').first().find('li.groupe').each(function() {
                $(this).find('>div>.OptionsGroup .EditComponents').first().addClass('Enabled') ;
                $(this).find('>div>.OptionsGroup .EditComponents').first().removeClass('Disabled') ;
            });
        }
        // iterate on every "line" in the query
        $(this.thisForm_.sparnatural.components).each(function() {
            var parentOrSibling = findParentOrSiblingCriteria(this.CriteriaGroup.thisForm_, this.index ) ;
            if ((parentOrSibling.type != null) && (parentOrSibling.type == 'parent' && parentOrSibling.element != null)){
                // if the line is a child of the one to remove, remove it too
                var el = parentOrSibling.element as CriteriaGroup
                if (el.id === index_to_remove) {
                    this.CriteriaGroup.onRemoveCriteria() ;
                }
            }
        }) ;
        
        var formObject = this.thisForm_ ;
        var formContextHtml = this.AncestorComponentHtml;
        
        // fetch parentOrSibling _before_ removing HTML and removing
        // component from list !!
        var parentOrSibling = findParentOrSiblingCriteria(this.thisForm_, this.id ) ;

        // remove event listeners
        this.ComponentHtml.outerHTML = this.ComponentHtml.outerHTML; // IMPORTANT : does that actually do something?
        // remove the HTML
        $(this.ComponentHtml).remove() ;
        
        var iteration_to_remove = 0 ;
        $(this.thisForm_.sparnatural.components).each(function(i: number) {					
            if (this.index === index_to_remove){					
                iteration_to_remove = i ;
            }
        }) ;
        // remove from list of components
        this.thisForm_.sparnatural.components.splice(iteration_to_remove , 1);
        
        
        if (this.thisForm_.sparnatural.components.length == 0) {
            // top-level criteria : add first criteria and trigger click on class selection
            var jsonQueryBranch = null;
            // if this is the very first criteria and there is a query to read, start from
            // the first branch
            if(this.thisForm_.preLoad !== false) {
                jsonQueryBranch = this.thisForm_.preLoad.branches[0];
            }

            $('.variablesOtherSelect .sortableItem').remove() ;

            var new_component = this.addComponent(formObject, formContextHtml, jsonQueryBranch) ;			
            $(new_component).find('.StartClassGroup .nice-select:not(.disabled)').trigger('click') ;				
        } else {
            if (parentOrSibling.element !== null) {
                var dependantComponent = parentOrSibling.element ;
                if(dependantComponent){
                    if ($(dependantComponent.ComponentHtml).find('li.groupe').length > 0) {
                    
                    } else {
                        //Si pas d'enfant, on reaffiche le where action						
                        if ($(dependantComponent.ComponentHtml).hasClass('haveWhereChild') ) {
                            $(dependantComponent.ComponentHtml).removeClass('haveWhereChild') ;
                            $(dependantComponent.ComponentHtml).removeClass('completed') ;
                        }
                        $(dependantComponent.ComponentHtml).find('>ul.childsList').remove() ;
                    }
                }
                
            }

            // re-submit form after deletion
            this.initGeneralEvent(formObject) ;
            $(this.thisForm_.sparnatural).trigger( "submit" ) ;
        }
        
        return false ;
    }	

    initCompleted =  () => {
        $(this.html).parent('li').addClass('completed') ;
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
			this,
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

  
    // trigger the init event
    //$(this).trigger( {type:"Created" } ) ; // TODO : delete unused code
    
    
}
export default CriteriaGroup