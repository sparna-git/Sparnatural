_/!\ Cette page a été traduite automatiquement depuis la version anglaise_

# Documentation de Sparnatural

_Pour des exemples de fonctionnement de Sparnatural et de sa configuration, consultez le [**dossier de démonstrations**](https://github.com/sparna-git/sparnatural.eu/tree/main/demos) du site [sparnatural.eu](http://sparnatural.eu)._


## 1. Fonctionnalités

- [Documentation de référence des widgets Sparnatural](widgets.md) : toutes les façons possibles de sélectionner une valeur de critère dans Sparnatural. Lisez ceci pour découvrir certaines des fonctionnalités de Sparnatural.


## 2. Pour commencer

- **[Bonjour Sparnatural](hello-sparnatural/Hello-Sparnatural.md)** : commencez ici pour intégrer Sparnatural dans votre propre site web, à partir de la page de tutoriel.


## 3. Configuration de Sparnatural

### 3.1 Configuration SHACL

Sparnatural est configuré par un fichier de configuration exprimé en SHACL. Le fichier de configuration peut être modifié dans une feuille de calcul Excel.

- **[Comment configurer en SHACL](how-to-configure-shacl/How-to-configure-Sparnatural-shacl.html)** : une documentation détaillée pour configurer Sparnatural dans une feuille de calcul. Commencez ici pour apprendre les différentes options de configuration de Sparnatural.
- [Page de référence de la configuration SHACL](SHACL-based-configuration.md) : la liste de toutes les constructions SHACL que Sparnatural comprend

### 3.2 Configuration OWL obsolète

Historiquement, Sparnatural prenait également en charge une configuration spécifiée en OWL :

- [Comment configurer en OWL](how-to-configure-owl/How-to-configure-Sparnatural.md) : une documentation détaillée pour configurer Sparnatural dans une feuille de calcul OWL (qui est convertie en un fichier de configuration OWL). Ceci est obsolète et remplacé par le guide de configuration SHACL.
- [Configurer en OWL en utilisant Protégé](OWL-based-configuration.md) : une page de référence de tous les axiomes OWL utiles et annotations pour configurer Sparnatural avec OWL
- [Configurer des sources de données en OWL](OWL-based-configuration-datasources.md) : une page de référence de toutes les sources de données incluses et comment écrire votre propre source de données

### 3.3 Configuration avancée

- [Interrogation des plages de dates](Querying-date-ranges.md) - Comment générer des requêtes SPARQL qui peuvent correspondre à des ressources avec une date de début et une date de fin
- [Prise en charge des requêtes fédérées](Federated-querying.md) - Comment activer les requêtes fédérées en utilisant le mot-clé SERVICE dans votre configuration
- [Interrogation de graphes nommés spécifiques](Querying-named-graphs.md) - Comment construire une URL de point de terminaison pour être restreint à un ou plusieurs graphes nommés
- [Interrogation de plusieurs points de terminaison](Querying-multiple-endpoints.md) - Comment configurer Sparnatural pour qu'il puisse interroger plusieurs points de terminaison en même temps de manière transparente
- [Intégration avec le connecteur GraphDB Lucene](Integration-with-GraphDB-Lucene-Connector.md) - Configuration spéciale pour interagir avec un index Lucene de GraphDB

_/!\ Cette page a été traduite automatiquement depuis la version anglaise_

## 4. Intégration de Sparnatural dans HTML / React

- [**Page HTML et intégration Javascript**](Javascript-integration.md) - La page de référence pour comprendre comment le composant web `<spar-natural` peut être intégré dans votre page web
- [Plugins spécifiques à YasGUI](YasGUI-plugins.md) - À lire si vous utilisez YasGUI en combinaison avec Sparnatural, pour comprendre les plugins spécifiques à Sparnatural
- [Personnaliser les couleurs](Customize-colors.md) - Comment personnaliser les couleurs de Sparnatural

**Intégration avancée**

- [Intégration React](react-integration.md) - Initialisation de Sparnatural en tant que composant personnalisé dans React
- [Format de requête JSON](Query-JSON-format.md) - Documentation sur la structure JSON utilisée par Sparnatural pour afficher et recharger les requêtes
- [Utilisation d'un proxy SPARQL](SPARQL-proxy.md) - si votre point d'accès SPARQL n'est pas activé pour CORS, ou utilise http alors que votre page de requête utilise https
- [Interrogation d'un point d'accès SPARQL protégé par mot de passe](Querying-a-password-protected-SPARQL-endpoint.md)

## 5. Extension de Sparnatural

- [Comment créer votre propre widget](diy-widget.md)

## 6. FAQ

- [FAQ](FAQ.md) - Questions fréquemment posées

## 7. Autres ressources

- Consultez [la section bibliographie du site Web](https://sparnatural.eu#bibliography) où vous pouvez trouver du matériel de présentation sur Sparnatural
- Consultez [la chaîne YouTube](https://www.youtube.com/playlist?list=PL3kB_eBB1Pc3FBOtevNtRkSw4YmWar4q5) pour des vidéos sur Sparnatural
- N'hésitez pas à [poser des questions sur le suivi des problèmes Github](https://github.com/sparna-git/Sparnatural/issues)
- [Sparna](http://sparna.fr) peut fournir un support pour la configuration de Sparnatural, alors contactez thomas /point/ francart /chez/ sparna /point/ fr

## 8. Archives

**Configuration JSON obsolète**

- [Configurer en JSON(-LD)](archives/JSON-based-configuration.md)
- [Configurer les sources de données en JSON](archives/JSON-based-configuration-datasources.md)

**Page d'intégration Javascript v7 obsolète**

- [Intégration Javascript v7 (ancienne)](Javascript-integration-v7.md) - Page de référence pour l'intégration Javascript et les paramètres de l'ancienne version 7

_/!\ Cette page a été traduite automatiquement depuis la version anglaise_

# Sparnatural Documentation

## Introduction

Sparnatural is a powerful tool for managing your natural products inventory. With Sparnatural, you can easily track your stock, receive notifications for low inventory, and generate reports to analyze your sales data.

## Getting Started

To start using Sparnatural, follow these simple steps:

1. **Sign Up**: Create an account on Sparnatural's website.
2. **Add Products**: Start by adding your natural products to the inventory.
3. **Track Inventory**: Monitor your stock levels and receive alerts for low inventory.
4. **Generate Reports**: Analyze your sales data and make informed decisions for your business.

## Features

### Inventory Management

- Add new products to your inventory
- Track stock levels and receive notifications for low inventory
- Update product information easily

### Reporting

- Generate reports to analyze sales data
- View trends and make data-driven decisions
- Export reports for further analysis

## Support

If you encounter any issues or have questions about Sparnatural, please contact our support team at [support@sparnatural.com](mailto:support@sparnatural.com). We are here to help you make the most of Sparnatural.

---

<Notes>
This document is for informational purposes only and does not constitute any legal advice.
