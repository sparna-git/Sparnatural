
# Sparnatural documentation

[![French](https://github.com/madebybowtie/FlagKit/raw/master/Assets/PNG/FR.png) Documentation en français](/fr)

_For examples of how Sparnatural works and can be configured, have a look at the [**demos folder**](https://github.com/sparna-git/sparnatural.eu/tree/main/demos) of [sparnatural.eu](http://sparnatural.eu) website._

## Configure Sparnatural
1. Create a config file
The config file is a JSON-LD can be created via 3 different means:
- Via [Protege](OWL-based-configuration)
- Via [raw JSON-LD](JSON-based-configuration)

2. Configure the datasources for the widgets (Protege and raw JSON-LD)
- [guide on datasources](OWL-based-configuration-datasources)

3. Integrate Sparnatural
- [Javascript integration v8](Javascript-integration) - Reference page for Javascript integration and parameters for version 8
- [React integration v8](react-integration) - Initialization of Sparnatural as a custom component within react
- [Javascript integration v7](Javascript-integration-v7) - Reference page for Javascript integration and parameters for version 7

## Other configuration related topics
- [Customize colors](Customize-colors) - How to customize colors of Sparnatural
- [Query JSON format](Query-JSON-format) - Documentation on the JSON structure used by Sparnatural to output and reload queries
- [Querying a password protected SPARQL endpoint](Querying-a-password-protected-SPARQL-endpoint)
- [Integration with GraphDB Lucene Connector](Integration-with-GraphDB-Lucene-Connector) - Special configuration to interact with a GraphDB Lucene index 
- [Querying date ranges](Querying-date-ranges) - How to generate SPARQL queries that can match on resources with a begin date and a end date 
- [FAQ](FAQ) - Frequently Asked Questions, mostly about configuration 
