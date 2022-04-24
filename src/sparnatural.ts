require("jstree/dist/themes/default/style.min.css");

require("./assets/stylesheets/sparnatural.scss");

require("easy-autocomplete");
//

// removed to avoid x2 bundle size
// the dependency needs to be manually inserted in HTML pages
// <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@chenfengyuan/datepicker@1.0.9/dist/datepicker.min.css">
// <script src="https://cdn.jsdelivr.net/npm/@chenfengyuan/datepicker@1.0.9/dist/datepicker.min.js"></script>
//
// const datepicker = require("@chenfengyuan/datepicker") ;
// const $$ = require('jquery');

require("./assets/js/jquery-nice-select/jquery.nice-select.js");
// WARNING : if you use ES6 syntax (like import instead of require), 
// webpack will automatically add "use strict" as all ES6 modules 
// are expected to be strict mode code.

// This is ugly, should use i18n features instead
const i18nLabels = { 
	"en" : require('./assets/lang/en.json'),
	"fr": require('./assets/lang/fr.json')
};

require('tippy.js/dist/tippy.css');

const Sortable = require('sortablejs/modular/sortable.core.esm.js').Sortable;
import { QuerySPARQLWriter } from "./Query";
import JSONQueryGenerator from "./QueryGenerators";

import { eventProxiCriteria, redrawBottomLink } from "./SparnaturalComponents";
import { SpecificationProviderFactory } from "./SpecificationProviderFactory";

import UiuxConfig from "./UiuxConfig";
import {addComponent, initGeneralEvent} from "./ts-components/globals/globalfunctions"
import {getSettings, mergeSettings} from "./ts-components/globals/settings"
	
export class SparNatural extends HTMLElement {
    	specProvider:any;	
		// all the components in Sparnatural
		components:any = [];
		Form:{sparnatural:SparNatural, submitOpened:boolean,firstInit:boolean,preLoad:boolean,langSearch:any} = {
        	sparnatural : this,
			submitOpened: true,
			firstInit: false,
			// JSON of the query to be loaded
			preLoad: false,
			langSearch:null
        } ;

		constructor() {
			super();
			// overwride the default settings with the settings provided by the index.html
			$(this).attr('id', 'sparnatural-container');
			$(this).addClass('Sparnatural') ;
			
		}

		initSparnatural(){
			getSettings().langSearch = i18nLabels["en"]
			this.Form.langSearch = i18nLabels["en"]
			let settings = this.getSettings()
			let specProviderFactory = new SpecificationProviderFactory();


			specProviderFactory.build(settings.config, settings.language, (sp:any)=> {
				this.specProvider = sp;
				this.initForm(this.Form);
				// add the first CriteriaGroup to the component
				addComponent.call(this,this.Form, $(this.Form.sparnatural).find('ul')) ;
				$(this.Form.sparnatural).find('.StartClassGroup .nice-select:not(.disabled)').trigger('click') ;
				// uncomment to trigger gathering of statistics
				// initStatistics(specProvider);
			});
			console.log("after init")

		}
		
		getSettings(){
			return getSettings()
		}

		setSettings(options:any){
			mergeSettings(options)
		}
		
		loadQuery(json:any) {
			var jsonWithLinks = this.preprocess(json);
			// console.log(jsonWithLinks);
			//Désactiver le submit du form
			//en amont reset de ce qui est déjà dans l'interface (fonction à part)
			if (this.Form.firstInit === true) {
				this.Form = this.doLoadQuery(this.Form, jsonWithLinks) ;
			} else {
				//Si un travail est en cours on attend...
				$(this.Form.sparnatural).on('initialised', ()=> {
					this.Form = this.doLoadQuery(this.Form, jsonWithLinks) ;
				}) ;
			}
		}

		clear() {
			this.Form = this.clearForm(this.Form) ;
		}

		enableSubmit() {
			$(this.Form.sparnatural).find('.submitSection a').removeClass('submitDisable') ;
		}

		disableSubmit() {
			$(this.Form.sparnatural).find('.submitSection a').addClass('submitDisable') ;
		}	
		enableLoading() {
			$(this.Form.sparnatural).find('.submitSection a').addClass('submitDisable, loadingEnabled') ; /// Need to be disabled with loading
		}	
		disableLoading() {
			$(this.Form.sparnatural).find('.submitSection a').removeClass('loadingEnabled') ;
		}	

		doLoadQuery(form:any, json:any) {
			// stores the JSON to be preloaded
			form.preLoad = json ;
			// clear the form
			// On Clear form new component is automaticaly added, json gets loaded
			this.clearForm(form) ;

			form.sparnatural.variablesSelector.loadQuery() ;
			
			// And now, submit form
			$(form.sparnatural).trigger('submit')
			form.preLoad = false ;
			// clear the jsonQueryBranch copied on every component, otherwise they always stay here
			// and we get the same criterias over and over when removing and re-editing
			form.sparnatural.components.forEach(function(component:any) { component.CriteriaGroup.jsonQueryBranch = null; });
			return form ;
		}

