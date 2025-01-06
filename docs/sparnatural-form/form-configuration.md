_[Home](index.html) > Sparnatural form > form configuration_

# Sparnatural form configuration structure

This is the documentation for the JSON data structure of the `sparnatural-form` component.


## Form specification example

The following form :

![Sparnatural form example](/assets/images/sparnatural-form/form-example.png)

Is modelled in the following JSON data structure :

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

## JSON data structure reference

The JSON data structure encodes the list of fields in the form, and for each field, gives:
  - its display labels
  - the variable to which the field is associated in the underlying Sparnatural query passed in the `query` attribute of the form

The data structure can also optionnaly list the variables from the original query that should be retained when the query results are displayed onscreen (versus when a full export is done).

### Form specification structure

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

- `bindings` : an array containg the list of bindings to the underlying Sparnatural query
- `variables` : an object containing the specifications of variables to retain for each possible query type in the form

### Binding structure with user prompt

Inside `bindings`, a single binding is an association between an underlying variable in the Sparnatural query, and how this query is populated with a value. Currently, the only way to populate a variable is through a user input field, but other ways of binding a query with a value could be imagined inthe future.

```json
{
  "variable": "...",
  "node": {
    "type": "UserPrompt",
    "name": {
      "en": "...",
      "fr": "..."
    }
  }
}
```

- `variable` : the name of the variable in the underlying Sparnatural query in which the selected value will be injected. See the [Sparnatural query structure documentation](https://docs.sparnatural.eu/Query-JSON-format.html). This is typically the name of a variable in the `o` position of the query, at any level in the query structure.

For example if your query contains this, with the `ContainerFormat` variable in `o` position:

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

Then you may configure a form field this way:

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

### Variables structure

This part is optionnal.

```json
"variables": {
  	"onscreen" : [
  		"...",
  		"...",
  		"..."
  	]
}
```

- `variables` : the `variables` section of the form specification can contain only the single key `onscreen`.
- `onscreen` : the `onscreen` key is an array that contains a list of string value corresponding to the variables that should be retained when displaying the query result on screen, as opposed to making an export of the query result. Any variables in the SELECT clause of the query that is not in this list will be filtered out, along with the corresponding search criteria in the WHERE clause, if this criteria was not filled in by the user.

If left unspecified, all variables selected in the query will be returned as normal, and the "export" option will not be available.