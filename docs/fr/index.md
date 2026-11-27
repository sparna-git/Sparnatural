Voir aussi la [référence en anglais](../index.md). Les exemples LDForge sont maintenus avec cette version.

# Portail de documentation de Sparnatural

_Cette page de documentation fournit un point d'entrée unique pour la documentation de Sparnatural ainsi que tous les composants associés, tels que les plugins d'affichage des résultats de requête, le composant d'historique des requêtes, et sparnatural-form._

## Table des matières

- [Sparnatural](#sparnatural)
- [Plugins d'affichage des résultats Sparnatural](#plugins-daffichage-des-résultats-sparnatural)
- [Historique Sparnatural](#historique-sparnatural)
- [Formulaire Sparnatural](#formulaire-sparnatural)

## Sparnatural

_Pour des exemples de fonctionnement de Sparnatural et de sa configuration, consultez le [**dossier de démonstrations**](https://github.com/sparna-git/sparnatural.eu/tree/main/demos) du site [sparnatural.eu](http://sparnatural.eu)._

### 1. Fonctionnalités

- [Documentation de référence des widgets Sparnatural](widgets.md) : toutes les façons possibles de sélectionner une valeur de critère dans Sparnatural. Lisez ceci pour apprendre certaines des fonctionnalités de Sparnatural.
- [Fonctionnalités d'accessibilité](Accessibility.md) : zoom, lecteurs d'écran et navigation au clavier.

### 2. Pour commencer

- **[Bonjour Sparnatural](hello-sparnatural/Hello-Sparnatural.md)** : commencez ici pour intégrer Sparnatural dans votre propre site web, à partir de la page de tutoriel.

### 3. Configurer Sparnatural

#### 3.1 Configuration SHACL

Sparnatural est configuré par un fichier de configuration exprimé en SHACL. Le fichier de configuration peut être édité dans une feuille de calcul Excel.

- **[Comment configurer en SHACL](../how-to-configure-shacl/How-to-configure-Sparnatural-shacl.html)** : une documentation détaillée pour configurer Sparnatural dans un tableur. Commencez ici pour apprendre les différentes options de configuration de Sparnatural.
- [Page de référence de la configuration SHACL](SHACL-based-configuration.md) : la liste de toutes les constructions SHACL que Sparnatural comprend
- [Configuration des sources de données](datasources-configuration.md) : une page de référence de toutes les sources de données incluses et comment écrire votre propre source de données
- [Configuration des modèles](templates-configuration.md) : comment fournir des modèles personnalisés pour les listes, l'autocomplétion et les arbres, afin d'afficher par exemple des définitions supplémentaires associées aux valeurs, ou tout autre type d'informations supplémentaires du graphe de connaissances
- [Support de la navigation par facettes](Faceted-browsing.md) : Comment activer la navigation par facettes dans Sparnatural pour prévenir les critères de requête qui ne retourneraient aucun résultat

#### 3.2 Configuration avancée

- [Interroger des plages de dates](Querying-date-ranges.md) - Comment générer des requêtes SPARQL qui peuvent correspondre à des ressources avec une date de début et une date de fin
- [Support des requêtes fédérées](Federated-querying.md) - Comment activer les requêtes fédérées en utilisant le mot-clé SERVICE dans votre configuration
- [Interroger des graphes nommés spécifiques](Querying-named-graphs.md) - Comment construire une URL de point d'accès pour être restreint à un ou plusieurs graphes nommés
- [Interroger plusieurs points d'accès](Querying-multiple-endpoints.md) - Comment configurer Sparnatural pour qu'il puisse interroger plusieurs points d'accès en même temps de manière transparente
- [Intégration avec GraphDB Lucene Connector](Integration-with-GraphDB-Lucene-Connector.md) - Configuration spéciale pour interagir avec un index Lucene de GraphDB

### 4. Intégration de Sparnatural en HTML / React

- [Tutoriel Hello Sparnatural](../hello-sparnatural/Hello-Sparnatural.md) - Configuration du constructeur et de LDForge (anglais).

- [**Page HTML et intégration Javascript**](Javascript-integration.md) - La page de référence pour comprendre comment le composant web `<spar-natural` peut être intégré dans votre page web
- [Personnaliser les couleurs](Customize-colors.md) - Comment personnaliser les couleurs de Sparnatural

**Intégration avancée**

- [Intégration React](react-integration.md) - Initialisation de Sparnatural en tant que composant personnalisé dans React
- [Format de requête JSON](Query-JSON-format.md) - Documentation sur la structure JSON utilisée par Sparnatural pour afficher et recharger les requêtes
- [Utilisation d'un proxy SPARQL](SPARQL-proxy.md) - si votre point d'accès SPARQL n'est pas activé pour CORS, ou utilise http alors que votre page de requête utilise https
- [Interroger un point d'accès SPARQL protégé par mot de passe](Querying-a-password-protected-SPARQL-endpoint.md)

### 5. Étendre Sparnatural

- [Comment créer votre propre widget](diy-widget.md)

### 6. FAQ

- [FAQ](FAQ.md) - Questions fréquemment posées

### 7. Autres ressources

- Consultez [la section bibliographie du site Web](https://sparnatural.eu#bibliography) où vous pouvez trouver du matériel de présentation sur Sparnatural
- Consultez [la chaîne YouTube](https://www.youtube.com/playlist?list=PL3kB_eBB1Pc3FBOtevNtRkSw4YmWar4q5) pour des vidéos sur Sparnatural
- N'hésitez pas à [poser des questions sur le suivi des problèmes Github](https://github.com/sparna-git/Sparnatural/issues)
- [Sparna](http://sparna.fr) peut fournir un support pour la configuration de Sparnatural, alors contactez thomas /dot/ francart /at/ sparna /dot/ fr

### 8. Archives

**Configuration JSON obsolète**

- [Configurer en JSON(-LD)](../archives/JSON-based-configuration.md)
- [Configurer les sources de données en JSON](../archives/JSON-based-configuration-datasources.md)

**Configuration OWL obsolète**

Historiquement, Sparnatural prenait également en charge une configuration spécifiée en OWL :

- [Comment configurer en OWL](../how-to-configure-owl/How-to-configure-Sparnatural.md) : une documentation détaillée pour configurer Sparnatural dans un tableur OWL (qui est converti en un fichier de configuration OWL). Ceci est obsolète et est maintenant remplacé par le guide de configuration SHACL.
- [Configurer en OWL en utilisant Protégé](OWL-based-configuration.md) : une page de référence de tous les axiomes et annotations OWL utiles pour configurer Sparnatural avec OWL
- [Configurer des sources de données en OWL](OWL-based-configuration-datasources.md) : une page de référence de toutes les sources de données incluses et comment écrire votre propre source de données

**Format de requête JSON jusqu'à la v12**

- [Format de requête JSON v12](../archives/Query-JSON-format-v12.md)

**Page d'intégration Javascript v7 obsolète**

- [Intégration Javascript v7 (ancienne)](../archives/Javascript-integration-v7.md) - Page de référence pour l'intégration Javascript et les paramètres de l'ancienne version 7

## Plugins d'affichage des résultats Sparnatural

- [Documentation de référence des plugins d'affichage des résultats](result-display.md) : les différentes façons d'afficher les résultats de recherche après qu'une requête a été écrite, au-delà de l'affichage tabulaire classique.
- [LDForge : éditeur, résultats et migration](LDForge-integration.md) - Intégration actuelle, disposition séparée et options.
- [Anciens plugins Yasgui](YasGUI-plugins-integration.md) - Référence conservée pour les applications existantes.

## Historique Sparnatural

- [Intégration de l'historique Sparnatural](sparnatural-history.md) - comment intégrer le composant d'historique Sparnatural dans votre code HTML/javascript

## Formulaire Sparnatural

- [Page HTML et intégration Javascript](sparnatural-form/form-integration.md) - La page de référence pour comprendre comment le composant web `<sparnatural-form` peut être intégré dans votre page web
- [Page de référence JSON de configuration de formulaire](sparnatural-form/form-configuration.md) - La documentation de la structure de données JSON de configuration du formulaire
- [Page de référence de requête JSON Sparnatural-form](sparnatural-form/form-query.md) - La petite structure JSON utilisée pour pré-remplir les champs du formulaire, partagée par le fichier des requêtes prédéfinies, le paramètre d'URL `query` et `loadQuery()`
- [Liste déroulante de requêtes prédéfinies](sparnatural-form/form-predefined-queries.md) - Le composant web `<sparnatural-form-queries>` et ses paramètres, pour offrir à l'utilisateur une liste déroulante de requêtes exemples prêtes à l'emploi
- [Pré-remplissage avec des paramètres d'URL ou une requête JSON](sparnatural-form/form-prefill.md) - Comment pré-remplir le formulaire à partir de l'URL de la page, avec la syntaxe de chaque paramètre, et comment soumettre automatiquement la recherche
