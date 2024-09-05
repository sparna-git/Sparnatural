_[Accueil](index.html) > Configuration basée sur SHACL_

# Configuration basée sur SHACL

Sparnatural peut être configuré en utilisant une spécification SHACL des entités et propriétés à afficher dans l'interface utilisateur.

## Profil de configuration SHACL de Sparnatural

La spécification formelle du sous-ensemble de SHACL à utiliser, en combinaison avec quelques propriétés d'autres ontologies, est définie dans le **Profil de configuration SHACL de Sparnatural**, disponible en tant que [documentation HTML](https://shacl-play.sparna.fr/play/doc?url=https%3A%2F%2Fxls2rdf.sparna.fr%2Frest%2Fconvert%3FnoPostProcessings%3Dtrue%26url%3Dhttps%253A%252F%252Fdocs.google.com%252Fspreadsheets%252Fd%252F195NKb43Ck1yPGrIK4H8_HYGw9GTPnbtY%252Fexport%253Fformat%253Dxlsx&includeDiagram=true), un [tableur en ligne](https://docs.google.com/spreadsheets/d/195NKb43Ck1yPGrIK4H8_HYGw9GTPnbtY), ou un [fichier SHACL technique](https://xls2rdf.sparna.fr/rest/convert?noPostProcessings=true&url=https%3A%2F%2Fdocs.google.com%2Fspreadsheets%2Fd%2F195NKb43Ck1yPGrIK4H8_HYGw9GTPnbtY%2Fexport%3Fformat%3Dxlsx).

## Référence du profil de configuration SHACL de Sparnatural

### Espaces de noms

| Préfixe | Espaces de noms |
| ------ | ---------- |
| config-core   | http://data.sparna.fr/ontologies/sparnatural-config-core# |
| dash   | http://datashapes.org/dash# |
| ds     | http://data.sparna.fr/ontologies/sparnatural-config-datasources# |
| sh     | http://www.w3.org/ns/shacl# |
| volipi | http://data.sparna.fr/ontologies/volipi# |

### Référence de configuration des formes de nœud

