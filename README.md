# serp

This module allows to execute search on Google with or without proxies.
It provides different options for scraping the google results.

# Installation

``` bash
$ npm install serp -S
```


# Simple usage

``` javascript
var serp = require("serp");

var options = {
  host : "google.be",
  qs : {
    q : "test",
    filter : 0,
    pws : 0
  },
  num : 1000
};

serp.search(options, function(error, links){
      console.log(links);
});
```

** Understanding the options structure : **
- For google.com, the param host is not necessary.
- qs can contains the usual Google search parameters : https://moz.com/ugc/the-ultimate-guide-to-the-google-search-parameters.
- options.qs.q is the keyword
- num is the number of desired results (defaut is 10).
- The options object can also contain all request options like http headers, ... . Serp is using the request module :  https://github.com/request/request
- The user agent is not mandatory. Default value will be : 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:40.0) Gecko/20100101 Firefox/40.1'


## With proxies

If you are using only one proxy, you can add it in the options.

``` javascript
var serp = require("serp");

var options = {
  qs : {
    q : "test",
  },
  proxy : "http://username:password@host:port"  
};

serp.search(options, function(error, links){
      console.log(links);
});
```

If you are using multiple proxies, a different proxy will be used for each keyword. This module uses simple-proxies for managing proxies.
You can install it in your node app with the following command line :

``` bash
$ npm install simple-proxies -S
```


``` javascript
var proxyLoader = require("simple-proxies/lib/proxyfileloader");
var serp        = require("serp");

proxyLoader.loadDefaultProxies(function(error, pl){
    var proxyList = pl;
    loadSerp(proxyList);
});

function loadSerp(proxyList) {
  var options = {
    qs : {
      q : "test+keyword"
    },
    proxyList : proxyList
  };

  serp.search(options, function(error, links){
        if (error) {
          return console.log(error);  
        }
        console.log("Result.nbr", links.length);
        console.log("Result", links);

  });

}

```
