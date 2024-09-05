_/!\ Cette page a été traduite automatiquement depuis la version anglaise_

**[Accueil](index.html) > Comment créer votre propre widget**

** /!\ Ceci est obsolète. **

# Comment créer votre propre widget

Sparnatural propose une gamme de widgets différents pour la sélection de valeurs sparql. D'autres widgets peuvent être ajoutés en implémentant l'extension de la classe `AbstractWidget`. Créons le BooleanWidget pour illustrer le processus d'implémentation :

## Créer une nouvelle classe de widget

Allez dans le dossier du widget `./src/sparnatural/components/widgets/`
Nous allons créer une nouvelle classe étendant Abstract Widget :

```typescript
import { Pattern } from "sparqljs";
import { AbstractWidget, WidgetValue } from "./AbstractWidget";
export class BooleanWidget extends AbstractWidget {
    getRdfJsPattern(): Pattern[] {
        throw new Error("Method not implemented.");
    }
    parseInput(value: { label: string; }): WidgetValue {
        throw new Error("Method not implemented.");
    }
}
```
Avec l'aide de l'intellisense, nous pouvons voir que les deux méthodes `getRdfJsPattern` et `parseInput` doivent être implémentées.

`getRdfJsPattern` : Retourne un tableau de type `Pattern[]`. Cela est basé sur le [modèle de données sparqljs](https://github.com/RubenVerborgh/SPARQL.js/). Ce `Pattern[]` sera converti en sparql.

`parseInput` : Retourne une WidgetValue et possède deux fonctions. Il est utilisé pour analyser l'entrée fournie par l'utilisateur et il analyse l'entrée de chaîne lorsqu'une requête est importée.

## Créer le rendu HTML du widget

Commençons par rendre le html du widget. L'`AbstractWidget` hérite lui-même de la classe HTMLComponent qui est la classe supérieure pour tous les composants Sparnatural. Chaque composant peut donc implémenter la méthode `render()` pour rendre du HTML.

```typescript
super.render();
    let trueSpan = $(
      `<span class="boolean-value">${getSettings().langSearch.true}</span>'`
    );
    let orSpan = $(`<span class="or">${getSettings().langSearch.Or}</span>`);
    let falseSpan = $(
      `<span class="boolean-value"">'${getSettings().langSearch.false}</span>`
    );
    this.html.append(trueSpan).append(orSpan).append(falseSpan);
    trueSpan[0].addEventListener("click", (e) => {
      let widgetValue: BooleanWidgetValue = new BooleanWidgetValue({
        label: getSettings().langSearch.true,
        boolean: true,
      });
      this.renderWidgetVal(widgetValue);
    });
    falseSpan[0].addEventListener("click", (e) => {
      let widgetValue: BooleanWidgetValue = new BooleanWidgetValue({
        label: getSettings().langSearch.false,
        boolean: false,
      });
      this.renderWidgetVal(widgetValue);
    });
    return this;
```
Cela rend à ce qui suit et a un clickListener pour écouter le clic :

![](https://raw.githubusercontent.com/sparna-git/Sparnatural/master/documentation/15-boolean.png)

## Définir une classe de données

Il est à noter ci-dessus la création de widgetValue à l'intérieur du click listener. Cela nous amène à la prochaine exigence des SparnaturalWidgets. Chaque widget Sparnatural DEVRAIT être accompagné d'une "*classe de données*". Cette classe de données doit hériter de l'interface WidgetValue :

```typescript
export class BooleanWidgetValue implements WidgetValue {
  value: {
    label: string;
    boolean: boolean;
  }
  key():string {
    return this.value.boolean.toString();
  }
  constructor(v:BooleanWidgetValue["value"]) {
    this.value = v;
  }
}
```

## Implémenter parseInput

`parseInput` est utilisé pour 2 choses : analyser la valeur entrée par l'utilisateur et analyser la valeur stockée dans la [structure de données JSON](Query-JSON-format) des requêtes enregistrées.

_/!\ Cette page a été traduite automatiquement depuis la version anglaise_

## Implémenter getRdfJsPattern

TODO

## Ajuster la génération SPARQL en "bloquant" la génération par défaut

TODO


## 2. Ajouter un cas pour quand le nouveau Widget doit être utilisé

Dans `components/builder-section/groupwrapper/criteriagroup/edit-components/WidgetWrapper.ts`, dans la méthode `#createWidgetComponent()`, vous verrez une directive "switch" qui teste le widgetType, c'est-à-dire l'URI d'un type de propriété provenant de l'ontologie de configuration Sparnatural :

```typescript
    switch (widgetType) {
      case Config.LITERAL_LIST_PROPERTY: {
        // ...
      }
      case Config.LIST_PROPERTY:
        // ...
      }
      case Config.AUTOCOMPLETE_PROPERTY:
        // ...
      }
      // ...
      default:
        throw new Error(`WidgetType for ${widgetType} not recognized`);
    }
```

C'est ici que vous pouvez ajouter un cas au switch et appeler le constructeur de votre nouveau widget.
