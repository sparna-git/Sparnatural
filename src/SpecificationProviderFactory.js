


export class SpecificationProviderFactory {

	build(config, language, callback) {
		if(typeof(config) == "object") {
			// if the config is a JSON object in the page, read it directly
			callback(new SimpleJsonLdSpecificationProvider(config, language));
		} else {
			if(config.startsWith("http")) {
				if(config.includes("json")) {
					// otherwise interpret it as a URL, load id and parse the result
					$.when(
						$.getJSON( config, function( data ) {
							callback(new SimpleJsonLdSpecificationProvider(data, language));
						}).fail(function(response) {
							console.log("Sparnatural - unable to load config file : " +config);
							console.log(response);
						})
					).done(function() {});
				} else {
					// TODO : dynamic loading of RDF file
				}
			} else {
				// suppose it is RDF String
				RDFSpecificationProvider.build(config, language).then(function(provider) {
				    console.log(provider);
				    callback(provider);
				});
			}
		}
	}
}