		clearForm(form:any) {
			//Stop submit form on this work.
			form.submitOpened = false ;
			for (var i = form.sparnatural.components.length-1; i > -1; i--) {
				if ($(form.sparnatural.components[i].CriteriaGroup.AncestorComponentHtml).hasClass('componentsListe')) {
					form.sparnatural.components[i].CriteriaGroup.onRemoveCriteria() ;
				}
			}
			form.submitOpened = true ;
			return form ;
		}

		/**
		 * Returns the maximum index of variables within all the criterias
		 **/
		getMaxVarIndex() {
			var max = 0;
			for (var i = 0; i < this.components.length; i++) {
				var startVarName = this.components[i].CriteriaGroup.StartClassGroup.getVarName();
				var endVarName = this.components[i].CriteriaGroup.EndClassGroup.getVarName();

				if(startVarName && startVarName.split("_").length > 1) {
					var index = parseInt(startVarName.split("_")[1]);
					if(index > max) {
						max = index;
					}
				}

				if(endVarName && endVarName.split("_").length > 1) {
					var index = parseInt(endVarName.split("_")[1]);
					if(index > max) {
						max = index;
					}	
				}
			}

			return max;
		}

		
		initForm(form:any) {	
			var SubmitSection = "" ;
			let settings = getSettings()
			if (settings.onSubmit) {
				var SubmitSection = '<div class="submitSectionWrapper" style="background: rgba('+settings.backgroundBaseColor+');"><div class="submitSection"><a class="submitDisable">'+UiuxConfig.ICON_PLAY+'</a></div></div>' ; 
			}
			var contexte = $('<div class="bg-wrapper"><ul class="componentsListe"></ul></div>'+SubmitSection+'<div class="variablesSelection"></div>');

			$(form.sparnatural).append(contexte) ;
			
			if (settings && settings.onSubmit) {
				$(form.sparnatural).find('.submitSection a').on('click', (event) => {
					if (!$(this).hasClass('submitDisable')) {
						form.sparnatural.disableSubmit() ;
						if(settings.onSubmit){
							settings.onSubmit(form) ;
						}
						
					}
				}) ;
			}

			//Ajout du filtre pour ombrage menu options
			$(form.sparnatural).append($('<svg data-name="Calque 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 0 0" style="width:0;height:0;display:block"><defs><filter style="color-interpolation-filters:sRGB;" inkscape:label="Drop Shadow" id="filter19278" x="-0.15483875" y="-0.11428573" width="1.3096775" height="1.2714286"><feFlood flood-opacity="0.811765" flood-color="rgb(120,120,120)" result="flood" id="feFlood19268" /><feComposite in="flood" in2="SourceGraphic" operator="out" result="composite1" id="feComposite19270" /><feGaussianBlur in="composite1" stdDeviation="2" result="blur" id="feGaussianBlur19272" /><feOffset dx="3.60822e-16" dy="1.8" result="offset" id="feOffset19274" /><feComposite in="offset" in2="SourceGraphic" operator="atop" result="composite2" id="feComposite19276" /></filter></defs></svg>') );

			//Bouton de reset
			var reset = $('<div class="reset-wrapper"><p class="reset-form"><a>'+UiuxConfig.ICON_RESET+'</a></p></div>') ;
			$(form.sparnatural).find('.bg-wrapper').prepend(reset) ;
	
			$(reset).find('a').first().on('click', (event) =>{
					this.clearForm(form) ;
			});
			

			form.queryOptions = {
				distinct : settings.addDistinct,
				displayVariableList: ['?this'],
				orderSort: null,
				defaultLang: settings.language
			}

			this.initVariablesSelector.call(this,form) ;
			
			initGeneralEvent.call(this,form) ;
			
			// triggered when Sparnatural is submitted : generates output SPARQL query
			$(form.sparnatural).on('submit', { formObject : form }, function (event) {
				if (form.submitOpened == true) {
					event.preventDefault();
					/*if ($(event.data.formObject.sparnatural).find('li.groupe').not('.completed').length > 0) {
						return false ;
					}*/

					// prints the JSON query data structure on the console
					var jsonGenerator = new JSONQueryGenerator();
					var jsonQuery = jsonGenerator.generateQuery(event.data.formObject);

					if(jsonQuery != null) {					
						console.log("*** New JSON Data structure ***");
						console.log(JSON.stringify(
							jsonQuery,
							null,
							4
						));

						// prints the SPARQL generated from the writing of the JSON data structure
						console.log("*** New SPARQL from JSON data structure ***");
						var writer = new QuerySPARQLWriter(
							settings.typePredicate,
							this.specProvider
						);
						writer.setPrefixes(settings.sparqlPrefixes);
						console.log(writer.toSPARQL(jsonQuery));

						// fire callback
						settings.onQueryUpdated(writer.toSPARQL(jsonQuery), jsonQuery);
						//Can enable for submit
						form.sparnatural.enableSubmit() ;
					}
				}
			}) ;

			$(form.sparnatural).trigger('formInitialized') ;
		}

