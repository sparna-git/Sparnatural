
# Sparnatural documentation

_For examples of how Sparnatural works and can be configured, have a look at the [**demos folder**](https://github.com/sparna-git/sparnatural.eu/tree/main/demos) of [sparnatural.eu](http://sparnatural.eu) website._


## 1. Features

- [Reference documentation of Sparnatural widgets](widgets.md) : all the possible ways to select a criteria value in Sparnatural. Read this to learn some of the features of Sparnatural.


## 2. Getting started

- **[Hello Sparnatural](hello-sparnatural/Hello-Sparnatural.md)** : start here to integrate Sparnatural in your own website, from the tutorial page.


## 3. Configuring Sparnatural

### 3.1 SHACL configuration

Sparnatural is configured by a configuration file expressed in SHACL. The configuration file can be edited in an Excel spreadsheet.

- **[How-to configure in SHACL](how-to-configure-shacl/How-to-configure-Sparnatural-shacl.html)** : a detailled documentation for configuring Sparnatural in a spreadsheet. Start here to learn the different configuration options of Sparnatural.
- [Reference page of SHACL configuration](SHACL-based-configuration.md) : the list of all SHACL constructs Sparnatural understands

### 3.2 deprecated OWL configuration

Historically, Sparnatural also supported configuration specified in OWL :

- [How-to configure in OWL](how-to-configure-owl/How-to-configure-Sparnatural.md) : a detailled documentation for configuring Sparnatural in an OWL spreadsheet (that is converted into a OWL configuration file). This is deprecated and now replaced by the SHACL configuration guide.
- [Configure in OWL using Protégé](OWL-based-configuration.md) : a reference page of all useful OWL axioms and annotations to configure Sparnatural with OWL
- [Configure datasources in OWL](OWL-based-configuration-datasources.md) : a reference page of all included datasources and how-to write your own datasource

### 3.3 Advanced configuration

- [Querying date ranges](Querying-date-ranges.md) - How to generate SPARQL queries that can match on resources with a begin date and a end date 
- [Federated query support](Federated-querying.md) - How to enable federated querying using SERVICE keyword in your configuration
- [Querying multiple endpoints](Querying-multiple-endpoints.md) - How to configure Sparnatural so that it can query multiple endpoints at the same time in a transparent way
- [Integration with GraphDB Lucene Connector](Integration-with-GraphDB-Lucene-Connector.md) - Special configuration to interact with a GraphDB Lucene index 


## 4. Integrating Sparnatural in HTML / React

- [**HTML page and Javascript integration**](Javascript-integration.md) - The reference page to understand how the `<spar-natural` web component can be integrated in your webpage
- [YasGUI specific plugins](YasGUI-plugins.md) - Read if you are using YasGUI in combination with Sparnatural, to understand the Sparnatural specific plugins
- [Customize colors](Customize-colors.md) - How to customize colors of Sparnatural

**Advanced integration**

- [React integration](react-integration.md) - Initialization of Sparnatural as a custom component within react
- [Query JSON format](Query-JSON-format.md) - Documentation on the JSON structure used by Sparnatural to output and reload queries
- [Using a SPARQL proxy](SPARQL-proxy.md) - if your SPARQL endpoint is not CORS-enabled, or uses http while your query page uses https
- [Querying a password protected SPARQL endpoint](Querying-a-password-protected-SPARQL-endpoint.md)

## 5. Extending Sparnatural

- [How to create your own widget](diy-widget.md)

## 6. FAQ

- [FAQ](FAQ.md) - Frequently Asked Questions

## 7. Other resources

- Check out [the bibliography section of the website](https://sparnatural.eu#bibliography) where you can find presentation material on Sparnatural
- Check out [the YouTube channel](https://www.youtube.com/playlist?list=PL3kB_eBB1Pc3FBOtevNtRkSw4YmWar4q5) for videos of Sparnatural
- Don't hesitate to [ask questions on the Github issue tracker](https://github.com/sparna-git/Sparnatural/issues)
- [Sparna](http://sparna.fr) can provide some support on setting up Sparnatural, so get in touch at thomas /dot/ francart /at/ sparna /dot/ fr 

## 8. Archives

**deprecated JSON configuration**

- [Configure in JSON(-LD)](archives/JSON-based-configuration.md)
- [Configure datasources in JSON](archives/JSON-based-configuration-datasources.md)

**deprecated v7 Javascript integration page**

- [Javascript integration v7 (old)](Javascript-integration-v7.md) - Reference page for Javascript integration and parameters for the old version 7
