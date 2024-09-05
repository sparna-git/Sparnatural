_/!\ Cette page a été traduite automatiquement depuis la version anglaise_

# Proxy de point de terminaison SPARQL

## 2 problèmes : https:// et CORS

Sparnatural est une bibliothèque purement côté client, et les requêtes SPARQL créées avec elle sont envoyées directement *depuis votre navigateur* vers le point de terminaison cible. Cela signifie qu'une page de démonstration contenant le composant Sparnatural chargé depuis le serveur A peut interroger un point de terminaison SPARQL déployé sur le serveur B. Pour des raisons de sécurité, cela n'est pas possible par défaut, à moins que le serveur B (le point de terminaison SPARQL) n'ait explicitement autorisé les *"origines (domaine, schéma ou port) autres que les siennes à partir desquelles un navigateur devrait autoriser le chargement de ressources."* Cela s'appelle le partage des ressources entre origines, ou CORS, et est mieux expliqué en détail sur https://developer.mozilla.org/fr/docs/Web/HTTP/CORS. CORS fonctionne en définissant des en-têtes HTTP spécifiques sur le serveur B (le point de terminaison SPARQL), généralement `Access-Control-Allow-Origin: *` pour autoriser le CORS à partir de toute autre origine. Le problème est que le point de terminaison SPARQL que vous souhaitez interroger peut ne pas avoir défini de tels en-têtes, auquel cas vous êtes bloqué.

Sparnatural dispose d'un site web et de pages de démonstration sur [https://sparnatural.eu](https://sparnatural.eu) - veuillez noter le *s* dans `https`. Mais certains des points de terminaison SPARQL publiés sur le web ne sont pas accessibles en https. Pour des raisons de sécurité, un navigateur refusera d'envoyer une requête à un serveur non-https à partir d'une page servie par le protocole https.

## La solution de contournement (temporaire) : un proxy SPARQL

Pour contourner ces 2 limitations, Sparnatural propose un proxy SPARQL, déployé sur un serveur https, et permettant les requêtes CORS. Ce proxy transmet simplement les requêtes qu'il reçoit au point de terminaison SPARQL cible. Une requête de serveur à serveur n'est pas soumise à la limitation CORS.

Le proxy est disponible en ligne sur [https://proxy.sparnatural.eu/sparql-proxy](https://proxy.sparnatural.eu/sparql-proxy/).

Essentiellement, vous devez fournir une URL comme **`https://proxy.sparnatural.eu/sparql-proxy/sparql?endpoint={votre-url-de-point-de-terminaison-sparql-encodée}`**, par exemple `https://proxy.sparnatural.eu/sparql-proxy/sparql?endpoint=http%3A%2F%2Ffr.dbpedia.org%2Fsparql`. Cette URL complète est un point de terminaison compatible avec SPARQL et est conforme au protocole SPARQL (en particulier, elle attend un paramètre `query` contenant la requête SPARQL). C'est l'URL que vous pouvez transmettre en tant que paramètre au composant sparnatural.

_/!\ Cette page a été traduite automatiquement depuis la version anglaise_

Le code du proxy SPARQL est open source et disponible sur [https://github.com/sparna-git/sparql-proxy](https://github.com/sparna-git/sparql-proxy)

## Ne pas utiliser en production !

Il s'agit d'une solution temporaire, vous ne devriez pas compter sur le proxy en ligne pour des services de production. Dans un scénario de production, vous devriez soit :
1. Déployer la page Sparnatural sur le même serveur que le point de terminaison SPARQL (si c'est votre point de terminaison SPARQL)
2. ou : activer CORS sur votre point de terminaison SPARQL (si c'est votre point de terminaison SPARQL) (par exemple pour GraphDB, consultez [la documentation](https://graphdb.ontotext.com/documentation/10.2/directories-and-config-properties.html?highlight=cors#workbench-properties), pour Virtuoso, consultez [cette page](https://vos.openlinksw.com/owiki/wiki/VOS/VirtTipsAndTricksCORsEnableSPARQLURLs))
4. ou : déployer et maintenir votre propre service proxy (éventuellement en déployant l'application sparql-proxy).