<table class="sp_table_propertyshapes table-striped table-responsive">
                     <thead>
                        <tr>
                           <th>Nom de la propriété</th>
                           <th>URI</th>
                           <th>Valeur attendue</th>
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
                           <td class="sp_table_propertyshapes_col_description">Classe. La valeur doit toujours être sh:NodeShape.</td>
                        </tr>
                        <tr>
                           <td>label</td>
                           <td><code><a href="http://www.w3.org/2000/01/rdf-schema#label">rdfs:label</a></code></td>
                           <td><code>rdf:langString</code><code> ou </code><code>xsd:string</code><br></td>
                           <td>
                              <div style="width:30px">0..*</div>
                           </td>
                           <td class="sp_table_propertyshapes_col_description">Le libellé de l'entité à afficher dans Sparnatural. 
                              Les libellés sont multilingues et peuvent fournir plusieurs libellés dans différentes langues. Le
                              libellé dans la langue de l'utilisateur actuel est affiché;
                              Si aucun libellé n'est donné, la partie locale de l'URI est utilisée.</td>
                        </tr>
                        <tr>
                           <td>order</td>
                           <td><code><a href="http://www.w3.org/ns/shacl#order">sh:order</a></code></td>
                           <td><code>xsd:decimal</code><br></td>
                           <td>
                              <div style="width:30px">0..*</div>
                           </td>
                           <td class="sp_table_propertyshapes_col_description">L'ordre de cette entité dans la liste déroulante de sélection des entités.</td>
                        </tr>
                        <tr>
                           <td>tooltip 1</td>
                           <td><code><a href="http://data.sparna.fr/ontologies/volipi#message">volipi:message</a></code></td>
                           <td><code>rdf:langString</code><code> ou </code><code>xsd:string</code><br></td>
                           <td>
                              <div style="width:30px">0..*</div>
                           </td>
                           <td class="sp_table_propertyshapes_col_description">Le tooltip préféré qui sera affiché lorsque cette entité est survolée. Cela peut
                              contenir du balisage HTML.
                              Les tooltips sont également multilingues, vous pouvez fournir un tooltip par langue, et le
                              tooltip dans la langue de l'utilisateur actuel est utilisé.</td>
                        </tr>
                        <tr>
                           <td>tooltip 2</td>
                           <td><code><a href="http://www.w3.org/ns/shacl#description">sh:description</a></code></td>
                           <td><code>rdf:langString</code><code> ou </code><code>xsd:string</code><br></td>
                           <td>
                              <div style="width:30px">0..*</div>
                           </td>
                           <td class="sp_table_propertyshapes_col_description">Un tooltip qui sera affiché lorsque cette entité est survolée, si aucun tooltip préféré
                              n'est fourni. Cela peut contenir du balisage HTML.</td>
                        </tr>
                        <tr>
                           <td>code icône fontawesome</td>
                           <td><code><a href="http://data.sparna.fr/ontologies/volipi#iconName">volipi:iconName</a></code></td>
                           <td><code>xsd:string</code><br></td>
                           <td>
                              <div style="width:30px">0..1</div>
                           </td>
                           <td class="sp_table_propertyshapes_col_description">Le code d'icône fontawesome qui sera affiché par Sparnatural, par exemple "fa-solid fa-user"</td>
                        </tr>
                        <tr>
                           <td>URL de l'icône</td>
                           <td><code><a href="http://data.sparna.fr/ontologies/volipi#icon">volipi:icon</a></code></td>
                           <td><code>IRI</code><br></td>
                           <td>
                              <div style="width:30px">0..1</div>
                           </td>
                           <td class="sp_table_propertyshapes_col_description">Une référence à une URL d'icône qui sera affichée sur Sparnatural. L'utilisation de ceci est déconseillée,
                              préférez volipi:iconName</td>
                        </tr>
                        <tr>
                           <td>classe cible</td>
                           <td><code><a href="http://www.w3.org/ns/shacl#targetClass">sh:targetClass</a></code></td>
                           <td><code><a href="#scs:TargetClass">Classe cible</a></code><br></td>
                           <td>
                              <div style="width:30px">0..*</div>
                           </td>
                           <td class="sp_table_propertyshapes_col_description">L'URI réelle de la classe à laquelle cette forme correspond, qui sera insérée
                              dans les requêtes SPARQL. Les NodeShapes peuvent avoir sh:targetClass ou être rdf:type
                              rdfs:Class, auquel cas l'URI du NodeShape est supposée être l'URI de la
                              classe elle-même.</td>
                        </tr>
                        <tr>
                           <td>type de nœud</td>
                           <td><code><a href="http://www.w3.org/ns/shacl#nodeKind">sh:nodeKind</a></code></td>
                           <td><code>IRI</code><br></td>
                           <td>
                              <div style="width:30px">0..1</div>
                           </td>
                           <td class="sp_table_propertyshapes_col_description">Si utilisé sur un NodeShape avec la valeur sh:Literal, alors Sparnatural traitera cette forme
                              comme un littéral et ne générera pas un triple rdf:type dans la requête SPARQL.</td>
                        </tr>
                        <tr>
                           <td>datatype</td>
                           <td><code><a href="http://www.w3.org/ns/shacl#datatype">sh:datatype</a></code></td>
                           <td><code>IRI</code><br></td>
                           <td>
                              <div style="width:30px">0..1</div>
                           </td>
                           <td class="sp_table_propertyshapes_col_description">Si utilisé sur un NodeShape, alors Sparnatural traitera cette forme comme un littéral et ne
                              générera pas un triple rdf:type dans la requête SPARQL.</td>
                        </tr>
                        <tr>
                           <td>langue dans</td>
                           <td><code><a href="http://www.w3.org/ns/shacl#languageIn">sh:languageIn</a></code></td>
                           <td><code>BlankNode</code><br></td>
                           <td>
                              <div style="width:30px">0..1</div>
                           </td>
                           <td class="sp_table_propertyshapes_col_description">Si utilisé sur un NodeShape, alors Sparnatural traitera cette forme comme un littéral et ne
                              générera pas un triple rdf:type dans la requête SPARQL.</td>
                        </tr>
                        <tr>
                           <td>langue unique</td>
                           <td><code><a href="http://www.w3.org/ns/shacl#uniqueLang">sh:uniqueLang</a></code></td>
                           <td><code>xsd:boolean</code><br></td>
                           <td>
                              <div style="width:30px">0..1</div>
                           </td>
                           <td class="sp_table_propertyshapes_col_description">Si utilisé sur un NodeShape, alors Sparnatural traitera cette forme comme un littéral et ne
                              générera pas un triple rdf:type dans la requête SPARQL.</td>
                        </tr>
                        <tr>
                           <td>désactivé</td>
                           <td><code><a href="http://www.w3.org/ns/shacl#deactivated">sh:deactivated</a></code></td>
                           <td><code>xsd:boolean</code><br></td>
                           <td>
                              <div style="width:30px">0..1</div>
                           </td>
                           <td class="sp_table_propertyshapes_col_description">Si marqué avec sh:deactivated, une forme sera filtrée de la liste initiale
                              des classes</td>
                        </tr>
                        <tr>
                           <td>ou</td>
                           <td><code><a href="http://www.w3.org/ns/shacl#or">sh:or</a></code></td>
                           <td><code>BlankNode</code><br></td>
                           <td>
                              <div style="width:30px">0..*</div>
                           </td>
                           <td class="sp_table_propertyshapes_col_description"></td>
                        </tr>
                        <tr>
                           <td>sous-classe de</td>
                           <td><code><a href="http://www.w3.org/2000/01/rdf-schema#subClassOf">rdfs:subClassOf</a></code></td>
                           <td><code><a href="#scs:TargetClass">Classe cible</a></code><br></td>
                           <td>
                              <div style="width:30px">0..*</div>
                           </td>
                           <td class="sp_table_propertyshapes_col_description">Si le NodeShape est également une classe, il peut avoir une référence subClassOf à la(les) classe(s)
                              à partir de laquelle il héritera des propriétés</td>
                        </tr>
                     </tbody>
                  </table>

