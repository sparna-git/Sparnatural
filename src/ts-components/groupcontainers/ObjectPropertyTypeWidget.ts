import GroupContenaire from "./GroupContenaire";
import ISettings from "../ISettings";
import Config from "../../SparnaturalConfig";
import Datasources from "../../SparnaturalConfigDatasources";
import { SparqlTemplateAutocompleteHandler, SparqlTemplateListHandler } from "../../AutocompleteAndListHandlers";
import { AutoCompleteWidget, BooleanWidget, DatesWidget, ListWidget, NoWidget, SearchWidget, TimeDatePickerWidget, TreeWidget } from "../../Widgets";
import JsonLdSpecificationProvider from "../../JsonLdSpecificationProvider";
import { SparqlTreeHandler } from "../../TreeHandlers";
import HTMLComponent from "../htmlcomponents/HtmlComponent";

/**
 *  Selects the value for a range in a criteria/line, using a value selection widget
 **/
 class ObjectPropertyTypeWidget extends HTMLComponent {
    settings: ISettings;
    HtmlContainer: any;
    widgetType: string | null = null;
    objectPropertyId: any;
    rangeClassId: any;
    classLabel: string;
    widgetComponent:any;
    needTriggerClick:boolean = false // IMPORTANT Cheating here a little bit. useless class var but neeted to fit inputTypeComponent
    parentComponent:GroupContenaire
    loadedValue:{
        key?: any;
        label?: any;
        uri?: any;
        start?: any;
        stop?: any;
        search?: any;
        boolean?: any;
    } | null = null ;

    constructor(ParentComponent: GroupContenaire, settings: ISettings, specProvider:JsonLdSpecificationProvider){
        let cssClasses = {
			ObjectPropertyTypeWidget : true,
			Created : false
		} ;
        super("ObjectPropertyTypeWidget",cssClasses,ParentComponent,specProvider,null)
        this.parentComponent = ParentComponent
        this.settings = settings;
        this.HtmlContainer = ParentComponent
    }

    init(){
        this.objectPropertyId = this.parentComponent.parentCriteriaGroup.ObjectPropertyGroup.value_selected
        console.log(this.objectPropertyId)
        this.widgetType = this.specProvider.getObjectPropertyType(this.objectPropertyId);
        console.warn("after error")
        this.rangeClassId = this.parentComponent.parentCriteriaGroup.EndClassGroup.value_selected
        this.classLabel = this.specProvider.getLabel(this.rangeClassId) ;
      
        let endLabel:string
        let add_all = true
        let add_or = true
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

					add_all = false;
					
					
				
					//$(this.ParentComponent.parentCriteriaGroup).trigger( {type:"EndClassWidgetGroupSelected" } ) ;
					$(this.parentComponent.parentCriteriaGroup.thisForm_.sparnatural).trigger( "submit" ) ;
					this.initGeneralEvent(this.parentComponent.parentCriteriaGroup.thisForm_);					
				}
				//var endLabel = null ; //Imporant is this still necessary?
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
            var parenthesisLabel = ' ('+this.classLabel+') ';
			if(this.widgetType == Config.BOOLEAN_PROPERTY) {
				parenthesisLabel = " " ;
			}

			//Ajout de l'option all si pas de valeur déjà selectionées
			var selcetAll = "";
            console.warn("log objectproptypwidget")
            console.dir(this.parentComponent.parentCriteriaGroup.EndClassWidgetGroup)
			if (this.parentComponent.parentCriteriaGroup.EndClassWidgetGroup.selectedValues?.length == 0) {
				if (add_all) {
					selcetAll = '<span class="selectAll"><span class="underline">'+this.settings.langSearch.SelectAllValues+'</span>'+parenthesisLabel+'</span>' ;
				}
				if (add_all && add_or) {
					selcetAll += '<span class="or">'+this.settings.langSearch.Or+'</span> ';
				}
			}
			
			var widgetLabel = '<span class="edit-trait first"><span class="edit-trait-top"></span><span class="edit-num">1</span></span>'+ selcetAll  ;

			if (endLabel) {
				widgetLabel += '<span>'+ endLabel+'</span>' ;
			}
			
			// init HTML by concatenating bit of HTML + widget HTML
			this.widgetComponent = this.createWidgetComponent(
				this.widgetType,
				this.objectPropertyId,
				this.rangeClassId
			) ;

			if (this.widgetType == Config.NON_SELECTABLE_PROPERTY) {
				this.widgetHtml = $(widgetLabel) ;
			} else {
				this.widgetHtml = $(widgetLabel) + this.widgetComponent.html ;
			}

			var this_component = this;
			this.widgetComponent.init() ;
			this.cssClasses.Created = true ;
			$(this.html).find('.selectAll').first().on("click", function() {
				$(this_component).trigger('selectAll') ;
			});
            super.initHtml() // IMPORTANT : check if this actually does the same thing like in the original code
    }

    canHaveSelectAll() {
        if (this.widgetType == Config.NON_SELECTABLE_PROPERTY &&
            this.specProvider.isLiteralClass(this.parentComponent.parentCriteriaGroup.EndClassGroup.value_selected)) {
                return false;
        } 
        return true ;
    }

    reload() {
        //this.html = "" ;
        console.log("Reload!")
        this.widgetHtml = null;
        this.init();
    }

    createWidgetComponent = (widgetType:string, objectPropertyId:any, rangeClassId:any) => {
        switch (widgetType) {
          case Config.LITERAL_LIST_PROPERTY: {
            // defaut handler to be used
            var handler = this.settings.list; //IMPORTANT: what is this list?
            
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
                        semanticPostProcess: (sparql:any) => {
                            // also add prefixes
                            for (let key in this.settings.sparqlPrefixes) {
                                sparql = sparql.replace("SELECT ", "PREFIX "+key+": <"+this.settings.sparqlPrefixes[key]+"> \nSELECT ");
                            }
                            return theSpecProvider.expandSparql(sparql);
                        }
                    },

                    // language,
                    this.settings.language,

                    // sparql query (with labelPath interpreted)
                    this.getFinalQueryString(datasource)
                );
            }

            this.widgetComponent = new ListWidget(this, handler, this.settings.langSearch, this.settings, !(datasource.noSort == true)) ;
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
                        semanticPostProcess : function(sparql:any) {
                            // also add prefixes
                            for (let key in this.settings.sparqlPrefixes) {
                                sparql = sparql.replace("SELECT ", "PREFIX "+key+": <"+this.settings.sparqlPrefixes[key]+"> \nSELECT ");
                            }
                            return theSpecProvider.expandSparql(sparql);
                        }
                    },

                    // language,
                    this.settings.language,

                    // sparql query (with labelPath interpreted)
                    this.getFinalQueryString(datasource)
                );
            }

            this.widgetComponent = new ListWidget(this, handler, this.settings.langSearch, this.settings, !(datasource.noSort == true)) ;
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
                        semanticPostProcess : function(sparql:any) {
                            // also add prefixes
                            for (let key in this.settings.sparqlPrefixes) {
                                sparql = sparql.replace("SELECT ", "PREFIX "+key+": <"+this.settings.sparqlPrefixes[key]+"> \nSELECT ");
                            }
                            return theSpecProvider.expandSparql(sparql);
                        }
                    },

                    // language,
                    this.settings.language,

                    // sparql query (with labelPath interpreted)
                    this.getFinalQueryString(datasource)
                );
            }

            this.widgetComponent = new AutoCompleteWidget(this, handler) ;
            this.cssClasses.AutocompleteWidget = true ;
            break;
          case Config.GRAPHDB_SEARCH_PROPERTY:
          case Config.STRING_EQUALS_PROPERTY:
          case Config.SEARCH_PROPERTY:
            this.widgetComponent = new SearchWidget(this, this.settings.langSearch) ;
            this.cssClasses.SearchWidget  = true ;
            break;
          case Config.TIME_PROPERTY_YEAR:
            this.widgetComponent = new TimeDatePickerWidget(this, this.settings.dates, false, this.settings.langSearch) ;
            this.cssClasses.TimeDatePickerWidget  = true ;
            break;
          case Config.TIME_PROPERTY_DATE:
            this.widgetComponent = new TimeDatePickerWidget(this, this.settings.dates, 'day', this.settings.langSearch) ;
            this.cssClasses.TimeDatePickerWidget  = true ;
            break;
          case Config.TIME_PROPERTY_PERIOD:
            this.widgetComponent = new DatesWidget(this, this.settings.dates, this.settings.langSearch) ;
            this.cssClasses.DatesWidget  = true ;
            break;
          case Config.NON_SELECTABLE_PROPERTY:
              this.widgetComponent = new NoWidget(this) ;
              this.cssClasses.NoWidget = true ;
              break;
          case Config.BOOLEAN_PROPERTY:
              this.widgetComponent = new BooleanWidget(this, this.settings.langSearch) ;
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
                          semanticPostProcess : function(sparql:any) {
                              // also add prefixes
                              for (let key in this.settings.sparqlPrefixes) {
                                  sparql = sparql.replace("SELECT ", "PREFIX "+key+": <"+this.settings.sparqlPrefixes[key]+"> \nSELECT ");
                              }
                              return theSpecProvider.expandSparql(sparql);
                          }
                      },

                      // language,
                      this.settings.language,

                      // sparql strings
                      this.getFinalQueryString(treeRootsDatasource),
                      this.getFinalQueryString(treeChildrenDatasource)
                  );
                  
              }

              this.widgetComponent = new TreeWidget(this, handler, this.settings, this.settings.langSearch) ;
                this.cssClasses.TreeWidget = true ;
                break;
          default:
              // TODO : throw Exception
              console.log("Unexpected Widget Type "+widgetType)
        }
    };

    	/**
	 * Builds the final query string from a query source, by injecting
	 * labelPath/property and childrenPath/property
	 **/
	getFinalQueryString(datasource:any) {
		if(datasource.queryString != null) {
			return datasource.queryString;
		} else {
			var sparql = datasource.queryTemplate;

			if(datasource.labelPath != null || datasource.labelProperty) {
				var theLabelPath = (datasource.labelPath)?datasource.labelPath:"<"+datasource.labelProperty+">";
				var reLabelPath = new RegExp("\\$labelPath","g");
				sparql = sparql.replace(reLabelPath, theLabelPath);
			}

			if(datasource.childrenPath != null || datasource.childrenProperty) {
				var theChildrenPath = (datasource.childrenPath)?datasource.childrenPath:"<"+datasource.childrenProperty+">";
				var reChildrenPath = new RegExp("\\$childrenPath","g");
				sparql = sparql.replace(reChildrenPath, theChildrenPath);
			}

			return sparql;
		}
	}
    getValue() {
        if (this.loadedValue !== null) {
            return this.loadedValue ;
        } else {
            return this.widgetComponent.getValue() ;
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