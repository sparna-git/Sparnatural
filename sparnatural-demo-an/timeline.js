
var timelinePlugin = function(yasr) {
  var plugin = {};
  //var options = $.extend(true, {}, timelinePlugin.defaults);
  var cm = null;
  
  var draw = function() {
     var container = $("<div id='timeResult' style='margin-top:1em;'></div>");
     container.empty().appendTo(yasr.resultsContainer);
     var element = document.getElementById('timeResult');
     var itemsList=[];  

     var bindings = yasr.results.getBindings();
     if (!bindings || bindings.length === 0) {
    	 return [];
     }
    
     for (var i = 0; i < bindings.length; i++) {
      
          var binding 	= bindings[i];
          var label		= null;
          var stringFirstDate = null;
          var stringSecondDate= null;
          var uri=null; 
          
          for (var bindingVar in binding) {
                //check if value is a xsd date
                if(hasDateDatatype(binding[bindingVar]) || hasGYearDatatype(binding[bindingVar])) {                
                    if(stringFirstDate == null) {
                    	stringFirstDate = binding[bindingVar].value;
                    } else {
                    	stringSecondDate = binding[bindingVar].value;
                    }
              } else if (binding[bindingVar].type == 'literal') {
                  label = binding[bindingVar].value;
              } else if(binding[bindingVar].type == 'uri') {
            	  uri=binding[bindingVar].value;
              }   
          }
          
          // parse the dates
          var start =	(stringFirstDate !== null)?parseDate(stringFirstDate):null;
          var end   =	(stringSecondDate !== null)?parseDate(stringSecondDate):null;
          
          // generate a default label if null
          if(label == null) {
        	  label = stringFirstDate+' / '+stringSecondDate;
          }
          
          // if we have start and end date
          if(stringFirstDate != null && stringSecondDate != null){
                if(start.getTime() < end.getTime()){
                  itemsList.push({
                    id: 		i+1,
                    content: 	'<a href="'+uri+'" target="_blank" style="text-decoration:none; cursor:pointer;" title="'+uri+'">'+label+'</a>', 
                    start: 		start, 
                    end: 		end, 
                    title: 		label + ' ('+ stringFirstDate+' / '+stringSecondDate+ ')'
                  });
                } else {
                  itemsList.push({
                    id: 		i+1, 
                    content: 	'<a href="'+uri+'" style="text-decoration:none; cursor:pointer;" target="_blank" title="'+uri+'">'+label+'</a>', 
                    start: 		end, 
                    end: 		start, 
                    title:		label + ' (' + stringSecondDate+' / '+stringFirstDate + ')'
                  });
                }
          }

          // if we have only one date
          if(stringFirstDate != null && stringSecondDate == null){  
            itemsList.push({
              id: 		i+1, 
              content: 	'<a href="'+uri+'" style="text-decoration:none; cursor:pointer;" target="_blank" title="'+uri+'">'+label+'</a>', 
              start: 	start,
              title: 	label + ' (' + stringFirstDate + ')'
            });
          }
      
    }

    var items = new vis.DataSet(itemsList);

    var options = {
    		limitSize : false,
    		showTooltips: true,
    		tooltip: {
		      followMouse: true,
		      overflowMethod: 'cap'
		    }
    };



    // Create a Timeline
    var timeline = new vis.Timeline(element, items, options);

  };
  
  var parseDate = function(value) {
	var dateParts = value.match(/(-?\d\d?\d?\d?)-(\d\d?)-(\d\d?)/);
	
	if(dateParts == null) {
		dateParts = value.match(/(-?\d\d?\d?\d?)/);
		dateParts[2] = "01";
		dateParts[3] = "01";
	}
	
  	dateParts[2] -= 1; //months are zero-based
  	// use 3 variables constructor for proper handling of negative dates
  	// see https://stackoverflow.com/questions/41340836/why-does-date-accept-negative-values
  	return new Date(dateParts[1], dateParts[2], dateParts[3]);
  }

  var canHandleResults = function() {
	var dateVars = getDateVariables();
	return dateVars.length == 1 || dateVars.length == 2;
  };


  var getDateVariables = function() {
    if (!yasr.results) return [];
    var bindings = yasr.results.getBindings();
    if (!bindings || bindings.length === 0) {
      return [];
    }
    var dateVars = [];
    var checkedVars = [];
    for (var i = 0; i < bindings.length; i++) {
      var binding = bindings[i];
      for (var bindingVar in binding) {
        if (checkedVars.indexOf(bindingVar) === -1 && binding[bindingVar].value) {
          checkedVars.push(bindingVar);
          if (hasDateDatatype(binding[bindingVar]) || hasGYearDatatype(binding[bindingVar])) {
        	  dateVars.push(bindingVar);
          }
        }
      }
      
      if (checkedVars.length === yasr.results.getVariables().length) {
        //checked all vars. can break now
        break;
      }
    }
    
    return dateVars;
  };
  
  var hasDateDatatype = function(value) {
    if(value.datatype == 'http://www.w3.org/2001/XMLSchema#date'){
      return true;
    }else{
      return false;
    }
  };
  
  var hasGYearDatatype = function(value) {
    if(value.datatype == 'http://www.w3.org/2001/XMLSchema#gYear'){
      return true;
    }else{
      return false;
    }
  };

  
  return {
    draw: draw,
    name: "Timeline",
    canHandleResults: canHandleResults,
    getPriority: 1
  };
};

