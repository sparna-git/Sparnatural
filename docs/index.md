
# Sparnatural documentation

[![French](https://github.com/madebybowtie/FlagKit/raw/master/Assets/PNG/FR.png) Documentation en français](/fr)

_For examples of how Sparnatural works and can be configured, have a look at the [**demos folder**](https://github.com/sparna-git/sparnatural.eu/tree/main/demos) of [sparnatural.eu](http://sparnatural.eu) website._


## 1. Features

- [Reference documentation of Sparnatural widgets](widgets.md) : all the possible ways to select a criteria value in Sparnatural. Read this to learn some of the features of Sparnatural.


## 2. Getting started

- **[Hello Sparnatural](hello-sparnatural/Hello-Sparnatural.md)** : start here to integrate Sparnatural in your own website, from the tutorial page.


## 3. Configuring Sparnatural

**in a Spreadsheet**

- **[How-to configure](how-to-configure/How-to-configure-Sparnatural.md)** : a detailled documentation for configuring Sparnatural in a spreadsheet (that is converted into a OWL configuration file). Start here to learn the different configuration options of Sparnatural.

**in OWL**

OWL is the recommmended way to configure Sparnatural :

- [Configure in OWL using Protégé](OWL-based-configuration.md) : a reference page of all useful OWL axioms and annotations to configure Sparnatural with OWL
- [Configure datasources in OWL](OWL-based-configuration-datasources.md) : a reference page of all included datasources and how-to write your own datasource

**in SHACL**

_This is a beta feature_

SHACL is also supported to configure Sparnatural.

- [Configure in SHACL](SHACL-based-configuration.md) : a reference page detailling how Sparnatural can be configured in SHACL.

**in JSON (deprecated)**

_This is a deprecated feature_

- [Configure in JSON(-LD)](JSON-based-configuration.md)
- [Configure datasources in JSON](JSON-based-configuration-datasources.md)

**Advanced configuration**

- [Using a SPARQL proxy](SPARQL-proxy.md) - if your SPARQL endpoint is not CORS-enabled, or uses http while your query page uses https
- [Integration with GraphDB Lucene Connector](Integration-with-GraphDB-Lucene-Connector.md) - Special configuration to interact with a GraphDB Lucene index 
- [Querying date ranges](Querying-date-ranges.md) - How to generate SPARQL queries that can match on resources with a begin date and a end date 
- [Federated query support](Federated-querying.md) - How to enable federated querying using SERVICE keyword in your configuration

## 4. Integrating Sparnatural in HTML / React

- [Javascript integration](Javascript-integration.md) - Reference page for Javascript integration and parameters
- [React integration](react-integration.md) - Initialization of Sparnatural as a custom component within react
- [YasGUI specific plugins](YasGUI-plugins.md) - Read if you are using YasGUI in combination with Sparnatural
- [Customize colors](Customize-colors.md) - How to customize colors of Sparnatural

**Advanced integration**

- [Query JSON format](Query-JSON-format.md) - Documentation on the JSON structure used by Sparnatural to output and reload queries
- [Querying a password protected SPARQL endpoint](Querying-a-password-protected-SPARQL-endpoint.md)
- [Javascript integration v7 (old)](Javascript-integration-v7.md) - Reference page for Javascript integration and parameters for the old version 7



## 5. Extending Sparnatural

- [How to create your own widget](diy-widget.md)

## 6. FAQ

- [FAQ](FAQ.md) - Frequently Asked Questions

## 7. Other resources

- Check out [the bibliography section of the website](https://sparnatural.eu#bibliography) where you can find presentation material on Sparnatural
- Check out [the YouTube channel](https://www.youtube.com/playlist?list=PL3kB_eBB1Pc3FBOtevNtRkSw4YmWar4q5) for videos of Sparnatural
- Don't hesitate to [ask questions on the Github issue tracker](https://github.com/sparna-git/Sparnatural/issues)
- [Sparna](http://sparna.fr) can provide some support on setting up Sparnatural, so get in touch at thomas /dot/ francart /at/ sparna /dot/ fr 