		initVariablesSelector(form:any) {
			form.sparnatural.variablesSelector = {} ;
			/*
				Prepare Html
				TODO refactor to own method
			*/
			let html = $(form.sparnatural).find('.variablesSelection').first() ; 
			let linesWrapper = $('<div class="linesWrapper"></div>')
			let ordersSelectHtml = $('<div class="variablesOrdersSelect"><strong>'+getSettings().langSearch.labelOrderSort+'</strong> <a class="asc">'+UiuxConfig.ICON_AZ+'</a><a class="desc">'+UiuxConfig.ICON_ZA+'</a><a class="none selected">'+UiuxConfig.ICON_NO_ORDER+'</a></div>')
			let variablesOptionsSelect = $('<div class="variablesOptionsSelect">'+getSettings().langSearch.SwitchVariablesNames+' <label class="switch"><input type="checkbox"><span class="slider round"></span></label></div>')
			variablesOptionsSelect.find('label, span')
			.on('click', // Listening when switch display variable
				{arg1: this, arg2: 'switchVariableName'},
				eventProxiCriteria
			)
			// Listening when change sort order (AZ, ZA, None)
			ordersSelectHtml
			.find('a')
			.on('change',
				{arg1: this, arg2: 'changeOrderSort'},
				eventProxiCriteria
			)

			ordersSelectHtml.find('a').on('click', function() {
				if ($(this).hasClass('selected')) {
					//No change, make nothing
				} else {
					$(this).parent('div').find('a').removeClass('selected') ;
					$(this).addClass('selected') ;
					$(this).trigger('change') ;
				}
			});
			let otherSelectHtml = $('<div class="variablesOtherSelect"></div>')

			/*
			End prepare html
			*/

			
			linesWrapper
			.append( $('<div class="line2"></div>')
				.append(ordersSelectHtml)
				.append(variablesOptionsSelect)
			)

			$(html)
			.append(
				linesWrapper
					.append($('<div class="line1"></div>')
						.append($('<div class="variablesFirstSelect"></div>')
						).append(otherSelectHtml)
					)
				)	
			//Show and hide button
			let selectorDisplay = $('<div class="VariableSelectorDisplay"><a class="displayButton">'+UiuxConfig.ICON_ARROW_TOP+UiuxConfig.ICON_ARROW_BOTTOM+'</a></div>')
			selectorDisplay.find('a')
			.on('click',
			{arg1: this, arg2: 'display'},
			eventProxiCriteria
			)
			$(html).append(selectorDisplay);

			form.sparnatural.variablesSelector = this ;
			form.sparnatural.variablesSelector.switchLabel = 'name' ; // or name


			var sortable = new Sortable(otherSelectHtml[0], {
				group: "name",  // or { name: "...", pull: [true, false, 'clone', array], put: [true, false, array] }
				sort: true,  // sorting inside list
				delay: 0, // time in milliseconds to define when the sorting should start
				delayOnTouchOnly: false, // only delay if user is using touch
				touchStartThreshold: 0, // px, how many pixels the point should move before cancelling a delayed drag event
				disabled: false, // Disables the sortable if set to true.
				store: null,  // @see Store
				animation: 150,  // ms, animation speed moving items when sorting, `0` — without animation
				easing: "cubic-bezier(1, 0, 0, 1)", // Easing for animation. Defaults to null. See https://easings.net/ for examples.
				handle: "div>.variable-handle",  // Drag handle selector within list items
				filter: ".ignore-elements",  // Selectors that do not lead to dragging (String or Function)
				preventOnFilter: true, // Call `event.preventDefault()` when triggered `filter`
				draggable: ".sortableItem",  // Specifies which items inside the element should be draggable
			
				dataIdAttr: 'data-variableName', // HTML attribute that is used by the `toArray()` method
			
				ghostClass: "sortable-ghost",  // Class name for the drop placeholder
				chosenClass: "sortable-chosen",  // Class name for the chosen item
				dragClass: "sortable-drag",  // Class name for the dragging item

			
				// Element is dropped into the list from another list
				onAdd: function (/**Event*/evt:any) {
					// same properties as onEnd
				},
			
				// Changed sorting within list
				onUpdate: function (/**Event*/evt:any) {
					// same properties as onEnd
					$(this).trigger( "onUpdate" ) ;
				},
			
				// Called by any change to the list (add / update / remove)
				onSort: function (/**Event*/evt:any) {
					// same properties as onEnd
				},
			
				// Called when dragging element changes position
				onEnd: function(/**Event*/evt:any) {
					evt.newIndex // most likely why this event is used is to get the dragging element's current index
					// same properties as onEnd
					var width = $('.sortableItem').first().width() ;
					$('.variablesOrdersSelect').width(width) ;

				}
			});

			$(sortable).on(
				'onUpdate',
				{arg1: this, arg2: 'updateVariableList'},
				eventProxiCriteria
			);

			let removeVariableName = function(name:any) {
				// IMPORTANT unused method?
			}

			let display =  ()=> {
				if( $(html).hasClass('displayed') ) {
					$(linesWrapper).animate({
						height: 0
					}, 500, function(){
	
					});
				} else {
					$(linesWrapper).animate({
						height: $(linesWrapper).get(0).scrollHeight
					}, 500, function(){
						$(linesWrapper).height('auto');
					});
				}
				
				$(html).toggleClass('displayed') ;

			}

			let changeOrderSort = () => {
				var selected = $(ordersSelectHtml).find('a.selected').first() ;
				var sort = null ;
				if ($(selected).hasClass('desc')) {
					sort = 'desc' ;
				}
				if ($(selected).hasClass('asc')) {
					sort = 'asc' ;
				}
				form.queryOptions.orderSort = sort ;
				$(form.sparnatural).trigger( "submit"  ) ;
			}

			/**
			 * Updates the variables in the generated query based on HTML variable line
			 **/
			let updateVariableList = function() {
				var listedItems = $(this.otherSelectHtml).find('.sortableItem>div') ;
				this.form.queryOptions.displayVariableList = [] ;
				for (var i = 0; i < listedItems.length; i++) {
					var variableName = $(listedItems[i]).attr('data-variablename'); 
					this.form.queryOptions.displayVariableList.push(variableName) ;
				}
				$(form.sparnatural).trigger( "submit" ) ;
			}

			let switchVariableName = function() {
				$(this.form.sparnatural).find('.componentsListe').first().toggleClass('displayVarName') ;

				$('li.groupe').each(function() {
					redrawBottomLink($(this)) ;
				});
			}

			this.loadQuery = function() {
				this.form.submitOpened = false ;
				for (var i = 0; i < this.form.preLoad.variables.length; i++) {
					var variableName = this.form.preLoad.variables[i] ;
					for (var x = 0; x < this.form.sparnatural.components.length; x++) {
						var critere = this.form.sparnatural.components[x].CriteriaGroup ;
						if (critere.StartClassGroup.variableNamePreload == variableName ) {
							critere.StartClassGroup.onchangeViewVariable() ;
							break ; // une variable ne doit être trouvé q'une seule fois et seulement la première
						}
						if (critere.EndClassGroup.variableNamePreload == variableName ) {
							critere.EndClassGroup.onchangeViewVariable() ;
							break ; // une variable ne doit être trouvé q'une seule fois et seulement la première
						}
						
					}
					x= 0 ;
				}
				this.form.submitOpened = true ;
			}

			///form.sparnatural.variablesSelector = this ;
		}

