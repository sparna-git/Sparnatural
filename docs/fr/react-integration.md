_[Accueil](index.html) > Utiliser Sparnatural dans React_

# Utiliser Sparnatural dans React
Sparnatural n'est pas publié en tant que composant React séparé, mais il est toujours possible de l'utiliser. Cependant, il y a quelques points importants à prendre en compte :
- Sparnatural utilise toujours un peu de JQuery, les tests actuels n'ont montré aucun problème mais soyez vigilant.
- Sparnatural pourrait rencontrer des problèmes de CSS lors du redimensionnement. Il est préférable de le maintenir dans une taille de fenêtre fixe.

Si vous découvrez des problèmes, faites-le nous savoir !

## Exigences
- Téléchargez la dernière version de Sparnatural avec `npm install sparnatural`

## Utilisation

### Intégration JSX (sans YASGUI)

```typescript
import './App.css';
import { useEffect, useRef } from 'react';
import "sparnatural"
import "sparnatural/dist/sparnatural.css"

// import the JSON-LD config file
import config from "./config.json"

interface  SparnaturalEvent extends Event {
  detail?:{
    queryString:string,
    queryJson:string,
    querySparqlJs:string
  }
}

function App() {  
   const sparnaturalRef = useRef<HTMLElement>(null);
   useEffect(
    () => {
      sparnaturalRef?.current?.addEventListener("queryUpdated", (event:SparnaturalEvent) => {
        console.log(event?.detail?.queryString);
        console.log(event?.detail?.queryJson);
        console.log(event?.detail?.querySparqlJs);
        // here : don't forget to call expandSparql so that core:sparqlString annotation is taken into account
     });
    },
    [],
  );

  return (
    <div className="App">
      {/*FontAwesome is only needed when the fontawesome features is used to display icons*/}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.1/css/all.min.css"  />
      <div id="ui-search" style={{width:"auto"}}>
        <spar-natural 
          ref={sparnaturalRef}
          src={JSON.stringify(config)} 
          lang={'en'}
          defaultLang={'en'}
          endpoint={'https://fr.dbpedia.org/sparql'} 
          distinct={'true'} 
          limit={'100'}
          prefix={"skos:http://www.w3.org/2004/02/skos/core# rico:https://www.ica.org/standards/RiC/ontology#"} 
          debug={"true"}
        />
      </div>
    </div>
  );
}

export default App;

```
### Ajouter un fichier de déclaration pour JSX (uniquement pour Typescript)

Ceci est uniquement nécessaire lorsque vous utilisez React avec Typescript. <br>
Le fichier de déclaration doit s'appeler `declaration.d.ts` et être situé au niveau racine du dossier src/.

```typescript
namespace JSX {
    interface IntrinsicElements {
        "spar-natural": SparnaturalAttributes;
    }

    interface SparnaturalAttributes {
        ref:React.RefObject<HTMLElement>
        src: string;
        lang: string;
        endpoint: string;
        distinct: string;
        limit: string;
        prefix: string;
        debug:string
    }
}
```

Cela montre de manière exemplaire comment intégrer Sparnatural à l'intérieur d'un composant React. Pour plus d'informations sur la configuration, consultez [Intégration Javascript v8](Javascript-integration)
