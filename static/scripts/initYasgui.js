/*
    Init Yasgui component
*/

import {sparnatural} from './initSparnatural.js'

export const yasqe = new Yasqe(document.getElementById("yasqe"), {
    requestConfig: { endpoint: $('#endpoint').text() },
    copyEndpointOnNewTab: false  
    });


export const yasr = new Yasr(document.getElementById("yasr"), {
    //this way, the URLs in the results are prettified using the defined prefixes in the query
    getUsedPrefixes : yasqe.getPrefixesFromQuery,
    "drawOutputSelector": false,
    "drawDownloadIcon": false,
    // avoid persistency side-effects
    "persistency": { "prefix": false, "results": { "key": false }}
});

// link yasqe and yasr
yasqe.on("queryResponse", function(_yasqe, response, duration) {
    yasr.setResponse(response, duration);
}); 