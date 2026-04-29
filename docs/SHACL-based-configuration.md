_[Home](index.html) > SHACL-based configuration_

# SHACL-based configuration

Sparnatural can be configured using a SHACL specification of the entities and properties to be displayed in the UI.

## Sparnatural SHACL configuration profile

The formal specification of the subset of SHACL to use, in combination with a few properties from other ontologies, is defined in the **Sparnatural SHACL configuration profile**, available as an [HTML documentation](https://shacl-play.sparna.fr/play/doc?url=https%3A%2F%2Fxls2rdf.sparna.fr%2Frest%2Fconvert%3FnoPostProcessings%3Dtrue%26url%3Dhttps%253A%252F%252Fdocs.google.com%252Fspreadsheets%252Fd%252F195NKb43Ck1yPGrIK4H8_HYGw9GTPnbtY%252Fexport%253Fformat%253Dxlsx&includeDiagram=true), an [online spreadsheet](https://docs.google.com/spreadsheets/d/195NKb43Ck1yPGrIK4H8_HYGw9GTPnbtY), or a [technical SHACL file](https://xls2rdf.sparna.fr/rest/convert?noPostProcessings=true&url=https%3A%2F%2Fdocs.google.com%2Fspreadsheets%2Fd%2F195NKb43Ck1yPGrIK4H8_HYGw9GTPnbtY%2Fexport%3Fformat%3Dxlsx), or the [source spreadsheet](https://docs.google.com/spreadsheets/d/195NKb43Ck1yPGrIK4H8_HYGw9GTPnbtY).

## Reference of the Sparnatural SHACL configuration profile

### Namespaces

| Prefix | Namespaces |
| ------ | ---------- |
| config-core   | http://data.sparna.fr/ontologies/sparnatural-config-core# |
| dash   | http://datashapes.org/dash# |
| ds     | http://data.sparna.fr/ontologies/sparnatural-config-datasources# |
| sh     | http://www.w3.org/ns/shacl# |
| volipi | http://data.sparna.fr/ontologies/volipi# |

### NodeShapes configuration reference


<table class="sp_table_propertyshapes table-striped table-responsive">
                     <thead>
                        <tr>
                           <th>Property name</th>
                           <th>URI</th>
                           <th>Expected value</th>
                           <th>Card.</th>
                           <th class="sp_description_column">Description</th>
                        </tr>
                     </thead>
                     <tbody>
                        <tr>
                           <td>type</td>
                           <td><code><a href="http://www.w3.org/1999/02/22-rdf-syntax-ns#type">rdf:type</a></code></td>
                           <td><code>sh:NodeShape</code><br></td>
                           <td>
                              <div style="width:30px">1..*</div>
                           </td>
                           <td class="sp_table_propertyshapes_col_description">Class. Value must always be sh:NodeShape.</td>
                        </tr>
                        <tr>
                           <td>label</td>
                           <td><code><a href="http://www.w3.org/2000/01/rdf-schema#label">rdfs:label</a></code></td>
                           <td><code>rdf:langString</code><code> or </code><code>xsd:string</code><br></td>
                           <td>
                              <div style="width:30px">0..*</div>
                           </td>
                           <td class="sp_table_propertyshapes_col_description">The label of the entity to be displayed in Sparnatural. 
                              Labels are multilingual, and can provide multiple labels in different languages. Lhe
                              label in the current user language is displayed;
                              If no label is given, the local part of the URI is used.</td>
                        </tr>
                        <tr>
                           <td>order</td>
                           <td><code><a href="http://www.w3.org/ns/shacl#order">sh:order</a></code></td>
                           <td><code>xsd:decimal</code><br></td>
                           <td>
                              <div style="width:30px">0..*</div>
                           </td>
                           <td class="sp_table_propertyshapes_col_description">The order of this entity in the entity selection dropdown.</td>
                        </tr>
                        <tr>
                           <td>tooltip 1</td>
                           <td><code><a href="http://data.sparna.fr/ontologies/volipi#message">volipi:message</a></code></td>
                           <td><code>rdf:langString</code><code> or </code><code>xsd:string</code><br></td>
                           <td>
                              <div style="width:30px">0..*</div>
                           </td>
                           <td class="sp_table_propertyshapes_col_description">The preferred tooltip that will be displayed when this entity is hovered. This can
                              contain HTML markup.
                              Tooltips are also multilingual, you can provide one tooltip per language, and the
                              tooltip in the current user language is used.</td>
                        </tr>
                        <tr>
                           <td>tooltip 2</td>
                           <td><code><a href="http://www.w3.org/ns/shacl#description">sh:description</a></code></td>
                           <td><code>rdf:langString</code><code> or </code><code>xsd:string</code><br></td>
                           <td>
                              <div style="width:30px">0..*</div>
                           </td>
                           <td class="sp_table_propertyshapes_col_description">A tooltip that will be displayed when this entity is hovered, if no preferred tooltip
                              is provided. This can contain HTML markup.</td>
                        </tr>
                        <tr>
                           <td>fontawesome icon code</td>
                           <td><code><a href="http://data.sparna.fr/ontologies/volipi#iconName">volipi:iconName</a></code></td>
                           <td><code>xsd:string</code><br></td>
                           <td>
                              <div style="width:30px">0..1</div>
                           </td>
                           <td class="sp_table_propertyshapes_col_description">The fontawesome icon code that will be displayed by Sparnatural, e.g. "fa-solid fa-user"</td>
                        </tr>
                        <tr>
                           <td>icon url</td>
                           <td><code><a href="http://data.sparna.fr/ontologies/volipi#icon">volipi:icon</a></code></td>
                           <td><code>IRI</code><br></td>
                           <td>
                              <div style="width:30px">0..1</div>
                           </td>
                           <td class="sp_table_propertyshapes_col_description">A reference to an icon URL that will be displayed on Sparnatural. Use of this is discouraged,
                              prefer volipi:iconName</td>
                        </tr>
                        <tr>
                           <td>target class</td>
                           <td><code><a href="http://www.w3.org/ns/shacl#targetClass">sh:targetClass</a></code></td>
                           <td><code><a href="#scs:TargetClass">Target class</a></code><br></td>
                           <td>
                              <div style="width:30px">0..*</div>
                           </td>
                           <td class="sp_table_propertyshapes_col_description">The actual URI of the class that this shape corresponds to, that will be inserted
                              in the SPARQL queries. NodeShapes can either have sh:targetClass or they can be rdf:type
                              rdfs:Class, in which case the URI of the NodeShape is assumed to be the URI of the
                              class itself.</td>
                        </tr>
                        <tr>
                           <td>node kind</td>
                           <td><code><a href="http://www.w3.org/ns/shacl#nodeKind">sh:nodeKind</a></code></td>
                           <td><code>IRI</code><br></td>
                           <td>
                              <div style="width:30px">0..1</div>
                           </td>
                           <td class="sp_table_propertyshapes_col_description">If used on a NodeShape with value sh:Literal, then Sparnatural will treat this shape
                              as a Literal and will not generate an rdf:type triple in the SPARQL query.</td>
                        </tr>
                        <tr>
                           <td>datatype</td>
                           <td><code><a href="http://www.w3.org/ns/shacl#datatype">sh:datatype</a></code></td>
                           <td><code>IRI</code><br></td>
                           <td>
                              <div style="width:30px">0..1</div>
                           </td>
                           <td class="sp_table_propertyshapes_col_description">If used on a NodeShape, then Sparnatural will treat this shape as a Literal and will
                              not generate an rdf:type triple in the SPARQL query.</td>
                        </tr>
                        <tr>
                           <td>language in</td>
                           <td><code><a href="http://www.w3.org/ns/shacl#languageIn">sh:languageIn</a></code></td>
                           <td><code>BlankNode</code><br></td>
                           <td>
                              <div style="width:30px">0..1</div>
                           </td>
                           <td class="sp_table_propertyshapes_col_description">If used on a NodeShape, then Sparnatural will treat this shape as a Literal and will
                              not generate an rdf:type triple in the SPARQL query.</td>
                        </tr>
                        <tr>
                           <td>unique lang</td>
                           <td><code><a href="http://www.w3.org/ns/shacl#uniqueLang">sh:uniqueLang</a></code></td>
                           <td><code>xsd:boolean</code><br></td>
                           <td>
                              <div style="width:30px">0..1</div>
                           </td>
                           <td class="sp_table_propertyshapes_col_description">If used on a NodeShape, then Sparnatural will treat this shape as a Literal and will
                              not generate an rdf:type triple in the SPARQL query.</td>
                        </tr>
                        <tr>
                           <td>deactivated</td>
                           <td><code><a href="http://www.w3.org/ns/shacl#deactivated">sh:deactivated</a></code></td>
                           <td><code>xsd:boolean</code><br></td>
                           <td>
                              <div style="width:30px">0..1</div>
                           </td>
                           <td class="sp_table_propertyshapes_col_description">If marked with sh:deactivated, a shape will be filtered out from the initial list
                              of classes</td>
                        </tr>
                        <tr>
                           <td>or</td>
                           <td><code><a href="http://www.w3.org/ns/shacl#or">sh:or</a></code></td>
                           <td><code>BlankNode</code><br></td>
                           <td>
                              <div style="width:30px">0..*</div>
                           </td>
                           <td class="sp_table_propertyshapes_col_description"></td>
                        </tr>
                        <tr>
                           <td>subclass of</td>
                           <td><code><a href="http://www.w3.org/2000/01/rdf-schema#subClassOf">rdfs:subClassOf</a></code></td>
                           <td><code><a href="#scs:TargetClass">Target class</a></code><br></td>
                           <td>
                              <div style="width:30px">0..*</div>
                           </td>
                           <td class="sp_table_propertyshapes_col_description">If the NodeShape is also a Class, it can have a subClassOf reference to the class(es)
                              from which it will inherit the properties</td>
                        </tr>
                     </tbody>
                  </table>

### PropertyShapes configuration reference

<table class="sp_table_propertyshapes table-striped table-responsive">
                     <thead>
                        <tr>
                           <th>Property name</th>
                           <th>URI</th>
                           <th>Expected value</th>
                           <th>Card.</th>
                           <th class="sp_description_column">Description</th>
                           <th>Example</th>
                        </tr>
                     </thead>
                     <tbody>
                        <tr style="">
                           <td>max card., subClassOf</td>
                           <td id="scs:Property_sh:maxCount"><code><a href="http://www.w3.org/ns/shacl#maxCount">sh:maxCount</a></code></td>
                           <td><code><a href="#scs:TargetClass">Target class</a></code><br><small></small></td>
                           <td>
                              <div style="width:30px">0..1</div>
                           </td>
                           <td class="sp_table_propertyshapes_col_description">Indicates the superclass or superclasses of this class, from which this node shape
                              inherits. When a class is selected in Sparnatural, the properties of its superclasses
                              will be proposed., If different from 1, then if the property is fetched automatically
                              with KeyInfoRole, a GROUP_CONCAT aggregation will be used</td>
                           <td>1</td>
                        </tr>
                        <tr style="">
                           <td>entity / shape</td>
                           <td id="scs:Property_^sh:property"><code>^sh:property</code></td>
                           <td><code><a href="#scs:Entity">Sparnatural entity</a></code><br><small></small></td>
                           <td>
                              <div style="width:30px">1..*</div>
                           </td>
                           <td class="sp_table_propertyshapes_col_description">The entity from the configuration to which the property is attached. Note that this
                              is expressed as an inverse property on the PropertyShapes, for ease of use when defining
                              SHACL configurations in Excel tables.</td>
                           <td></td>
                        </tr>
                        <tr style="">
                           <td>property</td>
                           <td id="scs:Property_sh:path"><code><a href="http://www.w3.org/ns/shacl#path">sh:path</a></code></td>
                           <td><code>BlankNodeOrIRI</code><br><small></small></td>
                           <td>
                              <div style="width:30px">1..1</div>
                           </td>
                           <td class="sp_table_propertyshapes_col_description">The property IRI, or the SHACL property path that this property shape is constraining.</td>
                           <td></td>
                        </tr>
                        <tr style="">
                           <td>order</td>
                           <td id="scs:Property_sh:order"><code><a href="http://www.w3.org/ns/shacl#order">sh:order</a></code></td>
                           <td><code>xsd:decimal</code><br><small></small></td>
                           <td>
                              <div style="width:30px">0..1</div>
                           </td>
                           <td class="sp_table_propertyshapes_col_description">The order of this property in the property selection drpdown.</td>
                           <td></td>
                        </tr>
                        <tr style="">
                           <td>name</td>
                           <td id="scs:Property_sh:name"><code><a href="http://www.w3.org/ns/shacl#name">sh:name</a></code></td>
                           <td><code><a href="">rdf:langString</a></code><code> or </code><code><a href="">xsd:string</a></code><br><small></small></td>
                           <td>
                              <div style="width:30px">0..*</div>
                           </td>
                           <td class="sp_table_propertyshapes_col_description">The name of the property to be displayed.
                              Labels are multilingual, and can provide multiple labels in different languages. Lhe
                              label in the current user language is displayed;
                              If no label is given, the local part of the URI is used.</td>
                           <td></td>
                        </tr>
                        <tr style="">
                           <td>tooltip 1</td>
                           <td id="scs:Property_volipi:message"><code><a href="http://data.sparna.fr/ontologies/volipi#message">volipi:message</a></code></td>
                           <td><code><a href="">rdf:langString</a></code><code> or </code><code><a href="">xsd:string</a></code><br><small></small></td>
                           <td>
                              <div style="width:30px">0..*</div>
                           </td>
                           <td class="sp_table_propertyshapes_col_description">The preferred tooltip that will be displayed when this entity is hovered. This can
                              contain HTML markup.
                              Tooltips are also multilingual, you can provide one tooltip per language, and the
                              tooltip in the current user language is used.</td>
                           <td></td>
                        </tr>
                        <tr style="">
                           <td>tooltip 2</td>
                           <td id="scs:Property_sh:description"><code><a href="http://www.w3.org/ns/shacl#description">sh:description</a></code></td>
                           <td><code><a href="">rdf:langString</a></code><code> or </code><code><a href="">xsd:string</a></code><br><small></small></td>
                           <td>
                              <div style="width:30px">0..*</div>
                           </td>
                           <td class="sp_table_propertyshapes_col_description">A tooltip that will be displayed when this entity is hovered, if no preferred tooltip
                              is provided. This can contain HTML markup.</td>
                           <td></td>
                        </tr>
                        <tr style="">
                           <td>tooltip 3</td>
                           <td id="scs:Property_sh:path/skos:definition"><code>sh:path/skos:definition</code></td>
                           <td><code><a href="">rdf:langString</a></code><code> or </code><code><a href="">xsd:string</a></code><br><small></small></td>
                           <td>
                              <div style="width:30px">0..*</div>
                           </td>
                           <td class="sp_table_propertyshapes_col_description">The definition of the property, that can be used as tooltip, if no tooltips are provided
                              on the shape</td>
                           <td></td>
                        </tr>
                        <tr style="">
                           <td>tooltip 4</td>
                           <td id="scs:Property_sh:path/rdfs:comment"><code>sh:path/rdfs:comment</code></td>
                           <td><code><a href="">rdf:langString</a></code><code> or </code><code><a href="">xsd:string</a></code><br><small></small></td>
                           <td>
                              <div style="width:30px">0..*</div>
                           </td>
                           <td class="sp_table_propertyshapes_col_description">A comment on the property, that can be used as tooltip, if no tooltips are provided
                              on the shape, and there is no definition on the property</td>
                           <td></td>
                        </tr>
                        <tr style="">
                           <td>search widget</td>
                           <td id="scs:Property_dash:searchWidget"><code><a href="http://datashapes.org/dash#searchWidget">dash:searchWidget</a></code></td>
                           <td><code>IRI</code><br><p><small><a href="http://data.sparna.fr/ontologies/sparnatural-config-coreSearchProperty">config-core:SearchProperty</a>, <a href="http://data.sparna.fr/ontologies/sparnatural-config-coreListProperty">config-core:ListProperty</a>, <a href="http://data.sparna.fr/ontologies/sparnatural-config-coreAutocompleteProperty">config-core:AutocompleteProperty</a>, <a href="http://data.sparna.fr/ontologies/sparnatural-config-coreBooleanProperty">config-core:BooleanProperty</a>, <a href="http://data.sparna.fr/ontologies/sparnatural-config-coreMapProperty">config-core:MapProperty</a>, <a href="http://data.sparna.fr/ontologies/sparnatural-config-coreStringEqualsProperty">config-core:StringEqualsProperty</a>, <a href="http://data.sparna.fr/ontologies/sparnatural-config-coreTimeProperty-Date">config-core:TimeProperty-Date</a>, <a href="http://data.sparna.fr/ontologies/sparnatural-config-coreTimeProperty-Year">config-core:TimeProperty-Year</a>, <a href="http://data.sparna.fr/ontologies/sparnatural-config-coreTimeProperty-Period">config-core:TimeProperty-Period</a>, <a href="http://data.sparna.fr/ontologies/sparnatural-config-coreTreeProperty">config-core:TreeProperty</a>, <a href="http://data.sparna.fr/ontologies/sparnatural-config-coreNumberProperty">config-core:NumberProperty</a></small></p><small></small></td>
                           <td>
                              <div style="width:30px">0..1</div>
                           </td>
                           <td class="sp_table_propertyshapes_col_description">An explicit search widget to use for this property. If no explicit search widget is
                              specified, a default one is determined based on the sh:datatype and other characteristics
                              of the property shape.</td>
                           <td></td>
                        </tr>
                        <tr style="">
                           <td>role of the property (default label property or key info property)</td>
                           <td id="scs:Property_dash:propertyRole"><code><a href="http://datashapes.org/dash#propertyRole">dash:propertyRole</a></code></td>
                           <td><code>IRI</code><br><p><small><a href="http://datashapes.org/dash#LabelRole">dash:LabelRole</a>, <a href="http://datashapes.org/dash#KeyInfoRole">dash:KeyInfoRole</a></small></p><small></small></td>
                           <td>
                              <div style="width:30px">0..1</div>
                           </td>
                           <td class="sp_table_propertyshapes_col_description">If used with the value dash:LabelRole, indicate that this property shape describes
                              the main label of the entities to which it is attached. This is used to fetch this
                              property automatically in generated SPARQL queries, and to populate automatically
                              dropdowns and autocomplete search with this property. If used with the value dash:KeyInfoRole,
                              indicate that this property shape should be retrieved with the user clicks on the
                              "+ info" button in the arrow. Note that the proeprty cardinalities are used to determine
                              if the variable should be fetched using an OPTIONAL (if sh:minCount not 1), or should
                              be aggregated (if sh:maxCount not 1)</td>
                           <td></td>
                        </tr>
                        <tr style="">
                           <td>class (of the property value)</td>
                           <td id="scs:Property_sh:class"><code><a href="http://www.w3.org/ns/shacl#class">sh:class</a></code></td>
                           <td><code>IRI</code><br><small></small></td>
                           <td>
                              <div style="width:30px">0..1</div>
                           </td>
                           <td class="sp_table_propertyshapes_col_description">Defines the entity in the configuration that is the value of this property. References
                              the URI of a class that is itself referred to by an sh:targetClass from a NodeShape.</td>
                           <td></td>
                        </tr>
                        <tr style="">
                           <td>node shape (of the property value)</td>
                           <td id="scs:Property_sh:node"><code><a href="http://www.w3.org/ns/shacl#node">sh:node</a></code></td>
                           <td><code>IRI</code><br><small></small></td>
                           <td>
                              <div style="width:30px">0..1</div>
                           </td>
                           <td class="sp_table_propertyshapes_col_description">Defines the entity in the configuration that is the value of this property. References
                              a NodeShape that describes the target entity of the property.
                              If no sh:class or sh:node is found, then a default behavior is proposed</td>
                           <td></td>
                        </tr>
                        <tr style="">
                           <td>deactivated</td>
                           <td id="scs:Property_sh:deactivated"><code><a href="http://www.w3.org/ns/shacl#deactivated">sh:deactivated</a></code></td>
                           <td><code>xsd:boolean</code><br><small></small></td>
                           <td>
                              <div style="width:30px">0..1</div>
                           </td>
                           <td class="sp_table_propertyshapes_col_description">In case a property shape is marked as deactivated, it will not be shown in the interface</td>
                           <td></td>
                        </tr>
                        <tr style="">
                           <td>datasource (for lists and autocomplete)</td>
                           <td id="scs:Property_config-datasources:datasource"><code><a href="http://data.sparna.fr/ontologies/sparnatural-config-datasourcesdatasource">config-datasources:datasource</a></code></td>
                           <td><code>BlankNodeOrIRI</code><br><small></small></td>
                           <td>
                              <div style="width:30px">0..1</div>
                           </td>
                           <td class="sp_table_propertyshapes_col_description">The datasource to populate the widget of the property. If not provided, a default
                              datasource is used.</td>
                           <td></td>
                        </tr>
                        <tr style="">
                           <td>sh:in</td>
                           <td id="scs:Property_sh:in"><code><a href="http://www.w3.org/ns/shacl#in">sh:in</a></code></td>
                           <td><code>BlankNode</code><br><small></small></td>
                           <td>
                              <div style="width:30px">0..1</div>
                           </td>
                           <td class="sp_table_propertyshapes_col_description">If sh:in is used on the property shape, its default widget will be a dropdown and
                              the list content will be read from the configuration instead of being read from a
                              SPARQL query</td>
                           <td></td>
                        </tr>
                        <tr style="">
                           <td>datasource (for tree childrens)</td>
                           <td id="scs:Property_config-datasources:treeChildrenDatasource"><code><a href="http://data.sparna.fr/ontologies/sparnatural-config-datasourcestreeChildrenDatasource">config-datasources:treeChildrenDatasource</a></code></td>
                           <td><code>BlankNodeOrIRI</code><br><small></small></td>
                           <td>
                              <div style="width:30px">0..1</div>
                           </td>
                           <td class="sp_table_propertyshapes_col_description">The datasource to populate the children node of a node in a tree widget</td>
                           <td></td>
                        </tr>
                        <tr style="">
                           <td>datasource (for tree roots)</td>
                           <td id="scs:Property_config-datasources:treeRootsDatasource"><code><a href="http://data.sparna.fr/ontologies/sparnatural-config-datasourcestreeRootsDatasource">config-datasources:treeRootsDatasource</a></code></td>
                           <td><code>BlankNodeOrIRI</code><br><small></small></td>
                           <td>
                              <div style="width:30px">0..1</div>
                           </td>
                           <td class="sp_table_propertyshapes_col_description">The datasource to populate the root nodes of a tree widget</td>
                           <td></td>
                        </tr>
                        <tr style="">
                           <td>or</td>
                           <td id="scs:Property_sh:or"><code><a href="http://www.w3.org/ns/shacl#or">sh:or</a></code></td>
                           <td><code>BlankNodeOrIRI</code><br><small></small></td>
                           <td>
                              <div style="width:30px">0..1</div>
                           </td>
                           <td class="sp_table_propertyshapes_col_description">Indicates alternatives for either multiple datatypes (e.g. xsd:string or xsd:dateTime),
                              or multiple sh:class/sh:node, or different node kinds (e.g. IRI or Literal). The expected
                              values are nodes with either an sh:datatype or an sh:class or an sh:node or an sh:nodeKind.
                              2 levels of sh:or are supported to deal with properties that can be either IRI or
                              literals, and then indicate the sh:class(es) of the IRI shape, and the sh:datatype(s)
                              of the literal shape.
                              The actual list value of sh:or can be either a blank node or an IRI.
                              
                              Example : property with 2 datatypes : ([sh:datatype xsd:string][sh:datatype xsd:dateTime]),
                              Example : property either IRI or literal ([sh:nodeKind sh:IRI; sh:class ex:class1][sh:nodeKind
                              sh:Literal sh:or([sh:datatype xsd:string][sh:datatype xsd:date])])</td>
                           <td>Property with 2 datatypes : ([sh:datatype xsd:string][sh:datatype xsd:dateTime]),
                              Property either IRI or literal ([sh:nodeKind sh:IRI; sh:class ex:class1][sh:nodeKind
                              sh:Literal sh:or([sh:datatype xsd:string][sh:datatype xsd:date])])</td>
                        </tr>
                        <tr style="">
                           <td>min card.</td>
                           <td id="scs:Property_sh:minCount"><code><a href="http://www.w3.org/ns/shacl#minCount">sh:minCount</a></code></td>
                           <td><code>xsd:integer</code><br><small></small></td>
                           <td>
                              <div style="width:30px">0..1</div>
                           </td>
                           <td class="sp_table_propertyshapes_col_description">If different from 1, then if the property is fetched automatically with KeyInfoRole,
                              an OPTIONAL will be inserted.</td>
                           <td>1</td>
                        </tr>
                     </tbody>
                  </table>
### Classes configuration reference

`rdfs:subClassOf` is read on classes to inherit properties of superclasses, as well as labels and definitions for UI display.

<table class="sp_table_propertyshapes table-striped table-responsive">
                     <thead>
                        <tr>
                           <th>Property name</th>
                           <th>URI</th>
                           <th>Expected value</th>
                           <th>Card.</th>
                           <th class="sp_description_column">Description</th>
                        </tr>
                     </thead>
                     <tbody>
                        <tr>
                           <td>subClassOf</td>
                           <td><code><a href="http://www.w3.org/2000/01/rdf-schema#subClassOf">rdfs:subClassOf</a></code></td>
                           <td><code><a href="#scs:TargetClass">Target class</a></code><br></td>
                           <td>
                              <div style="width:30px">0..*</div>
                           </td>
                           <td class="sp_table_propertyshapes_col_description">Indicates the superclass or superclasses of this class, from which this node shape
                              inherits. When a class is selected in Sparnatural, the properties of its superclasses
                              will be proposed.</td>
                        </tr>
                        <tr>
                           <td>is target of</td>
                           <td><code>^sh:targetClass</code></td>
                           <td><code><a href="#scs:Entity">Sparnatural entity</a></code><br></td>
                           <td>
                              <div style="width:30px">0..*</div>
                           </td>
                           <td class="sp_table_propertyshapes_col_description">A target class may be referenced by a NodeShape through sh:targetClass, or it can
                              be itself a sh:NodeShape. The properties of the NodeShape are inherited by the subclasses.</td>
                        </tr>
                        <tr>
                           <td>definition</td>
                           <td><code><a href="http://www.w3.org/2004/02/skos/core#definition">skos:definition</a></code></td>
                           <td><code>rdf:langString</code><code> or </code><code>xsd:string</code><br></td>
                           <td>
                              <div style="width:30px">0..*</div>
                           </td>
                           <td class="sp_table_propertyshapes_col_description">The definition of the class, that can be used as a tooltip</td>
                        </tr>
                        <tr>
                           <td>comment</td>
                           <td><code><a href="http://www.w3.org/2000/01/rdf-schema#comment">rdfs:comment</a></code></td>
                           <td><code>rdf:langString</code><code> or </code><code>xsd:string</code><br></td>
                           <td>
                              <div style="width:30px">0..*</div>
                           </td>
                           <td class="sp_table_propertyshapes_col_description">A comment on the class, that can be used as a tolltip</td>
                        </tr>
                        <tr>
                           <td>label</td>
                           <td><code><a href="http://www.w3.org/2000/01/rdf-schema#label">rdfs:label</a></code></td>
                           <td><code>rdf:langString</code><code> or </code><code>xsd:string</code><br></td>
                           <td>
                              <div style="width:30px">0..*</div>
                           </td>
                           <td class="sp_table_propertyshapes_col_description">The label of the class, to be used if no rdfs:label is found on the node shape</td>
                        </tr>
                     </tbody>
                  </table>



