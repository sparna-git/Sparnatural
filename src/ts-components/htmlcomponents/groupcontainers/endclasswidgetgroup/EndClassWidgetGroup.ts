import { FilteringSpecificationProvider } from "../../../../FilteringSpecificationProvider";
import JsonLdSpecificationProvider from "../../../../JsonLdSpecificationProvider";
import GroupContenaire from "../GroupContenaire";
import ISettings from "../../../globals/ISettings";
import ObjectPropertyTypeWidget from "./ObjectPropertyTypeWidget";
import { AbstractValue } from "../../../../Query";
import Config from "../../../../SparnaturalConfig";
import UiuxConfig from "../../../../UiuxConfig";
import CriteriaGroup from "../CriteriaGroup";
import { eventProxiCriteria } from "../../../../SparnaturalComponents";


class EndClassWidgetGroup extends GroupContenaire {
    settings:ISettings
    selectedValues: Array<any>
    selectAllValue:boolean = true
    VALUE_SELECTION_WIDGETS = [
        Config.LIST_PROPERTY,
        Config.LITERAL_LIST_PROPERTY,
        Config.AUTOCOMPLETE_PROPERTY,
        Config.TREE_PROPERTY
    ];
	inputTypeComponent: ObjectPropertyTypeWidget;
    constructor(CriteriaGroupe:CriteriaGroup, settings:ISettings, specProvider:JsonLdSpecificationProvider){
        super("EndClassWidgetGroup",CriteriaGroupe,specProvider)
        this.settings = settings
        this.cssClasses={
            EndClassWidgetGroup: true,
            Created: false
        }
        this.inputTypeComponent = new ObjectPropertyTypeWidget(this, settings, specProvider) ;
    }

	

    /**
     * Called when the property/link between domain and range is selected, to init this.
     **/
    onObjectPropertyGroupSelected() {
		console.warn("onObjectPropertyGroupSelected()")
        // Affichage de la ligne des actions 
        this.parentCriteriaGroup.ComponentHtml.addClass('OnEdit') ;

		// IMPORTANT TODO refactor HtmlContainer. This will never be rendered
        this.inputTypeComponent.HtmlContainer.html = $(this.parentCriteriaGroup.EndClassGroup.html).find('.EditComponents') ;
        
        // binds a selection in an input widget with the display of the value in the line
        $(this.inputTypeComponent).on(
            'change',
            {
                arg1: this,
                arg2: 'onChange'
            },
            eventProxiCriteria
        );
        // binds a selection in an input widget with the display of the value in the line
        $(this.inputTypeComponent).on(
            'selectAll',
            {
                arg1: this,
                arg2: 'onSelectAll'
            },
            eventProxiCriteria
        );
		// IMPORTANT changed the reinsert and init after the function bining onchange. otherwise selectedValues are empty cause only in onChange they are getting filled
		if (this.parentCriteriaGroup.ActionsGroup.reinsert == true) {
            this.inputTypeComponent.reload() ;
        } else {
            this.inputTypeComponent.init() ;
        }
        
        if(this.parentCriteriaGroup.jsonQueryBranch != null) {
            var branch = this.parentCriteriaGroup.jsonQueryBranch;
            if (branch.line.values.length == 0) {
                if (branch.children.length == 0) {
                    if (this.inputTypeComponent.canHaveSelectAll()) {
                        this.onSelectAll() ;
                    }
                }
            } else {
                for (var key in branch.line.values) {
                    this.loadValue(branch.line.values[key]) ;
                }
            }
        } 
    }

