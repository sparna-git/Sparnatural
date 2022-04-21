	/**
	 * Shows the selected values at the end of a criteria/line,
	 * and encapsulates the ObjectPropertyTypeWidget to select the values
	 **/
     function EndClassWidgetGroup(CriteriaGroupe, settings, specProvider) {
		this.base = GroupContenaire ;
		this.base() ;
		this.baseCssClass = "EndClassWidgetGroup";
		this.settings = settings;
		this.specProvider = specProvider;
		this.parentCriteriaGroup = CriteriaGroupe ;
		this.cssClasses.EndClassWidgetGroup = true ;
		this.cssClasses.Created = false ;
		this.selectedValues = [] ;
		
		this.inputTypeComponent = new ObjectPropertyTypeWidget(this, this.settings, specProvider) ;

		/**
		 * Called when the property/link between domain and range is selected, to init this.
		 **/
		this.onObjectPropertyGroupSelected = function() {
			// Affichage de la ligne des actions 
			this.parentCriteriaGroup.ComponentHtml.addClass('OnEdit') ;
			// determine widget type
			// this.widgetType = this.specProvider.getObjectPropertyType(this.parentCriteriaGroup.ObjectPropertyGroup.selectedValues);
			this.inputTypeComponent.HtmlContainer.html = $(this.parentCriteriaGroup.EndClassGroup.html).find('.EditComponents') ;
			
			if (this.parentCriteriaGroup.ActionsGroup.reinsert == true) {
				this.inputTypeComponent.reload() ;
			} else {
				this.inputTypeComponent.init() ;
			}

			// binds a selection in an input widget with the display of the value in the line
			$(this.inputTypeComponent).on(
				'change',
				{
					arg1: this,
					arg2: 'onChange'
				},
				SparnaturalComponents.eventProxiCriteria
			);
			// binds a selection in an input widget with the display of the value in the line
			$(this.inputTypeComponent).on(
				'selectAll',
				{
					arg1: this,
					arg2: 'onSelectAll'
				},
				SparnaturalComponents.eventProxiCriteria
			);
			
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
		this.onRemoveValue = function removeValue(e) {
			if(this.selectAllValue) {
				//unselect the endClass for view
				this.parentCriteriaGroup.EndClassGroup.onchangeViewVariable() ;
			}
			//On all case, selectAllValue will be set to false
			this.selectAllValue = false;
			
			var keyToBeDeleted = $(e.currentTarget).attr('value-data') ;
			for (var item in this.selectedValues) {
				if(this.selectedValues[item].key == keyToBeDeleted) {
					this.selectedValues.splice(item, 1); 
				}
			}
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

			$(this.parentCriteriaGroup).trigger( {type:"EndClassWidgetGroupUnselected" } ) ;
			$(this.parentCriteriaGroup.thisForm_.sparnatural).trigger( {type:"submit" } ) ;

			initGeneralEvent(this.parentCriteriaGroup.thisForm_);

		} ;

		this.loadValue = function loadValue(value) {
			this.inputTypeComponent.loadedValue = AbstractValue.valueToWidgetValue(value) ;
			$(this.inputTypeComponent).trigger('change') ;
			//Value added don't reuse preloaded data.
			this.inputTypeComponent.loadedValue = null ;
		}


		this.onSelectAll = function onSelectAll() {
			var theValueLabel = '<span>'+langSearch.SelectAllValues+'</span>';
			this.selectAllValue = true;
			this.unselect = $('<span class="unselect" value-data="allValues"><i class="far fa-times-circle"></i></span>') ;
			if ($(this.parentCriteriaGroup.html).find('.EndClassWidgetGroup>div').length == 0) {
				$(this.parentCriteriaGroup.html).find('.EndClassWidgetGroup').append($('<div class="EndClassWidgetValue flexWrap"><div class="componentBackArrow">'+UiuxConfig.COMPONENT_ARROW_BACK+'</div><p>'+theValueLabel+'</p><div class="componentFrontArrow">'+UiuxConfig.COMPONENT_ARROW_FRONT+'</div></div>')).find('div').first().append(this.unselect) ;
			}

			this.unselect.on(
				'click',
				{	arg1: this,	arg2: 'onRemoveValue'	},
				SparnaturalComponents.eventProxiCriteria
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
			
			$(this.parentCriteriaGroup).trigger( {type:"EndClassWidgetGroupSelected" } ) ;
			$(this.parentCriteriaGroup.thisForm_.sparnatural).trigger( {type:"submit" } ) ;
			initGeneralEvent(this.parentCriteriaGroup.thisForm_);
		}

		// sélection et affichage d'une valeur sélectionnée par un widget de saisie
		// la structure attendue est
		// {
		//   key : ... ,
		//   label: ... ,
		//   + soit 'uri', soit 'search', soit 'start' et 'stop' en fonction du widget
		// }
		this.onChange = function onChange() {
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

				this.unselect = $('<span class="unselect" value-data="'+theValue.key+'"><i class="far fa-times-circle"></i></span>') ;
				if ($(this.parentCriteriaGroup.html).find('.EndClassWidgetGroup>div').length == 0) {
					// set a tooltip if the label is a bit long
					var tooltip = (theValue.label.length > 25)?'title="'+theValue.label+'"':"";
					$(this.parentCriteriaGroup.html).find('.EndClassWidgetGroup').append($('<div class="EndClassWidgetValue flexWrap"><div class="componentBackArrow">'+UiuxConfig.COMPONENT_ARROW_BACK+'</div><p '+tooltip+'>'+theValueLabel+'</p><div class="componentFrontArrow">'+UiuxConfig.COMPONENT_ARROW_FRONT+'</div></div>')).find('div').first().append(this.unselect) ;

					if ( VALUE_SELECTION_WIDGETS.indexOf(this.inputTypeComponent.widgetType) !== -1 ) {
						//if ($(this.parentCriteriaGroup.html).find('.EndClassWidgetGroup>div').length == 1) { Now is sures, we have one
							$(this.parentCriteriaGroup.html).find('.EndClassWidgetGroup').append('<div class="EndClassWidgetAddOrValue flexWrap"><div class="componentBackArrow">'+UiuxConfig.COMPONENT_ARROW_BACK+'</div><p><span>+</span></p><div class="componentFrontArrow">'+UiuxConfig.COMPONENT_ARROW_FRONT+'</div></div>') ;
							// hook a click on the plus to the needAddOrValue function
							$(this.parentCriteriaGroup.html).find('.EndClassWidgetGroup>.EndClassWidgetAddOrValue').on(
								'click',
								{arg1: this, arg2: 'onAddOrValue'},
								SparnaturalComponents.eventProxiCriteria
							);
						//}
					}

				} else {
					var temp_html = $('<div class="EndClassWidgetValue flexWrap"><div class="componentBackArrow">'+UiuxConfig.COMPONENT_ARROW_BACK+'</div><p>'+theValueLabel+'</p><div class="componentFrontArrow">'+UiuxConfig.COMPONENT_ARROW_FRONT+'</div></div>').append(this.unselect)  ;
					$(this.parentCriteriaGroup.html).find('.EndClassWidgetGroup >.EndClassWidgetAddOrValue').before(temp_html) ;
				}

				// binds a click on the remove cross with the removeValue function
				this.unselect.on(
					'click',
					{	arg1: this,	arg2: 'onRemoveValue'	},
					SparnaturalComponents.eventProxiCriteria
				);
			}

			// disable the Where
			$(this.parentCriteriaGroup.html).parent('li').addClass('WhereImpossible') ;
			$(this.parentCriteriaGroup.html).removeClass('onAddOrValue') ;
			
			this.parentCriteriaGroup.initCompleted() ;
			
			$(this.parentCriteriaGroup).trigger( {type:"EndClassWidgetGroupSelected" } ) ;
			$(this.parentCriteriaGroup.thisForm_.sparnatural).trigger( {type:"submit" } ) ;
			
			

			//Plus d'ajout possible si nombre de valeur suppérieur à l'option maxOr
			if (this.selectedValues.length == settings.maxOr) {
				$(this.parentCriteriaGroup.html).find('.EndClassWidgetGroup .EndClassWidgetAddOrValue').hide() ;
			}

			if (this.selectedValues.length > 0 ) {
				$(this.parentCriteriaGroup.ObjectPropertyGroup.html).find('.input-val').attr('disabled', 'disabled').niceSelect('update'); 
			}
			
			$(this.parentCriteriaGroup.html).find('.EndClassGroup>.EditComponents').removeClass('newOr') ;

			initGeneralEvent(this.parentCriteriaGroup.thisForm_);
		};
		
		this.onAddOrValue = function needAddOrValue() {
			$(this.parentCriteriaGroup.html).find('.EndClassGroup>.EditComponents').addClass('newOr') ;
			$(this.parentCriteriaGroup.html).addClass('onAddOrValue') ;
			// On vide les champs de saisie du widget
			if (!this.inputTypeComponent.widgetType == Config.TREE_PROPERTY) {
				this.inputTypeComponent.reload() ;
			} else {
				//On avffiche de suite l'arbre. Car pas d'autre action possible
				$(this.inputTypeComponent.HtmlContainer.html).find('a.treeBtnDisplay').first().trigger('click') ;
			}
			
			initGeneralEvent(this.parentCriteriaGroup.thisForm_);
		};
		
		this.init() ;
		
	}
