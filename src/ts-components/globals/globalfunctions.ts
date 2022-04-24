import CriteriaGroup from "../htmlcomponents/groupcontainers/CriteriaGroup";
import ISettings from "./ISettings";
import { getSettings } from "./settings";

export function addComponent(thisForm_: { sparnatural: any; submitOpened?: boolean; firstInit: any; preLoad?: boolean; }, contexte: any, jsonQueryBranch:any = null) {
    console.log(`Args: thisForm_:${thisForm_},contexts: ${contexte}, jsonQueryBranch: ${jsonQueryBranch}`)
    let index = thisForm_.sparnatural.components.length; // IMPORTANT check if this does the same as legacy code...
    
    // disable the WHERE if we have reached maximum depth
    var classWherePossible = 'addWereEnable' ;
    if (($(contexte).parents('li.groupe').length + 1 ) == (getSettings().maxDepth - 1) ) {
        classWherePossible = 'addWereDisable' ;
    }
    
    var gabari = '<li class="groupe" data-index="'+index+'"><span class="link-and-bottom"><span>'+getSettings().langSearch.And+'</span></span><span class="link-where-bottom"></span><input name="a-'+index+'" type="hidden" value=""><input name="b-'+index+'" type="hidden" value=""><input name="c-'+index+'" type="hidden" value=""></li>' ;
    
    // si il faut descendre d'un niveau
    if ($(contexte).is('li')) {
        if ($(contexte).find('>ul').length == 0) {
            var ul = $('<ul class="childsList"><div class="lien-top"><span>'+getSettings().langSearch.Where+'</span></div></ul>').appendTo($(contexte)) ;
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
            ContextComponentIndex: index
        },
        this.settings,
        this.specProvider,
        // pass the JSON query branch as an input parameter
        jsonQueryBranch
    );
    
    thisForm_.sparnatural.components.push({index: index, CriteriaGroup: UnCritere });			
    this.initGeneralEvent(thisForm_);

    //le critère est inséré et listé dans les composants, on peut lancer l'event de création
    $(UnCritere).trigger( "Created" ) ;
    if (thisForm_.firstInit == false) {
        thisForm_.firstInit = true ;
        $(thisForm_.sparnatural).trigger('initialised') ;
    }
    

    return $(gabari) ;
}

export function initGeneralEvent(thisForm_,settings:ISettings) {
    $('li.groupe').off( "mouseover" ) ;
    $('li.groupe').off( "mouseleave" ) ;
    $('li.groupe').on( "mouseover", function(event) {
        event.stopImmediatePropagation();
        $('li.groupe').removeClass('OnHover') ;
        $(this).addClass('OnHover') ;
        
    } );
    $('li.groupe').on( "mouseleave", function(event) {
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
    $all_li .each(function(index) {
        var a = (index + 1 ) * ratio ;
        var height = $(this).find('>div').outerHeight(true) ;
        cssdef += ', rgba('+settings.backgroundBaseColor+','+a+') '+prev+'px, rgba('+settings.backgroundBaseColor+','+a+') '+(prev+height)+'px' ;
        prev = prev + height+1 ;
        if ($(this).next().length > 0 ) {
            $(this).addClass('hasAnd') ;
            var this_li = $(this) ;
            
            var this_link_and = $(this).find('.link-and-bottom') ;
            
            $(this_link_and).height($(this_li).height() ) ;
        } else {
             $(this).removeClass('hasAnd') ;
        }
    });

    $(thisForm_.sparnatural).find('div.bg-wrapper').css({background : cssdef+')' }) ;

}