    // input : the 'key' of the value to be deleted
		onremoveValue(e:any) {
			if(this.selectAllValue) {
				//unselect the endClass for view
				this.parentCriteriaGroup.EndClassGroup.onchangeViewVariable() ;
			}
			//On all case, selectAllValue will be set to false
			this.selectAllValue = false;
			
			var keyToBeDeleted = $(e.currentTarget).attr('value-data') ;
            this.selectedValues.filter((item)=>{
                return item.key != keyToBeDeleted
            }) //IMPORTANT check if this function works the same as the original one
			
			$(this.parentCriteriaGroup.html).find('.EndClassWidgetGroup .EndClassWidgetAddOrValue').show() ;
			$(this.parentCriteriaGroup.html).removeClass('onAddOrValue') ;

			$(e.currentTarget).parent('div').remove() ;

			//if jstree remove unselecteds term
			if (this.inputTypeComponent.widgetType == Config.TREE_PROPERTY) {
				this.inputTypeComponent.widgetComponent.jsTree.jstree('uncheck_node',  $(e.currentTarget).attr('value-data'));
			}
			//uncheck_node() 

			if(this.selectedValues.length < 1) {
				$(this.parentCriteriaGroup.ComponentHtml).removeClass('completed') ;
				$(this.parentCriteriaGroup.html).find('.EndClassWidgetGroup >.EndClassWidgetAddOrValue').remove() ;
				$(this.parentCriteriaGroup.html).parent('li').removeClass('WhereImpossible') ;
				// N'est plus à cacher, lutilisateur peut choisi d'afficher les valeurs
				//$(this.parentCriteriaGroup.html).parent('li').removeClass('hideEndClassProperty') ;
				
				// re-enable Where action if end class can be connected to others
				if (this.parentCriteriaGroup.EndClassGroup.specProvider.hasConnectedClasses(this.parentCriteriaGroup.EndClassGroup.value_selected)) {
					$(this.parentCriteriaGroup.html).parent('li').removeClass('WhereImpossible') ;
				} else {
					$(this.parentCriteriaGroup.html).parent('li').addClass('WhereImpossible') ;
				}

				// re-enable selection of property/link if there are multiple choices of properties
				if ($(this.parentCriteriaGroup.ObjectPropertyGroup.html).find('.input-val').find('option').length > 1 ) {
					$(this.parentCriteriaGroup.ObjectPropertyGroup.html).find('.input-val').removeAttr('disabled').niceSelect('update'); 
				} else {
					$(this.parentCriteriaGroup.ObjectPropertyGroup.html).find('.input-val').attr('disabled', 'disabled').niceSelect('update'); 
				}

				// re-init the widget to empty input field
				this.inputTypeComponent.reload() ;
			}

			$(this.parentCriteriaGroup).trigger( "EndClassWidgetGroupUnselected"  ) ;
			$(this.parentCriteriaGroup.thisForm_.sparnatural).trigger( "submit" ) ;

			this.initGeneralEvent(this.parentCriteriaGroup.thisForm_);
		} ;

        loadValue = function loadValue(value:any) {
			this.inputTypeComponent.loadedValue = AbstractValue.valueToWidgetValue(value) ;
			$(this.inputTypeComponent).trigger('change') ;
			//Value added don't reuse preloaded data.
			this.inputTypeComponent.loadedValue = null ;
		}

        onSelectAll() {
			console.log('onSelectAll()')
			var theValueLabel = '<span>'+this.settings.langSearch.SelectAllValues+'</span>';
			this.selectAllValue = true;
			let unselect = $('<span class="unselect" value-data="allValues"><i class="far fa-times-circle"></i></span>') ;
			if ($(this.parentCriteriaGroup.html).find('.EndClassWidgetGroup>div').length == 0) {
				$(this.parentCriteriaGroup.html).find('.EndClassWidgetGroup').append($('<div class="EndClassWidgetValue flexWrap"><div class="componentBackArrow">'+UiuxConfig.COMPONENT_ARROW_BACK+'</div><p>'+theValueLabel+'</p><div class="componentFrontArrow">'+UiuxConfig.COMPONENT_ARROW_FRONT+'</div></div>')).find('div').first().append(unselect) ;
			}

			unselect.on(
				'click',
				{	arg1: this,	arg2: 'onRemoveValue'},
				eventProxiCriteria
			);

			// disable the Where
			$(this.parentCriteriaGroup.html).parent('li').addClass('WhereImpossible') ;
			$(this.parentCriteriaGroup.html).find('.EndClassGroup>div').first().removeClass('newOr') ;

			//Add variable on results view
			if(!this.parentCriteriaGroup.EndClassGroup.notSelectForview) {
				if (this.parentCriteriaGroup.EndClassGroup.variableSelector == null) {
					this.parentCriteriaGroup.EndClassGroup.onchangeViewVariable() ;
				}
				
			}
			this.parentCriteriaGroup.initCompleted() ;
			
			$(this.parentCriteriaGroup).trigger( "EndClassWidgetGroupSelected" ) ;
			$(this.parentCriteriaGroup.thisForm_.sparnatural).trigger( "submit" ) ;
			this.initGeneralEvent(this.parentCriteriaGroup.thisForm_);
		}

