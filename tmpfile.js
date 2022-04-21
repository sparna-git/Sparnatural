	/**
	 * Selects the value for a range in a criteria/line, using a value selection widget
	 **/	
     function ObjectPropertyTypeWidget(GroupContenaire, settings, specProvider) {
		this.baseCssClass = "ObjectPropertyTypeWidget";
		this.specProvider = specProvider;
		this.settings = settings;
		this.ParentComponent = GroupContenaire ;
		this.HtmlContainer = this.ParentComponent ;
		this.html = '<div></div>' ;
		this.tools = null ;
		this.widgetHtml = null ;
		this.widgetType = null ;
        		
		this.cssClasses = {
			ObjectPropertyTypeWidget : true,
			Created : false
		} ;
		this.loadedValue = null ;
		
		this.init = function init(reload = false) {
			if (!reload && this.cssClasses.Created) {
				this.tools.updateCssClasses() ;
				return true ;
			}

			// determine widget type
			var objectPropertyId = this.ParentComponent.parentCriteriaGroup.ObjectPropertyGroup.value_selected;
			this.widgetType = this.specProvider.getObjectPropertyType(objectPropertyId);

			
			var add_all = true;
			var add_or = true;

			// determine label and bit of HTML to select value
			var rangeClassId = this.ParentComponent.parentCriteriaGroup.EndClassGroup.value_selected
			var classLabel = specProvider.getLabel(rangeClassId) ;

			// if non selectable, simply exit
			if (
				this.widgetType == Config.NON_SELECTABLE_PROPERTY
			) {
				if(this.specProvider.isLiteralClass(this.ParentComponent.parentCriteriaGroup.EndClassGroup.value_selected)) {
					this.ParentComponent.parentCriteriaGroup.initCompleted() ;

					//Add variable on results view
					if(!this.ParentComponent.parentCriteriaGroup.EndClassGroup.notSelectForview) {
						this.ParentComponent.parentCriteriaGroup.EndClassGroup.onchangeViewVariable() ;
					}

					add_all = false;
					
					
				
					//$(this.ParentComponent.parentCriteriaGroup).trigger( {type:"EndClassWidgetGroupSelected" } ) ;
					$(this.ParentComponent.parentCriteriaGroup.thisForm_.sparnatural).trigger( {type:"submit" } ) ;
					initGeneralEvent(this.ParentComponent.parentCriteriaGroup.thisForm_);					
				}
				var endLabel = false ;
				add_or = false;

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
					var endLabel = classLabel;
				} else if(
					this.widgetType == Config.LIST_PROPERTY
					||
					this.widgetType == Config.TIME_PROPERTY_DATE
					||
					this.widgetType == Config.TIME_PROPERTY_YEAR
				){
					var endLabel = langSearch.Select+" :" ;
				} else if(this.widgetType == Config.BOOLEAN_PROPERTY) {
					var endLabel = "" ;
				} else {
					var endLabel = langSearch.Find+" :" ;
				}
			}

			var parenthesisLabel = ' ('+classLabel+') ';
			if(this.widgetType == Config.BOOLEAN_PROPERTY) {
				parenthesisLabel = " " ;
			}

			//Ajout de l'option all si pas de valeur déjà selectionées
			var selcetAll = "";
			if (this.ParentComponent.parentCriteriaGroup.EndClassWidgetGroup.selectedValues.length == 0) {
				if (add_all) {
					selcetAll = '<span class="selectAll"><span class="underline">'+langSearch.SelectAllValues+'</span>'+parenthesisLabel+'</span>' ;
				}
				if (add_all && add_or) {
					selcetAll += '<span class="or">'+langSearch.Or+'</span> ';
				}
			}
			
			var widgetLabel = '<span class="edit-trait first"><span class="edit-trait-top"></span><span class="edit-num">1</span></span>'+ selcetAll  ;

			if (endLabel) {
				widgetLabel += '<span>'+ endLabel+'</span>' ;
			}
			
			// init HTML by concatenating bit of HTML + widget HTML
			this.createWidgetComponent(
				this.widgetType,
				objectPropertyId,
				rangeClassId
			) ;

			if (this.widgetType == Config.NON_SELECTABLE_PROPERTY) {
				this.widgetHtml = widgetLabel ;
			} else {
				this.widgetHtml = widgetLabel + this.widgetComponent.html ;
			}

			var this_component = this;
			
			

			this.cssClasses.IsOnEdit = true ;
			this.tools = new GenericTools(this) ;
			this.tools.initHtml() ;
			this.tools.attachHtml() ;

			this.widgetComponent.init() ;
			this.cssClasses.Created = true ;
			$(this.html).find('.selectAll').first().on("click", function() {
				$(this_component).trigger('selectAll') ;
			});

		}

		this.canHaveSelectAll = function canHaveSelectAll() {
			if (this.widgetType == Config.NON_SELECTABLE_PROPERTY &&
				this.specProvider.isLiteralClass(this.ParentComponent.parentCriteriaGroup.EndClassGroup.value_selected)) {
					return false;
			} 
			return true ;
		} 

		this.reload = function reload() {
			if (this.tools === null) {
				this.init(false);
				return true;
			}
			//this.html = "" ;
			this.tools.remove() ;
			this.widgetHtml = null;
			this.init(true);
		}

		this.createWidgetComponent = function createWidgetComponent(widgetType, objectPropertyId, rangeClassId) {
			switch (widgetType) {
			  case Config.LITERAL_LIST_PROPERTY: {
				// defaut handler to be used
			    var handler = this.settings.list;
			    
			    // to be passed in anonymous functions
			    var theSpecProvider = this.specProvider;

			    // determine custom datasource
			    var datasource = this.specProvider.getDatasource(objectPropertyId);

			    if(datasource == null) {
			    	// try to read it on the class
			    	datasource = this.specProvider.getDatasource(rangeClassId);
			    }

			    if(datasource == null) {

			    	// datasource still null
			    	// if a default endpoint was provided, provide default datasource
			    	if(this.settings.defaultEndpoint != null) {
				    	datasource = Datasources.DATASOURCES_CONFIG.get(Datasources.LITERAL_LIST_ALPHA);
				    }
			    }

				if(datasource != null) {
			    	// if we have a datasource, possibly the default one, provide a config based
			    	// on a SparqlTemplate, otherwise use the handler provided
				    handler = new SparqlTemplateListHandler(
			    		// endpoint URL
			    		(datasource.sparqlEndpointUrl != null)?datasource.sparqlEndpointUrl:this.settings.defaultEndpoint,
			    		
			    		// sparqlPostProcessor
			    		{
				            semanticPostProcess : function(sparql) {
				            	// also add prefixes
				                for (key in settings.sparqlPrefixes) {
							        sparql = sparql.replace("SELECT ", "PREFIX "+key+": <"+settings.sparqlPrefixes[key]+"> \nSELECT ");
						    	}
				                return theSpecProvider.expandSparql(sparql);
				            }
				        },

			    		// language,
			    		this.settings.language,

			    		// sparql query (with labelPath interpreted)
			    		getFinalQueryString(datasource)
			    	);
				}

				this.widgetComponent = new ListWidget(this, handler, langSearch, settings, !(datasource.noSort == true)) ;
				this.cssClasses.ListeWidget = true ;

			  	break;
			  }
			  case Config.LIST_PROPERTY:
			    // defaut handler to be used
			    var handler = this.settings.list;
			    
			    // to be passed in anonymous functions
			    var theSpecProvider = this.specProvider;

			    // determine custom datasource
			    var datasource = this.specProvider.getDatasource(objectPropertyId);

			    if(datasource == null) {
			    	// try to read it on the class
			    	datasource = this.specProvider.getDatasource(rangeClassId);
			    }

			    if(datasource == null) {
			    	// datasource still null
			    	// if a default endpoint was provided, provide default datasource
			    	if(this.settings.defaultEndpoint != null) {
				    	datasource = Datasources.DATASOURCES_CONFIG.get(Datasources.LIST_URI_COUNT);
				    }
			    }

				if(datasource != null) {
			    	// if we have a datasource, possibly the default one, provide a config based
			    	// on a SparqlTemplate, otherwise use the handler provided
				    handler = new SparqlTemplateListHandler(
			    		// endpoint URL
			    		(datasource.sparqlEndpointUrl != null)?datasource.sparqlEndpointUrl:this.settings.defaultEndpoint,
			    		
			    		// sparqlPostProcessor
			    		{
				            semanticPostProcess : function(sparql) {
				            	// also add prefixes
				                for (key in settings.sparqlPrefixes) {
							        sparql = sparql.replace("SELECT ", "PREFIX "+key+": <"+settings.sparqlPrefixes[key]+"> \nSELECT ");
						    	}
				                return theSpecProvider.expandSparql(sparql);
				            }
				        },

			    		// language,
			    		this.settings.language,

			    		// sparql query (with labelPath interpreted)
			    		getFinalQueryString(datasource)
			    	);
				}

				this.widgetComponent = new ListWidget(this, handler, langSearch, settings, !(datasource.noSort == true)) ;
				this.cssClasses.ListeWidget = true ;
				break;
			  case Config.AUTOCOMPLETE_PROPERTY:
			    var handler = this.settings.autocomplete;
			    // to be passed in anonymous functions
			    var theSpecProvider = this.specProvider;

			    // determine custom datasource
			    var datasource = this.specProvider.getDatasource(objectPropertyId);

			    if(datasource == null) {
			    	// try to read it on the class
			    	datasource = this.specProvider.getDatasource(rangeClassId);
			    }

			    if(datasource == null) {
			    	// datasource still null
			    	// if a default endpoint was provided, provide default datasource
			    	if(this.settings.defaultEndpoint != null) {
				    	datasource = Datasources.DATASOURCES_CONFIG.get(Datasources.SEARCH_URI_CONTAINS);
				    }
			    }

			    if(datasource != null) {
			    	// if we have a datasource, possibly the default one, provide a config based
			    	// on a SparqlTemplate, otherwise use the handler provided
				    handler = new SparqlTemplateAutocompleteHandler(
			    		// endpoint URL
			    		(datasource.sparqlEndpointUrl != null)?datasource.sparqlEndpointUrl:this.settings.defaultEndpoint,
			    		
			    		// sparqlPostProcessor
			    		{
				            semanticPostProcess : function(sparql) {
				            	// also add prefixes
				                for (key in settings.sparqlPrefixes) {
							        sparql = sparql.replace("SELECT ", "PREFIX "+key+": <"+settings.sparqlPrefixes[key]+"> \nSELECT ");
						    	}
				                return theSpecProvider.expandSparql(sparql);
				            }
				        },

			    		// language,
			    		this.settings.language,

			    		// sparql query (with labelPath interpreted)
			    		getFinalQueryString(datasource)
			    	);
				}

				this.widgetComponent = new AutoCompleteWidget(this, handler) ;
				this.cssClasses.AutocompleteWidget = true ;
			    break;
			  case Config.GRAPHDB_SEARCH_PROPERTY:
			  case Config.STRING_EQUALS_PROPERTY:
			  case Config.SEARCH_PROPERTY:
				this.widgetComponent = new SearchWidget(this, langSearch) ;
				this.cssClasses.SearchWidget  = true ;
				break;
			  case Config.TIME_PROPERTY_YEAR:
				this.widgetComponent = new TimeDatePickerWidget(this, this.settings.dates, false, langSearch) ;
				this.cssClasses.TimeDatePickerWidget  = true ;
				break;
			  case Config.TIME_PROPERTY_DATE:
				this.widgetComponent = new TimeDatePickerWidget(this, this.settings.dates, 'day', langSearch) ;
				this.cssClasses.TimeDatePickerWidget  = true ;
				break;
			  case Config.TIME_PROPERTY_PERIOD:
				this.widgetComponent = new DatesWidget(this, this.settings.dates, langSearch) ;
				this.cssClasses.DatesWidget  = true ;
				break;
			  case Config.NON_SELECTABLE_PROPERTY:
			  	this.widgetComponent = new NoWidget(this) ;
			  	this.cssClasses.NoWidget = true ;
			  	break;
			  case Config.BOOLEAN_PROPERTY:
			  	this.widgetComponent = new BooleanWidget(this, langSearch) ;
			  	this.cssClasses.BooleanWidget = true ;
			  	break;
			  case Config.TREE_PROPERTY:
				  var theSpecProvider = this.specProvider;

				  // determine custom roots datasource
				  var treeRootsDatasource = this.specProvider.getTreeRootsDatasource(objectPropertyId);  
				  if(treeRootsDatasource == null) {
					  // try to read it on the class
					  treeRootsDatasource = this.specProvider.getTreeRootsDatasource(rangeClassId);
				  }
				  if(treeRootsDatasource == null) {
					  // datasource still null
					  // if a default endpoint was provided, provide default datasource
					  if(this.settings.defaultEndpoint != null) {
						  treeRootsDatasource = Datasources.DATASOURCES_CONFIG.get(Datasources.TREE_ROOT_SKOSTOPCONCEPT);
					  }
				  }

				  // determine custom children datasource
				  var treeChildrenDatasource = this.specProvider.getTreeChildrenDatasource(objectPropertyId);  
				  if(treeChildrenDatasource == null) {
					  // try to read it on the class
					  treeChildrenDatasource = this.specProvider.getTreeChildrenDatasource(rangeClassId);
				  }
				  if(treeChildrenDatasource == null) {
					  // datasource still null
					  // if a default endpoint was provided, provide default datasource
					  if(this.settings.defaultEndpoint != null) {
						  treeChildrenDatasource = Datasources.DATASOURCES_CONFIG.get(Datasources.TREE_CHILDREN_SKOSNARROWER);
					  }
				  }
  
				  
  
				  if(treeRootsDatasource != null && treeChildrenDatasource != null) {
					  // if we have a datasource, possibly the default one, provide a config based
					  // on a SparqlTemplate, otherwise use the handler provided
					  // handler = new StubTreeHandler();
					  
					  handler = new SparqlTreeHandler(
						  // endpoint URL
						  // we read it on the roots datasource
						  (treeRootsDatasource.sparqlEndpointUrl != null)?treeRootsDatasource.sparqlEndpointUrl:this.settings.defaultEndpoint,
						  
						  // sparqlPostProcessor
						  {
							  semanticPostProcess : function(sparql) {
								  // also add prefixes
								  for (key in settings.sparqlPrefixes) {
									  sparql = sparql.replace("SELECT ", "PREFIX "+key+": <"+settings.sparqlPrefixes[key]+"> \nSELECT ");
								  }
								  return theSpecProvider.expandSparql(sparql);
							  }
						  },
  
						  // language,
						  this.settings.language,

						  // sparql strings
						  getFinalQueryString(treeRootsDatasource),
						  getFinalQueryString(treeChildrenDatasource)
					  );
					  
				  }

				  this.widgetComponent = new TreeWidget(this, handler, settings, langSearch) ;
			  	  this.cssClasses.TreeWidget = true ;
			  	  break;
			  default:
			  	// TODO : throw Exception
			  	console.log("Unexpected Widget Type "+widgetType)
			}
		};
		
		this.getValue = function () {
			if (this.loadedValue !== null) {
				return this.loadedValue ;
			} else {
				return this.widgetComponent.getValue() ;
			}
		}

		/*
		this.getValueLabel = function () {			
			return this.widgetComponent.getValueLabel() ;
		}
		*/
		
	}