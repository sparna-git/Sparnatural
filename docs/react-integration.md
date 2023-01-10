# Use Sparnatural in React
Sparnatural is not published as a seperated React component but it is still possible to use it. However, there are some important need to be considered:
- Sparnatural still uses a bit of JQuery current testing hasn't shown any problems but be aware.
- Sparnatural might get some CSS problems when resizing. Best is to keep it in a fixed window size

If you discover any issues let us know!

## Requirements
- download the latest Sparnatural version with `npm install sparnatural`

## Usage
```
import './App.css';
import "sparnatural"
import "sparnatural/dist/sparnatural.css"

// import the JSON-LD config file
import config from "./config.json"
function App() {  
  return (
    <div className="App">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-rbsA2VBKQhggwzxH7pPCaAqO46MgnOM80zW1RWuH61DGLwZJEdK2Kadq2F9CUG65" crossOrigin="anonymous"></link>
    {/*FontAwesome is only needed when the fontawesome features is used to display icons*/}
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.1/css/all.min.css"  />
      <div id="ui-search" style={{width:"auto"}}>
        <spar-natural 
          src={JSON.stringify(config)} 
          lang={'fr'} endpoint={'https://fr.dbpedia.org/sparql'} 
          distinct={'true'} 
          limit={'100'}
          prefix={"skos:http://www.w3.org/2004/02/skos/core#"} 
          debug={"true"}
        />
     </div>
    </div>
  );
}

export default App;
```
This shows examplary how to integrate sparnatural inside a React component. For more information on the configuration refer to [Javascript integration v8](Javascript-integration)