### Référence de configuration des PropertyShapes

<table class="sp_table_propertyshapes table-striped table-responsive">
                     <thead>
                        <tr>
                           <th>Nom de la propriété</th>
                           <th>URI</th>
                           <th>Valeur attendue</th>
                           <th>Card.</th>
                           <th class="sp_description_column">Description</th>
                        </tr>
                     </thead>
                     <tbody>
                        <tr>
                           <td>entité / forme</td>
                           <td><code>^sh:property</code></td>
                           <td><code><a href="#scs:Entity">Entité Sparnatural</a></code><br></td>
                           <td>
                              <div style="width:30px">1..*</div>
                           </td>
                           <td class="sp_table_propertyshapes_col_description">L'entité de la configuration à laquelle la propriété est attachée. Notez que cela
                              est exprimé comme une propriété inverse sur les PropertyShapes, pour faciliter l'utilisation lors de la définition
                              des configurations SHACL dans les tableaux Excel.</td>
                        </tr>
                        <tr>
                           <td>propriété</td>
                           <td><code><a href="http://www.w3.org/ns/shacl#path">sh:path</a></code></td>
                           <td><code>BlankNodeOrIRI</code><br></td>
                           <td>
                              <div style="width:30px">1..1</div>
                           </td>
                           <td class="sp_table_propertyshapes_col_description">L'IRI de la propriété, ou le chemin de propriété SHACL que cette forme de propriété contraint.</td>
                        </tr>
                        <tr>
                           <td>ordre</td>
                           <td><code><a href="http://www.w3.org/ns/shacl#order">sh:order</a></code></td>
                           <td><code>xsd:decimal</code><br></td>
                           <td>
                              <div style="width:30px">0..1</div>
                           </td>
                           <td class="sp_table_propertyshapes_col_description">L'ordre de cette propriété dans la sélection de propriétés déroulante.</td>
                        </tr>
                        <tr>
                           <td>nom</td>
                           <td><code><a href="http://www.w3.org/ns/shacl#name">sh:name</a></code></td>
                           <td><code>rdf:langString</code><code> ou </code><code>xsd:string</code><br></td>
                           <td>
                              <div style="width:30px">0..*</div>
                           </td>
                           <td class="sp_table_propertyshapes_col_description">Le nom de la propriété à afficher.
                              Les libellés sont multilingues et peuvent fournir plusieurs libellés dans différentes langues. Le
                              libellé dans la langue de l'utilisateur actuel est affiché ;
                              Si aucun libellé n'est donné, la partie locale de l'URI est utilisée.</td>
                        </tr>
                        <tr>
                           <td>info-bulle 1</td>
                           <td><code><a href="http://data.sparna.fr/ontologies/volipi#message">volipi:message</a></code></td>
                           <td><code>rdf:langString</code><code> ou </code><code>xsd:string</code><br></td>
                           <td>
                              <div style="width:30px">0..*</div>
                           </td>
                           <td class="sp_table_propertyshapes_col_description">L'info-bulle préférée qui sera affichée lorsque cette entité est survolée. Cela peut
                              contenir du balisage HTML.
                              Les info-bulles sont également multilingues, vous pouvez fournir une info-bulle par langue, et l'
                              info-bulle dans la langue de l'utilisateur actuel est utilisée.</td>
                        </tr>
                        <tr>
                           <td>info-bulle 2</td>
                           <td><code><a href="http://www.w3.org/ns/shacl#description">sh:description</a></code></td>
                           <td><code>rdf:langString</code><code> ou </code><code>xsd:string</code><br></td>
                           <td>
                              <div style="width:30px">0..*</div>
                           </td>
                           <td class="sp_table_propertyshapes_col_description">Une info-bulle qui sera affichée lorsque cette entité est survolée, si aucune info-bulle préférée
                              n'est fournie. Cela peut contenir du balisage HTML.</td>
                        </tr>
                        <tr>
                           <td>info-bulle 3</td>
                           <td><code>sh:path/skos:definition</code></td>
                           <td><code>rdf:langString</code><code> ou </code><code>xsd:string</code><br></td>
                           <td>
                              <div style="width:30px">0..*</div>
                           </td>
                           <td class="sp_table_propertyshapes_col_description">La définition de la propriété, qui peut être utilisée comme info-bulle, si aucune info-bulle n'est fournie
                              sur la forme</td>
                        </tr>
                        <tr>
                           <td>info-bulle 4</td>
                           <td><code>sh:path/rdfs:comment</code></td>
                           <td><code>rdf:langString</code><code> ou </code><code>xsd:string</code><br></td>
                           <td>
                              <div style="width:30px">0..*</div>
                           </td>
                           <td class="sp_table_propertyshapes_col_description">Un commentaire sur la propriété, qui peut être utilisé comme info-bulle, si aucune info-bulle n'est fournie
                              sur la forme, et s'il n'y a pas de définition sur la propriété</td>
                        </tr>
                        <tr>
                           <td>widget de recherche</td>
                           <td><code><a href="http://datashapes.org/dash#searchWidget">dash:searchWidget</a></code></td>
                           <td><code>IRI</code><br><p><small>(config-core:SearchProperty, config-core:ListProperty, config-core:AutocompleteProperty, config-core:BooleanProperty, config-core:MapProperty, config-core:StringEqualsProperty, config-core:TimeProperty-Date, config-core:TimeProperty-Year, config-core:TimeProperty-Period, config-core:TreeProperty, config-core:NumberProperty)</small></p>
                           </td>
                           <td>
                              <div style="width:30px">0..1</div>
                           </td>
                           <td class="sp_table_propertyshapes_col_description">Un widget de recherche explicite à utiliser pour cette propriété. Si aucun widget de recherche explicite n'est
                              spécifié, un widget par défaut est déterminé en fonction du sh:datatype et d'autres caractéristiques
                              de la forme de propriété.</td>
                        </tr>
                        <tr>
                           <td>rôle de la propriété (propriété d'étiquette par défaut)</td>
                           <td><code><a href="http://datashapes.org/dash#propertyRole">dash:propertyRole</a></code></td>
                           <td><code>dash:LabelRole</code><br></td>
                           <td>
                              <div style="width:30px">0..1</div>
                           </td>
                           <td class="sp_table_propertyshapes_col_description">Si utilisé avec la valeur dash:LabelRole, indique que cette forme de propriété décrit
                              l'étiquette principale des entités auxquelles elle est attachée. Cela est utilisé pour récupérer automatiquement cette
                              propriété dans les requêtes SPARQL générées, et pour peupler automatiquement
                              les listes déroulantes et la recherche d'autocomplétion avec cette propriété.</td>
                        </tr>
                        <tr>
                           <td>classe (de la valeur de la propriété)</td>
                           <td><code><a href="http://www.w3.org/ns/shacl#class">sh:class</a></code></td>
                           <td><code>IRI</code><br></td>
                           <td>
                              <div style="width:30px">0..1</div>
                           </td>
                           <td class="sp_table_propertyshapes_col_description">Définit l'entité dans la configuration qui est la valeur de cette propriété. Référence
                              l'URI d'une classe qui est elle-même référencée par un sh:targetClass d'un NodeShape.</td>
                        </tr>
                        <tr>
                           <td>forme de nœud (de la valeur de la propriété)</td>
                           <td><code><a href="http://www.w3.org/ns/shacl#node">sh:node</a></code></td>
                           <td><code>IRI</code><br></td>
                           <td>
                              <div style="width:30px">0..1</div>
                           </td>
                           <td class="sp_table_propertyshapes_col_description">Définit l'entité dans la configuration qui est la valeur de cette propriété. Référence
                              une NodeShape qui décrit l'entité cible de la propriété.
                              Si aucun sh:class ou sh:node n'est trouvé, alors un comportement par défaut est proposé</td>
                        </tr>
                        <tr>
                           <td>désactivé</td>
                           <td><code><a href="http://www.w3.org/ns/shacl#deactivated">sh:deactivated</a></code></td>
                           <td><code>xsd:boolean</code><br></td>
                           <td>
                              <div style="width:30px">0..1</div>
                           </td>
                           <td class="sp_table_propertyshapes_col_description">Dans le cas où une forme de propriété est marquée comme désactivée, elle ne sera pas affichée dans l'interface</td>
                        </tr>
                        <tr>
                           <td>source de données (pour les listes et l'autocomplétion)</td>
                           <td><code><a href="http://data.sparna.fr/ontologies/sparnatural-config-datasourcesdatasource">config-datasources:datasource</a></code></td>
                           <td><code>BlankNodeOrIRI</code><br></td>
                           <td>
                              <div style="width:30px">0..1</div>
                           </td>
                           <td class="sp_table_propertyshapes_col_description">La source de données pour peupler le widget de la propriété. Si non fournie, une source de données par défaut
                              est utilisée.</td>
                        </tr>
                        <tr>
                           <td>sh:in</td>
                           <td><code><a href="http://www.w3.org/ns/shacl#in">sh:in</a></code></td>
                           <td><code>BlankNode</code><br></td>
                           <td>
                              <div style="width:30px">0..1</div>
                           </td>
                           <td class="sp_table_propertyshapes_col_description">Si sh:in est utilisé sur la forme de propriété, son widget par défaut sera une liste déroulante et
                              le contenu de la liste sera lu à partir de la configuration au lieu d'être lu à partir d'une
                              requête SPARQL</td>
                        </tr>
                        <tr>
                           <td>source de données (pour les enfants d'arbre)</td>
                           <td><code><a href="http://data.sparna.fr/ontologies/sparnatural-config-datasourcestreeChildrenDatasource">config-datasources:treeChildrenDatasource</a></code></td>
                           <td><code>BlankNodeOrIRI</code><br></td>
                           <td>
                              <div style="width:30px">0..1</div>
                           </td>
                           <td class="sp_table_propertyshapes_col_description">La source de données pour peupler les nœuds enfants d'un nœud dans un widget d'arbre</td>
                        </tr>
                        <tr>
                           <td>source de données (pour les racines d'arbre)</td>
                           <td><code><a href="http://data.sparna.fr/ontologies/sparnatural-config-datasourcestreeRootsDatasource">config-datasources:treeRootsDatasource</a></code></td>
                           <td><code>BlankNodeOrIRI</code><br></td>
                           <td>
                              <div style="width:30px">0..1</div>
                           </td>
                           <td class="sp_table_propertyshapes_col_description">La source de données pour peupler les nœuds racines d'un widget d'arbre</td>
                        </tr>
                        <tr>
                           <td>ou</td>
                           <td><code><a href="http://www.w3.org/ns/shacl#or">sh:or</a></code></td>
                           <td><code>BlankNodeOrIRI</code><br></td>
                           <td>
                              <div style="width:30px">0..1</div>
                           </td>
                           <td class="sp_table_propertyshapes_col_description">Indique des alternatives pour plusieurs types de données (par exemple xsd:string ou xsd:dateTime),
                              ou plusieurs sh:class/sh:node, ou différents types de nœuds (par exemple IRI ou Literal). Les valeurs attendues
                              sont des nœuds avec soit un sh:datatype, soit un sh:class, soit un sh:node, soit un sh:nodeKind.
                              2 niveaux de sh:or sont pris en charge pour traiter les propriétés qui peuvent être soit des IRI soit des
                              littéraux, et indiquer ensuite les sh:class(es) de la forme IRI, et les sh:datatype(s)
                              de la forme littérale.
                              La valeur de liste réelle de sh:or peut être soit un nœud vide soit un IRI.</td>

```html
                              Exemple : propriété avec 2 types de données : ([sh:datatype xsd:string][sh:datatype xsd:dateTime]),
                              Exemple : propriété soit IRI soit littéral ([sh:nodeKind sh:IRI; sh:class ex:class1][sh:nodeKind
                              sh:Literal sh:or([sh:datatype xsd:string][sh:datatype xsd:date])])</td>
                        </tr>
                     </tbody>
                  </table>

### Référence de configuration des classes

`rdfs:subClassOf` est lu sur les classes pour hériter des propriétés des superclasses, ainsi que des libellés et des définitions pour l'affichage UI.

<table class="sp_table_propertyshapes table-striped table-responsive">
                     <thead>
                        <tr>
                           <th>Nom de la propriété</th>
                           <th>URI</th>
                           <th>Valeur attendue</th>
                           <th>Card.</th>
                           <th class="sp_description_column">Description</th>
                        </tr>
                     </thead>
                     <tbody>
                        <tr>
                           <td>subClassOf</td>
                           <td><code><a href="http://www.w3.org/2000/01/rdf-schema#subClassOf">rdfs:subClassOf</a></code></td>
                           <td><code><a href="#scs:TargetClass">Classe cible</a></code><br></td>
                           <td>
                              <div style="width:30px">0..*</div>
                           </td>
                           <td class="sp_table_propertyshapes_col_description">Indique la superclasse ou les superclasses de cette classe, à partir desquelles cette forme de nœud
                              hérite. Lorsqu'une classe est sélectionnée dans Sparnatural, les propriétés de ses superclasses
                              seront proposées.</td>
                        </tr>
                        <tr>
                           <td>est la cible de</td>
                           <td><code>^sh:targetClass</code></td>
                           <td><code><a href="#scs:Entity">Entité Sparnatural</a></code><br></td>
                           <td>
                              <div style="width:30px">0..*</div>
                           </td>
                           <td class="sp_table_propertyshapes_col_description">Une classe cible peut être référencée par une NodeShape via sh:targetClass, ou elle peut
                              être elle-même une sh:NodeShape. Les propriétés de la NodeShape sont héritées par les sous-classes.</td>
                        </tr>
                        <tr>
                           <td>définition</td>
                           <td><code><a href="http://www.w3.org/2004/02/skos/core#definition">skos:definition</a></code></td>
                           <td><code>rdf:langString</code><code> ou </code><code>xsd:string</code><br></td>
                           <td>
                              <div style="width:30px">0..*</div>
                           </td>
                           <td class="sp_table_propertyshapes_col_description">La définition de la classe, qui peut être utilisée comme info-bulle</td>
                        </tr>
                        <tr>
                           <td>commentaire</td>
                           <td><code><a href="http://www.w3.org/2000/01/rdf-schema#comment">rdfs:comment</a></code></td>
                           <td><code>rdf:langString</code><code> ou </code><code>xsd:string</code><br></td>
                           <td>
                              <div style="width:30px">0..*</div>
                           </td>
                           <td class="sp_table_propertyshapes_col_description">Un commentaire sur la classe, qui peut être utilisé comme info-bulle</td>
                        </tr>
                        <tr>
                           <td>étiquette</td>
                           <td><code><a href="http://www.w3.org/2000/01/rdf-schema#label">rdfs:label</a></code></td>
                           <td><code>rdf:langString</code><code> ou </code><code>xsd:string</code><br></td>
                           <td>
                              <div style="width:30px">0..*</div>
                           </td>
                           <td class="sp_table_propertyshapes_col_description">L'étiquette de la classe, à utiliser si aucun rdfs:label n'est trouvé sur la forme de nœud</td>
                        </tr>
                     </tbody>
                  </table>
```

I'm ready to translate. Please provide the Markdown content for Sparnatural.
