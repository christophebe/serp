# serp

This module allows to execute search on Google with or without proxies.

# Installation

``` bash
$ npm install serp
```

# Exemple

``` javascript
var serp = require('serp');

var options = {
  host : "google.be",
  qs : {
    q   : "test", // the keyword
    num : 100
  }
};

serp.search(options, function(error, links){
      console.log(links);
});
```

For google.com, the param host is not necessary.
qs can contains the usual Google search parameters : https://moz.com/ugc/the-ultimate-guide-to-the-google-search-parameters.

The options object can also contain all request options like proxy : https://github.com/request/request