	/**
	 * Preprocess JSON query to add parent and nextSibling links
	 **/
	preprocess(jsonQuery:any) {
		for(var i = 0;i < jsonQuery.branches.length;i++) {
			var branch = jsonQuery.branches[i];
			var next = null;
			if(jsonQuery.branches.length > i+1) {
				next = jsonQuery.branches[i+1];
			}
			this.preprocessRec(branch, null, next, jsonQuery);
		}
		return jsonQuery;
	}

	preprocessRec(branch:any, parent:any, nextSibling:any, jsonQuery:any) {
		branch.parent = parent;
		branch.nextSibling = nextSibling;
		// set flags ot indicate if the eye is open by testing the selected variables
		if(jsonQuery.variables.includes(branch.line.s)) {
			branch.line.sSelected = true;
		}
		if(jsonQuery.variables.includes(branch.line.o)) {
			branch.line.oSelected = true;
		}
		for(var i = 0;i < branch.children.length;i++) {
			var child = branch.children[i];
			var next = null;
			if(branch.children.length > i+1) {
				next = branch.children[i+1];
			}
			this.preprocessRec(child, branch, next, jsonQuery);
		}
	}

} // end of Sparnatural class

customElements.get('spar-natural') || window.customElements.define('spar-natural', SparNatural);