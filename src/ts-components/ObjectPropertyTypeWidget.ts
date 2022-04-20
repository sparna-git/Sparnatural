import { FilteringSpecificationProvider } from "../FilteringSpecificationProvider";
import { GroupContenaire, HTMLComponent } from "../SparnaturalComponents";
import ISettings from "./ISettings";
import Config from "../SparnaturalConfig";

/**
 *  Selects the value for a range in a criteria/line, using a value selection widget
 **/
 class ObjectPropertyTypeWidget extends GroupContenaire {
    specProvider:FilteringSpecificationProvider;
    settings: ISettings;
    htmlContainer: any;
    widgetType: string | null = null;
    widgetHtml: null | string = null;
    objectPropertyId: any;
    rangeClassId: any;
    classLabel: string;
    add_all = true
    add_or = true
    loadedValue:{
        key?: any;
        label?: any;
        uri?: any;
        start?: any;
        stop?: any;
        search?: any;
        boolean?: any;
    } | null = null ;

    constructor(ParentComponent: GroupContenaire, settings: ISettings, specProvider:FilteringSpecificationProvider){
        super("ObjectPropertyTypeWidget",GroupContenaire)
        this.specProvider = specProvider;
        this.settings = settings;
        this.htmlContainer = ParentComponent
        this.objectPropertyId = ParentComponent.parentCriteriaGroup.ObjectPropertyGroup.value_selected
        this.widgetType = specProvider.getObjectPropertyType(this.objectPropertyId);
        this.rangeClassId = ParentComponent.parentCriteriaGroup.EndClassGroup.value_selected
        this.classLabel = specProvider.getLabel(this.rangeClassId) ;
    }

    init(){
        super.init() // IMPORTANT : check if this actually does the same thing like in the original code
        let endLabel:string
        // if non selectable, simply exit
			if (
				this.widgetType == Config.NON_SELECTABLE_PROPERTY
			) {
				if(this.specProvider.isLiteralClass(this.parentComponent.parentCriteriaGroup.EndClassGroup.value_selected)) {
					this.parentComponent.parentCriteriaGroup.initCompleted() ;

					//Add variable on results view
					if(!this.parentComponent.parentCriteriaGroup.EndClassGroup.notSelectForview) {
						this.parentComponent.parentCriteriaGroup.EndClassGroup.onchangeViewVariable() ;
					}

					this.add_all = false;
					
					
				
					//$(this.ParentComponent.parentCriteriaGroup).trigger( {type:"EndClassWidgetGroupSelected" } ) ;
					$(this.parentComponent.parentCriteriaGroup.thisForm_.sparnatural).trigger( "submit" ) ;
					this.initGeneralEvent(this.parentComponent.parentCriteriaGroup.thisForm_);					
				}
				//var endLabel = null ; //Imporant is this still necessary?
				this.add_or = false;

				//return true;
			} else { // pour les autres type de widgets
				if (
					this.widgetType == Config.SEARCH_PROPERTY
					||
					this.widgetType == Config.STRING_EQUALS_PROPERTY
					||
					this.widgetType == Config.GRAPHDB_SEARCH_PROPERTY
					||
					this.widgetType == Config.TREE_PROPERTY
				) {
					// label of the "Search" pseudo-class is inserted alone in this case
					endLabel = this.classLabel;
				} else if(
					this.widgetType == Config.LIST_PROPERTY
					||
					this.widgetType == Config.TIME_PROPERTY_DATE
					||
					this.widgetType == Config.TIME_PROPERTY_YEAR
				){
					endLabel = this.settings.langSearch.Select+" :" ;
				} else if(this.widgetType == Config.BOOLEAN_PROPERTY) {
					endLabel = "" ;
				} else {
					endLabel = this.settings.langSearch.Find+" :" ;
				}
			}

    }



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

export default ObjectPropertyTypeWidget