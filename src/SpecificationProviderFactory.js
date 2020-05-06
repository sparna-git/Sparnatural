


export class SpecificationProviderFactory {

	build(config, language, callback) {
		if(typeof(config) == "object") {
			// if the config is a JSON object in the page, read it directly
			callback(new JsonLdSpecificationProvider(config, language));
		} else if(config.includes("@prefix") || config.includes("<http")) {
			// inline Turtle
			RDFSpecificationProvider.build(config, language).then(function(provider) {
			    console.log(provider);
			    callback(provider);
			});
		} else {
			if(config.includes("json")) {
				// otherwise interpret it as a URL, load id and parse the result
				$.when(
					$.getJSON( config, function( data ) {
						callback(new JsonLdSpecificationProvider(data, language));
					}).fail(function(response) {
						console.log("Sparnatural - unable to load config file : " +config);
						console.log(response);
					})
				).done(function() {});
			} else if(config.includes("ttl")) {
				$.ajax({
				  method: "GET",
				  url: config
				})
				.done( function( configData ) {
					RDFSpecificationProvider.build(configData, language).then(function(provider) {
					    console.log(provider);
					    callback(provider);
					});
				})
				.fail(function(response) {
						console.log("Sparnatural - unable to load config file : " +config);
						console.log(response);
				});
			} else {
				console.log("Sparnatural - unable to determine config type : " +config);
			}
		}
	}
}
