
	const jstree = require('jstree').default;

	
	AutoCompleteWidget = function(inputTypeComponent, autocompleteHandler) {
		this.autocompleteHandler = autocompleteHandler;
		this.ParentComponent = inputTypeComponent ;

		this.IdCriteriaGroupe = this.ParentComponent.ParentComponent.parentCriteriaGroup.id ;
		this.html = '<input id="ecgrw-'+this.IdCriteriaGroupe+'-input" /><input id="ecgrw-'+this.IdCriteriaGroupe+'-input-value" type="hidden"/>' ;
		
		this.init = function init() {
			var startClassGroup_value = this.ParentComponent.ParentComponent.parentCriteriaGroup.StartClassGroup.value_selected ;
			var endClassGroup_value = this.ParentComponent.ParentComponent.parentCriteriaGroup.EndClassGroup.value_selected ;
			var ObjectPropertyGroup_value = this.ParentComponent.ParentComponent.parentCriteriaGroup.ObjectPropertyGroup.value_selected ;
			
			var id_inputs = this.IdCriteriaGroupe ;			
			var itc_obj = this.ParentComponent;	
			var isMatch = autocompleteHandler.enableMatch(startClassGroup_value, ObjectPropertyGroup_value, endClassGroup_value);
			
			var options = {
				// ajaxSettings: {crossDomain: true, type: 'GET'} ,
				url: function(phrase) {
					return autocompleteHandler.autocompleteUrl(startClassGroup_value, ObjectPropertyGroup_value, endClassGroup_value, phrase) ;
				},
				listLocation: function (data) {
					return autocompleteHandler.listLocation(startClassGroup_value, ObjectPropertyGroup_value, endClassGroup_value, data) ;
				},
				getValue: function (element) { 
					return autocompleteHandler.elementLabel(element) ;
				},
				
				adjustWidth: false,

				ajaxSettings: {
					crossDomain: true,
					dataType: "json",
					method: "GET",
					data: {
				  		dataType: "json"
					}
				},

				preparePostData: function(data) {
					data.phrase = $('#ecgrw-'+id_inputs+'-input').val();
					return data;
				},

				list: {
					match: {
						enabled: isMatch
					},

					onChooseEvent: function() {
						var value = $('#ecgrw-'+id_inputs+'-input').getSelectedItemData();
						
						var label = autocompleteHandler.elementLabel(value) ; 
						var uri = autocompleteHandler.elementUri(value) ; 
						$('#ecgrw-'+id_inputs+'-input').val(label)
						$('#ecgrw-'+id_inputs+'-input-value').val(uri).trigger("change");
						$(itc_obj).trigger("change");
					}
				},

				requestDelay: 400
			};
			//Need to add in html befor
			
			$('#ecgrw-'+id_inputs+'-input').easyAutocomplete(options);
		}

		this.getValue = function() {
			var id_input = '#ecgrw-'+ this.IdCriteriaGroupe +'-input-value' ;
			var id_input_label = '#ecgrw-'+ this.IdCriteriaGroupe +'-input' ;

			return {
				key: $(id_input).val(),
				label: $(id_input_label).val(),
				uri: $(id_input).val()
			} ;
		}
	};
	
	ListWidget = function(inputTypeComponent, listHandler, langSearch, settings) {
		this.listHandler = listHandler;
		this.ParentComponent = inputTypeComponent ;
		this.IdCriteriaGroupe = this.ParentComponent.ParentComponent.parentCriteriaGroup.id ;
		
		this.id_input = 'ecgrw-'+ this.IdCriteriaGroupe +'-input-value' ;
		this.html = '<div class="list-widget"><select id="'+this.id_input+'"></select><div class="no-items" style="display: none; font-style:italic;">'+langSearch.ListWidgetNoItem+'</div></div>' ;
		//this.select = $('<select id="'+this.id_input+'"></select>');
		
		this.init = function init() {
			var startClassGroup_value = this.ParentComponent.ParentComponent.parentCriteriaGroup.StartClassGroup.value_selected ;
			var endClassGroup_value = this.ParentComponent.ParentComponent.parentCriteriaGroup.EndClassGroup.value_selected ;
			var ObjectPropertyGroup_value = this.ParentComponent.ParentComponent.parentCriteriaGroup.ObjectPropertyGroup.value_selected ;
			
			var itc_obj = this.ParentComponent;
			var id_input = 'ecgrw-'+ this.IdCriteriaGroupe +'-input-value' ;

			document.getElementById(id_input).style.display = 'block' ;
			document.getElementById(id_input).closest('.list-widget').querySelector('.no-items').style.display = 'none' ;

			let url = listHandler.listUrl(
				startClassGroup_value,
				ObjectPropertyGroup_value,
				endClassGroup_value
			);

			var headers = new Headers();
			headers.append("Accept", "application/sparql-results+json, application/json, */*;q=0.01");
			let init = {
				method: 'GET',
				headers: headers,
				mode: 'cors',
				cache: 'default' 
			};
			let temp = new LocalCacheData() ;
			let fetchpromise = temp.fetch(url, init, settings.localCacheDataTtl) ;
			fetchpromise.then(response => response.json())
			.then(data => {
				var items = listHandler.listLocation(
					startClassGroup_value,
					ObjectPropertyGroup_value,
					endClassGroup_value,
					data
				) ;
				if (items.length > 0) {
					$.each( items, function( key, val ) {				  
						var label = listHandler.elementLabel(val) ; 
						var uri = listHandler.elementUri(val) ; 
						$('#'+id_input).append( "<option value='" + uri + "'>" + label + "</option>" );
					});
					$('#'+id_input).niceSelect();
					$('#'+id_input).on("change", function() {
						$(itc_obj).trigger('change') ;
					});
				} else {
					document.getElementById(id_input).style.display = 'none' ;
					document.getElementById(id_input).closest('.list-widget').querySelector('.no-items').style.display = 'block' ;
					console.warn('No item in widget list for :'+'\n'+' - Start Class => '+startClassGroup_value+'\n'+' - Object property => '+ObjectPropertyGroup_value+'\n'+' - End Class =>'+ endClassGroup_value+' '+'\n'+' - Get data on Url => '+options.url) ;
				}  ;
			});
			
			/*
			var options = {
				url: listHandler.listUrl(
					startClassGroup_value,
					ObjectPropertyGroup_value,
					endClassGroup_value
				),
				dataType: "json",
				method: "GET",
				data: {
					  dataType: "json"
				}
			} ;
	
			var request = $.ajax( options );
			//var select = $(this.html).find('select') ;
			request.done(function( data ) {			  
			  	var items = listHandler.listLocation(
			  		startClassGroup_value,
			  		ObjectPropertyGroup_value,
			  		endClassGroup_value,
			  		data
			  	) ;
				if (items.length > 0) {
					$.each( items, function( key, val ) {				  
						var label = listHandler.elementLabel(val) ; 
						var uri = listHandler.elementUri(val) ; 
						$('#'+id_input).append( "<option value='" + uri + "' title='" + label + "'>" + label + "</option>" );
					});
					$('#'+id_input).niceSelect();
					$('#'+id_input).on("change", function() {
						$(itc_obj).trigger('change') ;
					});
				} else {
					document.getElementById(id_input).style.display = 'none' ;
					document.getElementById(id_input).closest('.list-widget').querySelector('.no-items').style.display = 'block' ;
					console.warn('No item in widget list for :'+'\n'+' - Start Class => '+startClassGroup_value+'\n'+' - Object property => '+ObjectPropertyGroup_value+'\n'+' - End Class =>'+ endClassGroup_value+' '+'\n'+' - Get data on Url => '+options.url) ;
				} 
			});
			*/
		}

		this.getValue = function() {
			var id_input = '#'+ this.id_input ;
			// return $(id_input).val() ;

			return {
				key: $(id_input).val(),
				label: $(id_input).find('option:selected').text(),
				uri: $(id_input).val()
			} ;
		}
	}
	

	ListWidgetNew = function(inputTypeComponent, listDatasource, langSearch) {
		this.listDatasource = listDatasource;
		this.ParentComponent = inputTypeComponent ;
		this.IdCriteriaGroupe = this.ParentComponent.ParentComponent.parentCriteriaGroup.id ;
		
		this.id_input = 'ecgrw-'+ this.IdCriteriaGroupe +'-input-value' ;
		this.html = '<div class="list-widget"><select id="'+this.id_input+'"></select><div class="no-items" style="display: none; font-style:italic;">'+langSearch.ListWidgetNoItem+'</div></div>' ;
		
		this.init = function init() {
			var startClassGroup_value = this.ParentComponent.ParentComponent.parentCriteriaGroup.StartClassGroup.value_selected ;
			var endClassGroup_value = this.ParentComponent.ParentComponent.parentCriteriaGroup.EndClassGroup.value_selected ;
			var ObjectPropertyGroup_value = this.ParentComponent.ParentComponent.parentCriteriaGroup.ObjectPropertyGroup.value_selected ;
			
			var itc_obj = this.ParentComponent;
			var id_input = 'ecgrw-'+ this.IdCriteriaGroupe +'-input-value' ;

			document.getElementById(id_input).style.display = 'block' ;
			document.getElementById(id_input).closest('.list-widget').querySelector('.no-items').style.display = 'none' ;

			var items = listDatasource.getItems(
				startClassGroup_value,
				ObjectPropertyGroup_value,
				endClassGroup_value,
				function( items ) {
					if (items.length > 0) {
						$.each( items, function( key, val ) {				  
							var label = listHandler.elementLabel(val) ; 
							var uri = listHandler.elementUri(val) ; 
							$('#'+id_input).append( "<option value='" + uri + "' title='" + label + "'>" + label + "</option>" );
						});
						$('#'+id_input).niceSelect();
						$('#'+id_input).on("change", function() {
							$(itc_obj).trigger('change') ;
						});
					} else {
						document.getElementById(id_input).style.display = 'none' ;
						document.getElementById(id_input).closest('.list-widget').querySelector('.no-items').style.display = 'block' ;
						console.warn('No item in widget list for :'+'\n'+' - Start Class => '+startClassGroup_value+'\n'+' - Object property => '+ObjectPropertyGroup_value+'\n'+' - End Class =>'+ endClassGroup_value+' '+'\n'+' - Get data on Url => '+options.url) ;
					} 
				}
			);
		}

		this.getValue = function() {
			var id_input = '#'+ this.id_input ;
			// return $(id_input).val() ;

			return {
				key: $(id_input).val(),
				label: $(id_input).find('option:selected').text(),
				uri: $(id_input).val()
			} ;
		}
	}

	URLListDatasource = function(listHandler) {
		
		this.getItems = function(
			startClassGroup_value,
			ObjectPropertyGroup_value,
			endClassGroup_value,
			callback
		) {
			var options = {
				url: listHandler.listUrl(
					startClassGroup_value,
					ObjectPropertyGroup_value,
					endClassGroup_value
				),
				dataType: "json",
				method: "GET",
				data: {
					  dataType: "json"
				}
			} ;
			
			var request = $.ajax( options );
			request.done(function( data ) {			  
			  	var items = listHandler.listLocation(
			  		startClassGroup_value,
			  		ObjectPropertyGroup_value,
			  		endClassGroup_value,
			  		data
			  	) ;

			  	var result = [];
			  	$.each( items, function( key, val ) {				  
					var label = listHandler.elementLabel(val) ; 
					var uri = listHandler.elementUri(val) ; 
					result[uri] = label;
				});

			  	callback(result);
			});
		}
	}

	DatesWidget = function(inputTypeComponent, datesHandler, langSearch) {
		this.datesHandler = datesHandler;
		this.ParentComponent = inputTypeComponent ;
		this.IdCriteriaGroupe = this.ParentComponent.ParentComponent.parentCriteriaGroup.id ;
		
		this.html = '<div class="date-widget"><input id="ecgrw-date-'+this.IdCriteriaGroupe+'-input" placeholder="'+langSearch.PlaceHolderDatePeriod+'" /><input id="ecgrw-date-'+this.IdCriteriaGroupe+'-input-start" placeholder="'+langSearch.PlaceHolderDateFrom+'"/><input id="ecgrw-date-'+this.IdCriteriaGroupe+'-input-stop" placeholder="'+langSearch.PlaceHolderDateTo+'" /><input id="ecgrw-date-'+this.IdCriteriaGroupe+'-input-value" type="hidden"/><button class="button-add" id="ecgrw-date-'+this.IdCriteriaGroupe+'-add">'+langSearch.ButtonAdd+'</button></div>' ;
		
		this.init = function init() {
			var startClassGroup_value = this.ParentComponent.ParentComponent.parentCriteriaGroup.StartClassGroup.value_selected ;
			var endClassGroup_value = this.ParentComponent.ParentComponent.parentCriteriaGroup.EndClassGroup.value_selected ;
			var ObjectPropertyGroup_value = this.ParentComponent.ParentComponent.parentCriteriaGroup.ObjectPropertyGroup.value_selected ;
			var phrase ="" ;
			var data_json = null ;
			
			var id_inputs = this.IdCriteriaGroupe ;			
			var itc_obj = this.ParentComponent;			
			
			$.ajax({
				url: datesHandler.datesUrl(
					startClassGroup_value,
					ObjectPropertyGroup_value,
					endClassGroup_value,
					phrase
				) ,
				async: false,
				success: function (data){
					data_json = data;
				}
			});			
			
			var options = {
				
				data: data_json,
			
				getValue: function (element) { 
					return datesHandler.elementLabel(element) ;
				},
				 
				list: {
					match: {
						enabled: true
					},

					onChooseEvent: function() {
						
						var values = $('#ecgrw-date-'+id_inputs+'-input').getSelectedItemData();
						var value = datesHandler.elementLabel(values) ;
						var start = datesHandler.elementStart(values) ;
						var stop = datesHandler.elementEnd(values) ;

						$('#ecgrw-date-'+id_inputs+'-input').val(value).trigger("change");
						$('#ecgrw-date-'+id_inputs+'-input-start').val(start).trigger("change");
						$('#ecgrw-date-'+id_inputs+'-input-stop').val(stop).trigger("change");
						
						$('#ecgrw-'+id_inputs+'-input-value').val(value).trigger("change");
					}
				},

				template: {
					type: "custom",
					method: function(value, item) {							
						var label = datesHandler.elementLabel(item) ;
						var start = datesHandler.elementStart(item) ;
						var stop  = datesHandler.elementEnd(item) ;
						return '<div>' + label + ' <span class="start">' + start + '</span><span class="end">' + stop + '</span></div>';
					}
				},

				requestDelay: 400
			};
			
			$('#ecgrw-date-'+id_inputs+'-input').easyAutocomplete(options);
			$('#ecgrw-date-'+this.IdCriteriaGroupe+'-add').on('click', function() {
				$(itc_obj).trigger("change");
			});
		}

		this.getValue = function() {
			var id_input = '#ecgrw-date-'+ this.IdCriteriaGroupe +'-input' ;
			
			var value = { 
				start: $(id_input+'-start').val(),
				stop: $(id_input+'-stop').val() 
			} ;
			
			if ((value.start == '') || (value.stop == '')) {
				value = null ;
			} else {
				if (parseInt(value.start) > parseInt(value.stop)) {
					value = null ;
				} else {
					var absoluteStartYear = (value.start.startsWith("-")?value.start.substring(1):value.start);
					var paddedAbsoluteStartYear = absoluteStartYear.padStart(4,0);
					var paddedStartYear = (value.start.startsWith("-")?"-"+paddedAbsoluteStartYear:paddedAbsoluteStartYear);
					value.start = paddedStartYear + '-01-01T00:00:00';

					var absoluteStopYear = (value.stop.startsWith("-")?value.stop.substring(1):value.stop);
					var paddedAbsoluteStopYear = absoluteStopYear.padStart(4,0);
					var paddedStopYear = (value.stop.startsWith("-")?"-"+paddedAbsoluteStopYear:paddedAbsoluteStopYear);
					value.stop = paddedStopYear + '-12-31T23:59:59';
				}
			}

			return {
				key: value.start+' '+value.stop,
				// TODO : this is not translated
				label: 'De '+ $(id_input+'-start').val() +' à '+ $(id_input+'-stop').val() + '<br/>(' + $(id_input).val() + ')',
				start: value.start,
				stop: value.stop
			};
		}		
	}
	
	TimeDatePickerWidget = function(inputTypeComponent, datesHandler, format, langSearch) {
		this.datesHandler = datesHandler;
		this.ParentComponent = inputTypeComponent ;
		
		this.IdCriteriaGroupe = this.ParentComponent.ParentComponent.parentCriteriaGroup.id ;
		this.formatDate = format ;

		placeHolder = (this.formatDate == 'day')?langSearch.PlaceholderTimeDateDayFormat:langSearch.PlaceholderTimeDateFormat ;
		this.html = '<div class="date-widget">'+langSearch.LabelDateFrom+' <input id="ecgrw-date-'+this.IdCriteriaGroupe+'-input-start" placeholder="'+placeHolder+'" autocomplete="off"/> '+langSearch.LabelDateTo+' <input id="ecgrw-date-'+this.IdCriteriaGroupe+'-input-stop" placeholder="'+placeHolder+'" autocomplete="off" /><input id="ecgrw-date-'+this.IdCriteriaGroupe+'-input-value" type="hidden"/><button class="button-add" id="ecgrw-date-'+this.IdCriteriaGroupe+'-add">'+langSearch.ButtonAdd+'</button></div>' ;
		
		this.init = function init() {
			var startClassGroup_value = this.ParentComponent.ParentComponent.parentCriteriaGroup.StartClassGroup.value_selected ;
			var endClassGroup_value = this.ParentComponent.ParentComponent.parentCriteriaGroup.EndClassGroup.value_selected ;
			var ObjectPropertyGroup_value = this.ParentComponent.ParentComponent.parentCriteriaGroup.ObjectPropertyGroup.value_selected ;
			
			var id_inputs = this.IdCriteriaGroupe ;			
			var itc_obj = this.ParentComponent;

			format = (this.formatDate == 'day')?langSearch.InputTimeDateDayFormat:langSearch.InputTimeDateFormat;
			
			var options = {
				language: langSearch.LangCodeTimeDate,
				autoHide: true,
				format: format,
				date: null,
				startView: 2
			};
			
			$('#ecgrw-date-'+id_inputs+'-input-start, #ecgrw-date-'+id_inputs+'-input-stop').datepicker(options);
			$('#ecgrw-date-'+this.IdCriteriaGroupe+'-add').on('click', function() {
				$(itc_obj).trigger("change");
			});
		}

		this.getValue = function() {
			var id_input = '#ecgrw-date-'+ this.IdCriteriaGroupe +'-input' ;
			var start = null;
			var end = null ;
			var value = null;

			if ($(id_input+'-start').val() != '' ) {
				start = $(id_input+'-start').datepicker('getDate');

				// fix for negative years
				if($(id_input+'-start').val().startsWith("-") && !start.getFullYear().toString().startsWith("-")) {
					start.setFullYear($(id_input+'-start').val())
				}

			}
			if ($(id_input+'-stop').val() != '' ) {
				end = $(id_input+'-stop').datepicker('getDate');

				// fix for negative years
				if($(id_input+'-stop').val().startsWith("-") && !end.getFullYear().toString().startsWith("-")) {
					end.setFullYear($(id_input+'-stop').val())
				}
			}

			// just compare the years to make sure we have a proper interval
			// otherwise this uses an alphabetical comparison
			if ( (start != null) && (end != null) && (end.getFullYear() < start.getFullYear()) ) {
				return null ;
			}

			if (this.formatDate == 'day') {
				dateToYMD(start, 'day') ;
				value = { start: dateToYMD(start, 'day') , stop: dateToYMD(end, 'day')  } ;
			} else {
				value = { start: dateToYMD(start, false) , stop: dateToYMD(end, false)  } ;
				if (value.start != null)  {
					value.start = value.start + '-01-01T00:00:00';
				}
				if (value.stop != null)  {
					value.stop = value.stop + '-12-31T23:59:59';
				}
			}
				
			if ((value.start == null) && (value.stop == null)) {
				value = null ;
			}

			return {
				key: value.start+' '+value.stop,
				// TODO : this is not translated
				label: this.getValueLabel(),
				start: value.start,
				stop: value.stop
			};
		}

		this.getValueLabel = function() {
			var id_input = '#ecgrw-date-'+ this.IdCriteriaGroupe +'-input' ;
			var start = $(id_input+'-start').val() ;
			var end = $(id_input+'-stop').val() ;
			var valueLabel = null;
			if ((start != '') && (end != '')) {
				valueLabel = langSearch.LabelDateFrom+' '+ $(id_input+'-start').val() +' '+langSearch.LabelDateTo+' '+ $(id_input+'-stop').val() ;
			} else if (start != '') {
				valueLabel = langSearch.DisplayValueDateFrom+' '+ $(id_input+'-start').val() ;
			} else if (end != '') {
				valueLabel = langSearch.DisplayValueDateTo+' '+ $(id_input+'-stop').val() ;
			}

			return valueLabel;
		}

		function dateToYMD(date, format) {
			if (date == null)  {
				return date ;
			}
			var d = date.getDate();
			var m = date.getMonth() + 1; //Month from 0 to 11
			var y = date.getFullYear();
			if (format == 'day') {
				return '' + y + '-' + (m<=9 ? '0' + m : m) + '-' + (d <= 9 ? '0' + d : d) + "T00:00:00";
			}
			return y ;		
		}	
	}

	SearchWidget = function(inputTypeComponent, langSearch) {
		this.ParentComponent = inputTypeComponent ;
		this.IdCriteriaGroupe = this.ParentComponent.ParentComponent.parentCriteriaGroup.id ;
		
		this.html = '<div class="search-widget"><input id="ecgrw-search-'+this.IdCriteriaGroupe+'-input-value" /><button id="ecgrw-search-'+this.IdCriteriaGroupe+'-add" class="button-add">'+langSearch.ButtonAdd+'</button></div>' ;
		
		this.init = function init() {
			var id_inputs = this.IdCriteriaGroupe;			
			var itc_obj = this.ParentComponent;			
			var CriteriaGroup = this.ParentComponent.ParentComponent.parentCriteriaGroup ;
			
			$('#ecgrw-search-'+this.IdCriteriaGroupe+'-add').on(
				'click',
				function() {
					$('#ecgrw-search-'+id_inputs+'-input-value').trigger("change");
					$(itc_obj).trigger("change");
					// N'est plus à cacher, lutilisateur peut choisi d'afficher les valeurs
					//$(CriteriaGroup.ComponentHtml[0]).addClass('hideEndClassProperty') ;
				}
			);
		}

		this.getValue = function() {
			var id_input = '#ecgrw-search-'+ this.IdCriteriaGroupe +'-input-value' ;
			// return $(id_input).val() ;

			return {
				key: $(id_input).val(),
				label: $(id_input).val(),
				search: $(id_input).val()
			}
		}
	}


	BooleanWidget = function(inputTypeComponent, langSearch) {
		this.ParentComponent = inputTypeComponent ;
		this.IdCriteriaGroupe = this.ParentComponent.ParentComponent.parentCriteriaGroup.id ;
		
		this.html = '<div class="boolean-widget" id="boolean-widget-'+this.IdCriteriaGroupe+'"><span class="boolean-value" id="boolean-widget-'+this.IdCriteriaGroupe+'-true">'+langSearch.true+'</span> <span class="or">'+langSearch.Or+'</span> <span class="boolean-value" id="boolean-widget-'+this.IdCriteriaGroupe+'-false">'+langSearch.false+'</span><input type="hidden" id="boolean-widget-'+this.IdCriteriaGroupe+'-value" /></div>' ;
		
		this.init = function init() {
			var id_inputs = this.IdCriteriaGroupe;			
			var itc_obj = this.ParentComponent;			
			var CriteriaGroup = this.ParentComponent.ParentComponent.parentCriteriaGroup ;
			var id_input = '#boolean-widget-'+ this.IdCriteriaGroupe +'-value' ;

			$('#boolean-widget-'+this.IdCriteriaGroupe+'-true').on(
				'click',
				function() {
					$(id_input).val("true");
					$(itc_obj).trigger("change");
				}
			);

			$('#boolean-widget-'+this.IdCriteriaGroupe+'-false').on(
				'click',
				function() {
					$(id_input).val("false");
					$(itc_obj).trigger("change");
				}
			);
		}

		this.getValue = function() {
			var id_input = '#boolean-widget-'+ this.IdCriteriaGroupe +'-value' ;
			
			return {
				key: $(id_input).val(),
				label: ($(id_input).val() == "true")?langSearch.true:langSearch.false,
				boolean: $(id_input).val()
			}
		}
	}


	NoWidget = function(inputTypeComponent) {
		this.html = null ;
		
		this.init = function init() {
			// nothing
		} ;

		this.getValue = function() {
			// cannot provide any value
			return null;
		}
	}

	TreeWidget = function(inputTypeComponent, loaderHandler, settings, langSearch) {
		this.loaderHandler = loaderHandler;
		this.ParentComponent = inputTypeComponent ;
		this.langSearch = langSearch;
		this.IdCriteriaGroupe = this.ParentComponent.ParentComponent.parentCriteriaGroup.id ;
		this.html = '<a id="ecgrw-'+this.IdCriteriaGroupe+'-input" class="treeBtnDisplay">'+UiuxConfig.ICON_TREE+'</a><input id="ecgrw-'+this.IdCriteriaGroupe+'-input-value" type="hidden"/><div  id="ecgrw-'+this.IdCriteriaGroupe+'-displayLayer" class="treeLayer"><div class="treeClose"><i class="far fa-times-circle"></i></div><div class="treeNotice"></div><div class="treeDisplay" id="ecgrw-'+this.IdCriteriaGroupe+'-display"></div><div class="treeActions"><a class="treeCancel">'+this.langSearch.TreeWidgetDelete+'</a><a class="treeSubmit">'+this.langSearch.TreeWidgetSelect+'</a></div></div>' ;
		
		this.init = function init() {
			var startClassGroup_value = this.ParentComponent.ParentComponent.parentCriteriaGroup.StartClassGroup.value_selected ;
			var endClassGroup_value = this.ParentComponent.ParentComponent.parentCriteriaGroup.EndClassGroup.value_selected ;
			var ObjectPropertyGroup_value = this.ParentComponent.ParentComponent.parentCriteriaGroup.ObjectPropertyGroup.value_selected ;
			
			var id_inputs = this.IdCriteriaGroupe ;			
			this.itc_obj = this.ParentComponent;	

			//console.log(this.loaderHandler) ;
			var self = this ;
			var options = {
				'core' : {
					"multiple" : true,
					'data' : function (node, callback) {

						var options = {
							url: node.id === '#' ?
						 		loaderHandler.treeRootUrl(startClassGroup_value, ObjectPropertyGroup_value, endClassGroup_value) :
						 		loaderHandler.treeChildrenUrl(startClassGroup_value, ObjectPropertyGroup_value, endClassGroup_value, node.id),
							dataType: "json",
							method: "GET",
							data: {
								  dataType: "json"
							}
						} ;
	
						var request = $.ajax( options );

						request.done(function( data ) {
							var result = [];
							var items = loaderHandler.nodeListLocation(startClassGroup_value, ObjectPropertyGroup_value, endClassGroup_value, data);
							for (var i = 0; i < items.length; i++) {
								var aNode = {
									id: loaderHandler.nodeUri(items[i]),
									text: loaderHandler.nodeLabel(items[i])
								};
								if(loaderHandler.nodeHasChildren(items[i])) {
									aNode.children = true ;
								}			
								if(loaderHandler.nodeDisabled(items[i])) {
									aNode.state = {
										disabled  : true  // node disabled
									}
								} 
								aNode.parent=node.id;
								result.push(aNode);
							}
							callback.call(this, result);
							if( node.id === '#') {
								self.onTreeDataLoaded(result);
							}
							
						});
			        },
					"themes" : {
						"icons" : false
					}
				},
				/*"massload" : {
					"url" : loaderHandler.treeChildrenUrl(startClassGroup_value, ObjectPropertyGroup_value, endClassGroup_value, node.id),
					"data" : function (nodes) {
					  return { "ids" : nodes.join(",") };
					}
				},*/
				"checkbox" : {
					"keep_selected_style" : false,
					"three_state" : true,
					"cascade_to_disabled" : true
				},
				"plugins" : [ "changed", "wholerow", "checkbox"/*, "massload", "state" */ ]
			} ;
			//Need to add in html befor
			
			this.jsTree = $('#ecgrw-'+id_inputs+'-display').jstree(options);

			$('#ecgrw-'+this.IdCriteriaGroupe+'-input').on("click",  { arg1 : this },  this.onClickDisplay);
			//disable/enable on max selction 
			this.jsTree.on("changed.jstree",  { arg1 : this },  this.onChangedJstree);
			this.jsTree.on("after_open.jstree",  { arg1 : this },  this.onChangedJstree);

			$('#ecgrw-'+this.IdCriteriaGroupe+'-displayLayer').find('.treeSubmit').on("click",  { arg1 : this },  this.onClickSelect);
			$('#ecgrw-'+this.IdCriteriaGroupe+'-displayLayer').find('.treeCancel').on("click",  { arg1 : this },  this.onClickCancel);
			$('#ecgrw-'+this.IdCriteriaGroupe+'-displayLayer').find('.treeClose').on("click",  { arg1 : this },  this.onClickClose);

			
			$('#ecgrw-'+this.IdCriteriaGroupe+'-displayLayer').hide() ;

			/*$('#ecgrw-'+id_inputs+'-input').on('changed.jstree', function (e, data) {
				if(data && data.selected && data.selected.length) {
					$.get(loaderHandler.treeChildrenUrl(startClassGroup_value, ObjectPropertyGroup_value, endClassGroup_value, data.selected.join(':')) , function (d) {
						if(d && typeof d.type !== 'undefined') {
							$('#data .content').hide();
							switch(d.type) {
								case 'text':
								case 'txt':
								case 'md':
								case 'htaccess':
								case 'log':
								case 'sql':
								case 'php':
								case 'js':
								case 'json':
								case 'css':
								case 'html':
									$('#data .code').show();
									$('#code').val(d.content);
									break;
								case 'png':
								case 'jpg':
								case 'jpeg':
								case 'bmp':
								case 'gif':
									$('#data .image img').one('load', function () { $(this).css({'marginTop':'-' + $(this).height()/2 + 'px','marginLeft':'-' + $(this).width()/2 + 'px'}); }).attr('src',d.content);
									$('#data .image').show();
									break;
								default:
									$('#data .default').html(d.content).show();
									break;
							}
						}
					});
				}
			});*/
		}

		this.onTreeDataLoaded = function onTreeDataLoaded(result) {
			if(result.length == 0) {
				$('#ecgrw-'+this.IdCriteriaGroupe+'-displayLayer .treeNotice').text(this.langSearch.TreeWidgetNoData).show() ;
				
			} else {
				$('#ecgrw-'+this.IdCriteriaGroupe+'-displayLayer .treeNotice').hide() ;
			}
		}
		
		//limit to 3 selction
		this.onChangedJstree = function (e, data) {
			this_ = e.data.arg1;
			var items = $(this_.jsTree).find('li.jstree-node') ;

			var selecteds = this_.jsTree.jstree().get_top_checked() ;
			for (var i = 0; i < items.length; i++) {
				var id = $(items[i]).attr('id') ;
				if(selecteds.indexOf(id) > -1) {
					$(items[i]).addClass('tree-item-selected') ;
				} else {
					$(items[i]).removeClass('tree-item-selected') ;
				}
				if($(items[i]).parents('.tree-item-selected').length  > 0) {
					var node = this_.jsTree.jstree(true).get_node(id) ;
					if(!this_.jsTree.jstree(true).is_disabled(node)) {
						$(items[i]).addClass('is-reactivable') ;
						this_.jsTree.jstree(true).disable_checkbox(node);
						this_.jsTree.jstree(true).disable_node(node);
					}
				} else {
					if($(items[i]).hasClass('is-reactivable') ) {
						$(items[i]).addClass('red') ;
						this_.jsTree.jstree('enable_checkbox', id);
						this_.jsTree.jstree(true).enable_node(id);
					}
				}
			}
			
			//console.log(data);
			if (this_.jsTree.jstree().get_top_checked().length >= settings.maxOr) {
				
				for (var i = 0; i < items.length; i++) {
					var id = $(items[i]).attr('id') ;
					if(selecteds.indexOf(id) == -1) {
						var node = this_.jsTree.jstree(true).get_node(id) ;
						if(!this_.jsTree.jstree(true).is_disabled(node)) {
							$(items[i]).addClass('is-reactivable') ;
							this_.jsTree.jstree(true).disable_checkbox(node);
							this_.jsTree.jstree(true).disable_node(node);
						}
						
					}
				}
				this_.jsTree.addClass('max-selected') ;
			} else {
				if (this_.jsTree.hasClass('max-selected')) {
					var items = $(this_.jsTree).find('li.jstree-node') ;
					for (var i = 0; i < items.length; i++) {
						var id = $(items[i]).attr('id') ;
						if(selecteds.indexOf(id) == -1) {
							if($(items[i]).hasClass('is-reactivable') ) {
								$(items[i]).addClass('red') ;
								if($(items[i]).parents('.tree-item-selected').length  == 0) {
									this_.jsTree.jstree('enable_checkbox', id);
									this_.jsTree.jstree(true).enable_node(id);
								}
							}
						}
					}
					this_.jsTree.removeClass('max-selected')
				}
			}
		}

		this.onClickDisplay = function(e) {
			this_ = e.data.arg1;
			$('#ecgrw-'+this_.IdCriteriaGroupe+'-displayLayer').show() ;
		}
		this.onClickCancel = function(e) {
			this_ = e.data.arg1;
			this_.jsTree.jstree().deselect_all() 
			//$('#ecgrw-'+this_.IdCriteriaGroupe+'-displayLayer').hide() ;
		}
		this.onClickSelect = function(e) {
			this_ = e.data.arg1;
			$('#ecgrw-'+this_.IdCriteriaGroupe+'-displayLayer').hide() ;
			$(this_.itc_obj).trigger("change");
		}
		this.onClickClose = function(e) {
			this_ = e.data.arg1;
			$('#ecgrw-'+this_.IdCriteriaGroupe+'-displayLayer').hide() ;
		}

		this.getValue = function() {
			//var id_input = '#ecgrw-'+ this.IdCriteriaGroupe +'-input-value' ;
			//var id_input_label = '#ecgrw-'+ this.IdCriteriaGroupe +'-input' ;

			var checked = this.jsTree.jstree().get_top_checked  (true) ;

			return checked ;
		}
	};