(function( $ ) {
 
    $.fn.SimSemSearchForm = function( options ) {
 
        var specSearch = {} ;
		var defaults = {
			pathSpecSearch: 'config/spec-search.json'
		};
		
		var settings = $.extend( {}, defaults, options );
		
		
		
		this.each(function() {
            var thisForm = $(this) ;
			$.when( loadSpecSearch() ).done(function() {
				var items = initForm() ;
				
				
				$( "<ul/>", {
				"class": "my-new-list",
				html: items.join( "" )
			  }).appendTo( thisForm );
				 });
				
        });
		
		function loadSpecSearch() {
			
			return $.getJSON( settings.pathSpecSearch, function( data ) {
				specSearch = data ;
			}) ;
		}
		
		function initForm(thisForm_) {
			console.log(specSearch) ;
			
			var items = [];
			$.each( specSearch['@graph'], function( key, val ) {
				if ( val['@type'] == 'ObjectProperty') {
					console.log(val) ;
					if ($.type(val['domain']) === "object") {
						$.each( val['domain']['unionOf']['@list'], function( domkey, domval ) {

							items.push( "<li id='" + domkey + "'>" + key+ "-"+ domkey + " - " + domval['@id'] + "</li>" );
						}) ;
						
					} else {
						console.log(val)
						items.push( "<li id='" + key + "-1'>" + key + " - " + val.domain + "</li>" );
					}
					
				}
				
			  });
			//$(thisForm).append('<ul></ul>').append(items) ;
			
			return items;
				}
		
		
		
		return this ;
    }
	
	
 
}( jQuery ));