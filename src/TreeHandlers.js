class SparqlTreeHandler {

	constructor(sparqlEndpointUrl, sparqlPostprocessor, language, labelPath, sparqlTemplate) {
		this.sparqlEndpointUrl = sparqlEndpointUrl;
		this.sparqlPostprocessor = sparqlPostprocessor;
		this.language = language;
		this.labelPath = (labelPath != null)?labelPath:"rdfs:label";
		this.sparqlTemplate = sparqlTemplate;
		this.listOrder = "alphabetical";
	}

	/**
	 * Post-processes the SPARQL query and builds the full URL for root of tree
	 **/
	 treeRootUrl(domain, property, range, key) {			
		/*var sparql = this._buildTreeRootSparql(domain, property, range, key);
		sparql = this.sparqlPostprocessor.semanticPostProcess(sparql);

		var separator = (this.sparqlEndpointUrl.indexOf("?") > 0)?"&":"?";
		var url = this.sparqlEndpointUrl+separator+"query="+encodeURIComponent(sparql)+"&format=json";
		return url;*/
		return '/stubs/treeRoot.json' ;
	}
	/**
	 * Post-processes the SPARQL query and builds the full URL for root of tree
	 **/
	treeChildsUrl(domain, property, range, key) {			
		/*var sparql = this._buildTreeChildsSparql(domain, property, range, key);
		sparql = this.sparqlPostprocessor.semanticPostProcess(sparql);

		var separator = (this.sparqlEndpointUrl.indexOf("?") > 0)?"&":"?";
		var url = this.sparqlEndpointUrl+separator+"query="+encodeURIComponent(sparql)+"&format=json";
		return url;*/

		return '/stubs/treeChilds-'+key+'.json' ;
	}

	/**
	 * Constructs the SPARQL query to use for autocomplete widget search.
	 **/
	 _buildTreeRootSparql(domain, property, range, key) {
		
		var sparql = this.sparqlTemplate;

		var reDomain = new RegExp("\\$domain","g");
		var reProperty = new RegExp("\\$property","g");
		var reRange = new RegExp("\\$range","g");
		var reLang = new RegExp("\\$lang","g");
		var reKey = new RegExp("\\$key","g");
		
		sparql = this.sparqlTemplate
			.replace(reDomain, "<"+ domain +">")
			.replace(reProperty, "<"+ property +">")
			.replace(reRange, "<"+ range +">")
			.replace(reLang, "'"+ this.language +"'")
			.replace(reKey, "" + key + "");

		if(this.labelPath != null) {
			var reLabelPath = new RegExp("\\$labelPath","g");
			sparql = sparql.replace(reLabelPath, this.labelPath );
		}

		console.log(sparql);

		return sparql;
	}

	/**
	 * Constructs the SPARQL query to use for autocomplete widget search.
	 **/
	 _buildTreeChildsSparql(domain, property, range, key) {
		
		var sparql = this.sparqlTemplate;

		var reDomain = new RegExp("\\$domain","g");
		var reProperty = new RegExp("\\$property","g");
		var reRange = new RegExp("\\$range","g");
		var reLang = new RegExp("\\$lang","g");
		var reKey = new RegExp("\\$key","g");
		
		sparql = this.sparqlTemplate
			.replace(reDomain, "<"+ domain +">")
			.replace(reProperty, "<"+ property +">")
			.replace(reRange, "<"+ range +">")
			.replace(reLang, "'"+ this.language +"'")
			.replace(reKey, "" + key + "");

		if(this.labelPath != null) {
			var reLabelPath = new RegExp("\\$labelPath","g");
			sparql = sparql.replace(reLabelPath, this.labelPath );
		}

		console.log(sparql);

		return sparql;
	}

	treeLocation(domain, property, range, data) {
		return data.results.bindings;
	}

	elementLabel(element) {
		return element.label.value;
	}

	/* TODO : rename to elementValue */
	elementUri(element) {
		if(element.uri) {
			return element.uri.value;
		} else if(element.value) {
			return element.value.value;
		}
	}

	enableMatch(domain, property, range) {
		return false;
	}
}





module.exports = {
	SparqlTreeHandler: SparqlTreeHandler
}