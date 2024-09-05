_/!\ Cette page a été traduite automatiquement depuis la version anglaise_

# Comment personnaliser les couleurs de Sparnatural ?

_/!\ Cette fonctionnalité est disponible depuis la version 8.1 de Sparnatural._

## Inclure un thème CSS

Pour personnaliser les couleurs de Sparnatural, vous devez inclure un CSS supplémentaire "sparnatural-theme" dans votre page web et écraser la déclaration des variables de couleur à l'intérieur. Cette référence doit être placée _après_ la référence au CSS principal de Sparnatural

```html
	<!-- Sparnatural Main CSS -->
  <link href="sparnatural.css" rel="stylesheet" />
  <!-- Sparnatural Theme CSS, place after Sparnatual main one to override the variables declaration -->
  <link href="themes/sparnatural-theme-sea.css" rel="stylesheet" />
```

Certains thèmes par défaut sont fournis dans le sous-dossier "themes" de la distribution.

Pour commencer, copiez l'un des thèmes CSS qui se trouvent dans le sous-dossier "themes" et ajustez les valeurs à l'intérieur.
