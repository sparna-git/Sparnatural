_[Accueil](index.html) > Plugins personnalisés YASGUI_

_Pour savoir comment intégrer Sparnatural avec YasQE et YasR, veuillez consulter la documentation sur l'[intégration JavaScript](Javascript-integration.md)._

# Plugins personnalisés YASGUI

Strictement parlant, la portée de Sparnatural se limite à la sortie de la requête SPARQL générée par le composant. C'est tout. Il n'est pas responsable d'afficher la requête sur la page, de l'envoyer/l'exécuter, ou d'afficher les résultats de la requête. Ces 3 étapes relèvent généralement de la portée de [YasGUI](https://triply.cc/docs/yasgui/), et c'est pourquoi Sparnatural est souvent utilisé en combinaison avec cet outil.

C'est pourquoi certains plugins spécifiques de YasGUI sont fournis pour être utilisés en conjonction avec Sparnatural.

## Plugin "TableX" : masquer l'URI derrière les libellés

### Ce qu'il fait

Il y a une fonctionnalité spécifique de Sparnatural qui nécessite une intégration dédiée avec YasGUI : l'annotation `core:defaultLabelProperty` de la configuration OWL (voir la [référence de configuration OWL](OWL-based-configuration.md)), ou l'annotation équivalente `dash:propertyRole` avec la valeur `dash:LabelRole` de la configuration SHACL (voir la [référence de configuration SHACL](SHACL-based-configuration.md)). Ces annotations entraîneront l'insertion d'une nouvelle colonne dans le jeu de résultats, avec un nom de colonne défini sur `xxx_label`, où `xxx` est le nom de la colonne d'origine ayant une propriété de libellé par défaut (par exemple `?Person_1` et `?Person_1_label`).

Il s'agit d'un schéma utile à détecter dans le jeu de résultats car **cela permet de masquer l'URI derrière le libellé correspondant, générant ainsi des liens cliquables pour l'utilisateur**.

Au lieu de ceci :

![YasR sans plugin](/assets/images/yasr-without-plugin.png)

Vous obtiendriez ceci :

![YasR avec plugin](/assets/images/yasr-with-plugin.png)


### Comment l'utiliser

Ce plugin est déjà utilisé dans la page du tutoriel "Hello Sparnatural" (voir le [guide de démarrage](hello-sparnatural/Hello-Sparnatural.md)), vous pouvez donc voir comment il est intégré.

Pour le déployer :

1. Téléchargez le javascript des plugins depuis la [section de publication du projet Github sparnatural-yasgui-plugins](https://github.com/sparna-git/Sparnatural-yasgui-plugins/releases)
2. Chargez-le dans votre page web avec la balise `<script>`
3. Initialisez YasR avec ce plugin pour qu'il remplace le plugin Table par défaut de YasR :

```javascript
Yasr.registerPlugin("TableX",SparnaturalYasguiPlugins.TableX);
delete Yasr.plugins['table'];

// see below
// Yasr.plugins.LabelledUriTable.defaults.uriHrefAdapter = function(uri) { }
// Yasr.plugins.LabelledUriTable.defaults.bindingSetAdapter = function(bindingSet) { }

const yasr = new Yasr(document.getElementById("yasr"), {
	pluginOrder: ["TableX", "response"],
	defaultPlugin: "TableX"
});
```

### Adaptation de l'URL du lien

Parfois, l'URI des entités n'est pas directement déréférençable et cliquer dessus conduirait à une erreur 404. Pour cette raison, le plugin TableX peut être personnalisé avec des fonctions qui peuvent prétraiter le résultat avant qu'il ne soit imprimé. Les 2 fonctions sont `uriHrefAdapter` et `bindingSetAdapter`.

La fonction `uriHrefAdapter` vous permet de changer une URI d'entrée en une autre URL de sortie. Elle est configurée comme suit :

```javascript
Yasr.plugins.LabelledUriTable.defaults.uriHrefAdapter = function(uri) {
	console.log("adapter called on uri "+uri);
	// return anything you like that will used instead of the input uri
	return uri;
};
```

Elle est appelée pour chaque URI dans l'ensemble de résultats, dans chaque colonne. Par exemple, elle peut être utilisée pour modifier l'URI DBPedia d'entrée vers l'article Wikipedia correspondant :

```javascript
Yasr.plugins.LabelledUriTable.defaults.uriHrefAdapter = function(uri) {
	if(uri.startsWith("http://fr.dbpedia.org/resource/")) {
	  return "http://fr.wikipedia.org/wiki/" + uri.substring("http://fr.dbpedia.org/resource/".length);
	} else {
	  return uri;
	}
};
```

La fonction `bindingSetAdapter` vous permet de traiter un ensemble de liaisons entier, c'est-à-dire une ligne entière dans le tableau de résultats, y compris les valeurs littérales. Elle est configurée comme suit :

```javascript
Yasr.plugins.LabelledUriTable.defaults.bindingSetAdapter = function(bindingSet) {
	console.log("binding set adapter called on "+bindingSet);
	return bindingSet;
};
```

Par exemple, elle peut être utilisée pour générer un lien cliquable à partir d'une valeur littérale dans l'ensemble de liaisons :

```javascript
Yasr.plugins.LabelledUriTable.defaults.bindingSetAdapter = function(bindingSet) {
	var newBindingSet = {};
	for (var key in bindingSet) {
		// if we are on a column starting with "code"...
	    if(key.startsWith("code")) {
	    	// then insert a new value that is a URI based on the code literal value    
	        newBindingSet[key] = {
	            type: "uri",
	            value: "http://fake.uri/"+bindingSet[key].value
	        };
	        // and set the code as the "xxx_label" column so that it is picked up
	        // as a label to display
	        newBindingSet[key+"_label"] = bindingSet[key];
	    } else {
	        // default, don't change anything
	        newBindingSet[key] = bindingSet[key];
	    }
	}
	return newBindingSet;
};
```