        onChange() {
			console.warn("EndclasswidgetGroup on change called")
			var theValue = this.inputTypeComponent.getValue() ;
			// put span around with proper class if coming from a date widget
			
			if (theValue == null ) {
				return false ;
			}
			var new_items = [] ;
			if (
				this.inputTypeComponent.widgetType == Config.TREE_PROPERTY
				&&
				// when loading the value from a saved query, the value is not an array, it is
				// a simple value.
				Array.isArray(theValue)
			) {
				for (var node in theValue) {
					var selected = false ;
					// if the same value is already selected, don't do anything
					for (var item in this.selectedValues) {
						if(this.selectedValues[item].key == theValue[node].id) {
							selected = true ;
						}
					}
					if (selected == false) {
						new_items.push(theValue[node]) ;
						this.selectedValues.push(theValue[node]) ;
					}
				}
				//Check if values removed
				for (var item in this.selectedValues) {
					var selected = false ;
					for (var node in theValue) {
						if(this.selectedValues[item].key == theValue[node].id) {
							selected = true ;
						}
					}
					if (selected == false){
						$(this.parentCriteriaGroup.html).find('.EndClassWidgetGroup span[value-data="'+this.selectedValues[item].key+'"]').first().trigger('click') ;
					}
				}

			} else {
				// if the same value is already selected, don't do anything
				for (var item in this.selectedValues) {
					if(this.selectedValues[item].key == theValue.key) {
						return false;
					}
				}
				new_items.push(theValue) ;
				this.selectedValues.push(theValue) ;	
			}
			
			// var value_data = (Array.isArray(theValue))?theValue.toString():theValue;

			for (var new_item in new_items) {
				theValue = new_items[new_item] ;

				var theValueLabel = '<span'+((theValue.start || theValue.stop)?' class="label-two-line"':'')+'>' + theValue.label + '</span>';

				let unselect = $('<span class="unselect" value-data="'+theValue.key+'"><i class="far fa-times-circle"></i></span>') ;
				if ($(this.parentCriteriaGroup.html).find('.EndClassWidgetGroup>div').length == 0) {
					// set a tooltip if the label is a bit long
					var tooltip = (theValue.label.length > 25)?'title="'+theValue.label+'"':"";
					$(this.parentCriteriaGroup.html).find('.EndClassWidgetGroup').append($('<div class="EndClassWidgetValue flexWrap"><div class="componentBackArrow">'+UiuxConfig.COMPONENT_ARROW_BACK+'</div><p '+tooltip+'>'+theValueLabel+'</p><div class="componentFrontArrow">'+UiuxConfig.COMPONENT_ARROW_FRONT+'</div></div>')).find('div').first().append(unselect) ;

					if ( this.VALUE_SELECTION_WIDGETS.indexOf(this.inputTypeComponent.widgetType) !== -1 ) {
						//if ($(this.parentCriteriaGroup.html).find('.EndClassWidgetGroup>div').length == 1) { Now is sures, we have one
							$(this.parentCriteriaGroup.html).find('.EndClassWidgetGroup').append('<div class="EndClassWidgetAddOrValue flexWrap"><div class="componentBackArrow">'+UiuxConfig.COMPONENT_ARROW_BACK+'</div><p><span>+</span></p><div class="componentFrontArrow">'+UiuxConfig.COMPONENT_ARROW_FRONT+'</div></div>') ;
							// hook a click on the plus to the needAddOrValue function
							$(this.parentCriteriaGroup.html).find('.EndClassWidgetGroup>.EndClassWidgetAddOrValue').on(
								'click',
								{arg1: this, arg2: 'onAddOrValue'},
								eventProxiCriteria
							);
						//}
					}

				} else {
					var temp_html = $('<div class="EndClassWidgetValue flexWrap"><div class="componentBackArrow">'+UiuxConfig.COMPONENT_ARROW_BACK+'</div><p>'+theValueLabel+'</p><div class="componentFrontArrow">'+UiuxConfig.COMPONENT_ARROW_FRONT+'</div></div>').append(unselect)  ;
					$(this.parentCriteriaGroup.html).find('.EndClassWidgetGroup >.EndClassWidgetAddOrValue').before(temp_html) ;
				}

				// binds a click on the remove cross with the removeValue function
				unselect.on(
					'click',
					{	arg1: this,	arg2: 'onRemoveValue'	},
					eventProxiCriteria
				);
			}

			// disable the Where
			$(this.parentCriteriaGroup.html).parent('li').addClass('WhereImpossible') ;
			$(this.parentCriteriaGroup.html).removeClass('onAddOrValue') ;
			
			this.parentCriteriaGroup.initCompleted() ;
			
			$(this.parentCriteriaGroup).trigger( "EndClassWidgetGroupSelected" ) ;
			$(this.parentCriteriaGroup.thisForm_.sparnatural).trigger( "submit" ) ;
			
			

			//Plus d'ajout possible si nombre de valeur suppérieur à l'option maxOr
			if (this.selectedValues.length == this.settings.maxOr) {
				$(this.parentCriteriaGroup.html).find('.EndClassWidgetGroup .EndClassWidgetAddOrValue').hide() ;
			}

			if (this.selectedValues.length > 0 ) {
				$(this.parentCriteriaGroup.ObjectPropertyGroup.html).find('.input-val').attr('disabled', 'disabled').niceSelect('update'); 
			}
			
			$(this.parentCriteriaGroup.html).find('.EndClassGroup>.EditComponents').removeClass('newOr') ;

			this.initGeneralEvent(this.parentCriteriaGroup.thisForm_);
		};


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
export default EndClassWidgetGroup