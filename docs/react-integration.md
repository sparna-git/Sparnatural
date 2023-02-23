# Use Sparnatural in React
Sparnatural is not published as a seperated React component but it is still possible to use it. However, there are some important need to be considered:
- Sparnatural still uses a bit of JQuery current testing hasn't shown any problems but be aware.
- Sparnatural might get some CSS problems when resizing. Best is to keep it in a fixed window size

If you discover any issues let us know!

## Requirements
- download the latest Sparnatural version with `npm install sparnatural`

## Usage

### JSX integration (without YASGUI)
```
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
          lang={'fr'} endpoint={'https://fr.dbpedia.org/sparql'} 
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
### Add Declaration file for JSX (Typescript only)
This is only necesarry when you are using React together with typescript. <br>
The declaration file must be call `declaration.d.ts` and be located on the root level of the src/ folder.
```
namespace JSX {
    interface IntrinsicElements {
        "spar-natural": SparnaturalAttributes;
    }

    interface SparnaturalAttributes {
        ref:React.RefObject<unknown>
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

This shows examplary how to integrate sparnatural inside a React component. For more information on the configuration refer to [Javascript integration v8](Javascript-integration)