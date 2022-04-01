_[Home](index.html) > Querying a password-protected SPARQL endpoint_

This is actually not part of Sparnatural, but of YASQE.

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

