_[Accueil](../index.html) > Sparnatural form > configuration du formulaire_

Cette page a été traduite automatiquement à partir de la [page d'origine en anglais](../../sparnatural-form/form-configuration.md) - le 19/11/2026


# Structure de configuration du formulaire Sparnatural

Cette page documente la structure de données JSON pour la configuration du composant `sparnatural-form`.


## Exemple de spécification de formulaire

Le formulaire suivant :

![Exemple de formulaire Sparnatural](/assets/images/sparnatural-form/form-example.png)

Est modélisé par la structure JSON suivante :

```json
{
  "bindings": [
    {
      "variable": "Fonds",
      "node": {
        "type": "UserPrompt",
        "name": {
          "en": "Fonds",
          "fr": "Fonds"
        }
      }
    },
    {
      "variable": "OriginalName",
      "node": {
        "type": "UserPrompt",
        "name": {
          "en": "File name quick access",
          "fr": "Accès rapide par nom"
        }
      }
    },
    {
      "variable": "OriginalNameSearch",
      "node": {
        "type": "UserPrompt",
        "name": {
          "en": "File name - regex",
          "fr": "Nom de fichier - regex"
        }
      }
    },
    {
      "variable": "ContainerFormat",
      "node": {
        "type": "UserPrompt",
        "name": {
          "en": "Container format",
          "fr": "Format container"
        }
      }
    },
    {
      "variable": "VideoFormat",
      "node": {
        "type": "UserPrompt",
        "name": {
          "en": "Video format",
          "fr": "Format vidéo"
        }
      }
    },
    {
      "variable": "AudioFormat",
      "node": {
        "type": "UserPrompt",
        "name": {
          "en": "Audio format",
          "fr": "Format audio"
        }
      }
    },
    {
      "variable": "Standard",
      "node": {
        "type": "UserPrompt",
        "name": {
          "en": "Standard",
          "fr": "Standard"
        }
      }
    }
  ],
  "variables": {
    "onscreen": [
      "Fonds",
      "OriginalName",
      "ContainerFormat"
    ]
  }
}

```

## Référence de la structure de données JSON

La structure de données JSON encode la liste des champs du formulaire, et pour chaque champ, fournit :
  - ses libellés d'affichage
  - la variable à laquelle le champ est associé dans la requête Sparnatural sous-jacente passée dans l'attribut `query` du formulaire
  - éventuellement, des infobulles pour l'utilisateur

La structure de données peut également lister optionnellement les variables de la requête originale qui doivent être conservées lors de l'affichage des résultats de la requête à l'écran (par opposition à une exportation complète).

### Structure de la spécification du formulaire

```json
{
  "bindings": [
  	{
  		...
  	},
  	{
  		...
  	}
  ],
  "variables": {
  	...
  }
}
```

- `bindings` : un tableau contenant la liste des liaisons avec la requête Sparnatural sous-jacente
- `variables` : un objet contenant les spécifications des variables à conserver pour chaque type de requête possible dans le formulaire

### Structure de liaison avec invite utilisateur

Dans `bindings`, une seule liaison est une association entre une variable sous-jacente dans la requête Sparnatural, et comment cette requête est remplie avec une valeur. Actuellement, la seule façon de remplir une variable est via un champ de saisie utilisateur, mais d'autres façons de lier une requête avec une valeur pourraient être imaginées à l'avenir.

```json
{
  "variable": "...",
  "node": {
    "type": "UserPrompt",
    "name": {
      "en": "...",
      "fr": "..."
    },
    "help": {
      "en": "...",
      "fr": "..."
    }
  }
}
```

- `variable` : le nom de la variable dans la requête Sparnatural sous-jacente dans laquelle la valeur sélectionnée sera injectée. Il s'agit typiquement du nom d'une variable dans la position `o` de la requête, à n'importe quel niveau de la structure de la requête. Voir le [format de requête Sparnatural v12](../fr/archives/Query-JSON-format-v12.md), qui est le format du fichier passé dans l'attribut `query` du formulaire.
- `name` : une carte de codes de langue vers des libellés. Il s'agit du titre qui sera utilisé pour ce champ
- `help` (optionnel) : une carte de codes de langue vers des infobulles. Si fourni, une icône "i" sera affichée avec cette infobulle, à côté du titre du champ.

Par exemple, si votre requête contient ceci, avec la variable `ContainerFormat` en position `o` :

```json
{
  "line": {
    "s": "File",
    "p": "http://shapes.performing-arts.ch/instantiations/File_hasFormat",
    "o": "ContainerFormat",
    "sType": "http://shapes.performing-arts.ch/instantiations/File",
    "oType": "http://shapes.performing-arts.ch/instantiations/ContainerFormat",
    "values": []
  },
  "children": [],
  "optional": true
},
```

Alors vous pouvez configurer un champ de formulaire de cette manière :

```json
{
  "variable": "ContainerFormat",
  "node": {
    "type": "UserPrompt",
    "name": {
      "en": "Container format",
      "fr": "Format de container"
    }
  }
}
``` 

### Structure des variables

Cette partie est optionnelle.

```json
"variables": {
  	"onscreen" : [
  		"...",
  		"...",
  		"..."
  	]
}
```

- `variables` : la section `variables` de la spécification du formulaire ne peut contenir que la clé unique `onscreen`.
- `onscreen` : la clé `onscreen` est un tableau qui contient une liste de valeurs de chaîne correspondant aux variables qui doivent être conservées lors de l'affichage des résultats de la requête à l'écran, par opposition à la réalisation d'une exportation des résultats de la requête. Toute variable dans la clause SELECT de la requête qui n'est pas dans cette liste sera filtrée, ainsi que les critères de recherche correspondants dans la clause WHERE, si ce critère n'a pas été rempli par l'utilisateur.

Si non spécifiée, toutes les variables sélectionnées dans la requête seront retournées normalement, et l'option "export" ne sera pas disponible.
