_/!\ Cette page a été traduite automatiquement depuis la version anglaise_

# Interroger des graphes nommés spécifiques

## Cas d'utilisation

Parfois, vous devez restreindre votre requête à un ou plusieurs graphes nommés spécifiques dans votre triplestore.

## Fonctionnement

Cela est pris en charge par le protocole SPARQL lui-même, à l'intérieur de l'URL du point de terminaison SPARQL, en ajoutant un ou plusieurs paramètres `?default-graph-uri=...` à l'URL du point de terminaison que vous fournissez à Sparnatural. (voir la [section de requête du protocole SPARQL](https://www.w3.org/TR/2013/REC-sparql11-protocol-20130321/#query-operation)). L'URI du ou des graphes nommés doit être encodé en URL.

Si vous avez besoin de basculer ou de sélectionner différents graphes nommés, il incombe à la page appelante dans laquelle Sparnatural est intégré de fournir ce sélecteur et de mettre à jour l'attribut `endpoint` en conséquence.

## Configuration de Sparnatural

Pour configurer Sparnatural pour interroger uniquement des graphes nommés spécifiques

1. Construisez l'URL du point de terminaison SPARQL en lui ajoutant un ou plusieurs paramètres `?default-graph-uri=...`
2. Fournissez cette URL à l'attribut `endpoint` du composant `<spar-natural`

Voici un exemple interrogeant `https://data.myDomain.com/graph/1` et `https://data.myDomain.com/graph/2`

```html
<spar-natural 
            src="..."
            endpoint="https://localhost:7200/repositories/myRepo?default-graph-uri=https%3A%2F%2Fdata.myDomain.com%2Fgraph%2F1&default-graph-uri=https%3A%2F%2Fdata.myDomain.com%2Fgraph%2F2"
            ... other attributes ...
></spar-natural>
```
