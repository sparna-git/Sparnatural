_[Home](index.html) > Querying a password-protected SPARQL endpoint_

# uerying a password-protected SPARQL endpoint

## The problem

Some SPARQL endpoints might be password-protected. This requires extra-headers to be passed in requests.

## The solution : adding extra headers to Sparnatural and YasQE

You need to pass extra headers at two places : in Sparnatural and in YasQE (if you use YasQE), that will send the final query to the triplestore.

### Add extra headers to Sparnatural

Add the following code to your Sparnatural initialization code to pass extra headers to Sparnatural:

```javascript
sparnatural.addEventListener("init", (event) => {
  sparnatural.headers = {
    "User-Agent" : "This is Sparnatural calling",
    "Authorization" : "Bearer token"
    // add other headers as necessary
  };
});
```

Sparnatural will honor these headers when sending requests to populate the dropdown lists, autocomplete fields, or tree widgets.

### Make YasQE query a password-protected SPARQL-endpoint

For demo pages using the old version of YASGUI, the corresponding archived documentation is at https://web.archive.org/web/20190216123103/http://yasqe.yasgui.org/doc, and the correct JQuery function is at https://stackoverflow.com/a/5507289/189723

```javascript
var yasqe = YASQE.fromTextArea(document.getElementById("yasqe"), {
        sparql : {
          showQueryButton : true,
          endpoint : $('#endpoint').text(),
          beforeSend: function(xhr) { xhr.setRequestHeader("Authorization", "Basic " + btoa(username + ":" + password)); };
        }
      });
```

