	
	
	AutoCompleteWidget = function(inputTypeComponent, autocompleteHandler) {
		this.autocompleteHandler = autocompleteHandler;
		this.ParentComponent = inputTypeComponent ;

		this.IdCriteriaGroupe = this.ParentComponent.ParentComponent.ParentComponent.id ;
		this.html = '<input id="ecgrw-'+this.IdCriteriaGroupe+'-input" /><input id="ecgrw-'+this.IdCriteriaGroupe+'-input-value" type="hidden"/>' ;
		
		this.init = function init() {
			var startClassGroup_value = this.ParentComponent.ParentComponent.ParentComponent.StartClassGroup.value_selected ;
			var endClassGroup_value = this.ParentComponent.ParentComponent.ParentComponent.EndClassGroup.value_selected ;
			var ObjectPropertyGroup_value = this.ParentComponent.ParentComponent.ParentComponent.ObjectPropertyGroup.value_selected ;
			
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
						$('#ecgrw-'+id_inputs+'-input-value').val(uri).trigger("change");$(itc_obj).trigger("change");
					}
				},

				requestDelay: 400
			};
			//Need to add in html befor
			
			$('#ecgrw-'+id_inputs+'-input').easyAutocomplete(options);
		}

		this.getValue = function() {
			var id_input = '#ecgrw-'+ this.IdCriteriaGroupe +'-input-value' ;
			return $(id_input).val() ;
		}

		this.getValueLabel = function() {
			var id_input = '#ecgrw-'+ this.IdCriteriaGroupe +'-input' ;
			return '<span>' + $(id_input).val()  + '</span>' ;
		}
	};
	
	ListWidget = function(inputTypeComponent, listHandler, langSearch, settings) {
		this.listHandler = listHandler;
		this.ParentComponent = inputTypeComponent ;
		this.IdCriteriaGroupe = this.ParentComponent.ParentComponent.ParentComponent.id ;
		
		this.id_input = 'ecgrw-'+ this.IdCriteriaGroupe +'-input-value' ;
		this.html = '<div class="list-widget"><select id="'+this.id_input+'"></select><div class="no-items" style="display: none; font-style:italic;">'+langSearch.ListWidgetNoItem+'</div></div>' ;
		//this.select = $('<select id="'+this.id_input+'"></select>');
		
		this.init = function init() {
			var startClassGroup_value = this.ParentComponent.ParentComponent.ParentComponent.StartClassGroup.value_selected ;
			var endClassGroup_value = this.ParentComponent.ParentComponent.ParentComponent.EndClassGroup.value_selected ;
			var ObjectPropertyGroup_value = this.ParentComponent.ParentComponent.ParentComponent.ObjectPropertyGroup.value_selected ;
			
			var itc_obj = this.ParentComponent;
			var id_input = 'ecgrw-'+ this.IdCriteriaGroupe +'-input-value' ;

			document.getElementById(id_input).style.display = 'block' ;
			document.getElementById(id_input).closest('.list-widget').querySelector('.no-items').style.display = 'none' ;

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
			let url = listHandler.listUrl(
				startClassGroup_value,
				ObjectPropertyGroup_value,
				endClassGroup_value
			);
			let Init = { method: 'GET',
				headers: new Headers(),
				mode: 'cors',
				cache: 'default' 
			};
			let temp = new LocalCacheData() ;
			let fetchpromise = temp.fetch(url, options, settings.localCacheDataTtl) ;
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
			
			/*var request = $.ajax( options );
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
				} 
			});*/
		}

		this.getValue = function() {
			var id_input = '#'+ this.id_input ;
			return $(id_input).val() ;
		}

		this.getValueLabel = function() {
			var id_input = '#'+ this.id_input ;
			return '<span>' + $(id_input).find('option:selected').text() + '</span>' ;
		}
	}
	
	DatesWidget = function(inputTypeComponent, datesHandler, langSearch) {
		this.datesHandler = datesHandler;
		this.ParentComponent = inputTypeComponent ;
		this.IdCriteriaGroupe = this.ParentComponent.ParentComponent.ParentComponent.id ;
		
		this.html = '<div class="date-widget"><input id="ecgrw-date-'+this.IdCriteriaGroupe+'-input" placeholder="'+langSearch.PlaceHolderDatePeriod+'" /><input id="ecgrw-date-'+this.IdCriteriaGroupe+'-input-start" placeholder="'+langSearch.PlaceHolderDateFrom+'"/><input id="ecgrw-date-'+this.IdCriteriaGroupe+'-input-stop" placeholder="'+langSearch.PlaceHolderDateTo+'" /><input id="ecgrw-date-'+this.IdCriteriaGroupe+'-input-value" type="hidden"/><button class="button-add" id="ecgrw-date-'+this.IdCriteriaGroupe+'-add">'+langSearch.ButtonAdd+'</button></div>' ;
		
		this.init = function init() {
			var startClassGroup_value = this.ParentComponent.ParentComponent.ParentComponent.StartClassGroup.value_selected ;
			var endClassGroup_value = this.ParentComponent.ParentComponent.ParentComponent.EndClassGroup.value_selected ;
			var ObjectPropertyGroup_value = this.ParentComponent.ParentComponent.ParentComponent.ObjectPropertyGroup.value_selected ;
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
			
			var value = { start: $(id_input+'-start').val() , stop: $(id_input+'-stop').val()  } ;
			
			if ((value.start == '') || (value.stop == '')) {
				value = null ;
			} else {
				if (parseInt(value.start) > parseInt(value.stop)) {
					value = null ;
				} else {
					value.start = value.start + '-01-01';
					value.stop = value.stop + '-12-31';
				}
			}

			return value;
		}

		this.getValueLabel = function() {
			var id_input = '#ecgrw-date-'+ this.IdCriteriaGroupe +'-input' ;
			// TODO : this is not translated
			return '<span class="label-two-line">De '+ $(id_input+'-start').val() +' à '+ $(id_input+'-stop').val() + '<br/>(' + $(id_input).val() + ')</span>' ;
		}		
	}
	
	TimeDatePickerWidget = function(inputTypeComponent, datesHandler, format, langSearch) {
		this.datesHandler = datesHandler;
		this.ParentComponent = inputTypeComponent ;
		
		this.IdCriteriaGroupe = this.ParentComponent.ParentComponent.ParentComponent.id ;
		this.formatDate = format ;

		placeHolder = (this.formatDate == 'day')?langSearch.PlaceholderTimeDateDayFormat:langSearch.PlaceholderTimeDateFormat ;
		this.html = '<div class="date-widget">'+langSearch.LabelDateFrom+' <input id="ecgrw-date-'+this.IdCriteriaGroupe+'-input-start" placeholder="'+placeHolder+'" autocomplete="off"/> '+langSearch.LabelDateTo+' <input id="ecgrw-date-'+this.IdCriteriaGroupe+'-input-stop" placeholder="'+placeHolder+'" autocomplete="off" /><input id="ecgrw-date-'+this.IdCriteriaGroupe+'-input-value" type="hidden"/><button class="button-add" id="ecgrw-date-'+this.IdCriteriaGroupe+'-add">'+langSearch.ButtonAdd+'</button></div>' ;
		
		this.init = function init() {
			var startClassGroup_value = this.ParentComponent.ParentComponent.ParentComponent.StartClassGroup.value_selected ;
			var endClassGroup_value = this.ParentComponent.ParentComponent.ParentComponent.EndClassGroup.value_selected ;
			var ObjectPropertyGroup_value = this.ParentComponent.ParentComponent.ParentComponent.ObjectPropertyGroup.value_selected ;
			
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

			return value;
		}

		this.getValueLabel = function() {
			var id_input = '#ecgrw-date-'+ this.IdCriteriaGroupe +'-input' ;
			var start = $(id_input+'-start').val() ;
			var end = $(id_input+'-stop').val() ;
			var valueLabel = null;
			if ((start != '') && (end != '')) {
				valueLabel = '<span class="label-two-line">'+langSearch.LabelDateFrom+' '+ $(id_input+'-start').val() +' '+langSearch.LabelDateTo+' '+ $(id_input+'-stop').val() + '</span>' ;
			} else if (start != '') {
				valueLabel = '<span class="label-two-line">'+langSearch.DisplayValueDateFrom+' '+ $(id_input+'-start').val() + '</span>' ;
			} else if (end != '') {
				valueLabel = '<span class="label-two-line">'+langSearch.DisplayValueDateTo+' '+ $(id_input+'-stop').val() + '</span>' ;
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
		this.IdCriteriaGroupe = this.ParentComponent.ParentComponent.ParentComponent.id ;
		
		this.html = '<div class="search-widget"><input id="ecgrw-search-'+this.IdCriteriaGroupe+'-input-value" /><button id="ecgrw-search-'+this.IdCriteriaGroupe+'-add" class="button-add">'+langSearch.ButtonAdd+'</button></div>' ;
		
		this.init = function init() {
			var id_inputs = this.IdCriteriaGroupe;			
			var itc_obj = this.ParentComponent;			
			var CriteriaGroup = this.ParentComponent.ParentComponent.ParentComponent ;
			
			$('#ecgrw-search-'+this.IdCriteriaGroupe+'-add').on(
				'click',
				function() {
					$('#ecgrw-search-'+id_inputs+'-input-value').trigger("change");
					$(itc_obj).trigger("change");
					$(CriteriaGroup.ComponentHtml[0]).addClass('hideEndClassProperty') ;
				}
			);
		}

		this.getValue = function() {
			var id_input = '#ecgrw-search-'+ this.IdCriteriaGroupe +'-input-value' ;
			return $(id_input).val() ;
		}

		this.getValueLabel = function() {
			var id_input = '#ecgrw-search-'+ this.IdCriteriaGroupe +'-input-value' ;
			return '<span>'+ $(id_input).val() +'</span>' ;
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

		this.getValueLabel = function() {
			// cannot provide any value label 
			return null;
		}
	}