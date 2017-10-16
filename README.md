# serp

This module allows to execute search on Google with or without proxies.
It provides different options for scraping the google results (either the list of the referenced sites or the number of results).


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
  num : 100
};

serp.search(options)
  .then(links => console.log(links))
  .catch(error => console.log(error));
```

*Understanding the options structure :*
- For google.com, the param host is not necessary.
- qs can contain the usual Google search parameters : https://moz.com/ugc/the-ultimate-guide-to-the-google-search-parameters.
- options.qs.q is the keyword
- num is the number of desired results (defaut is 10).
- The options object can also contain all request options like http headers, ... . SERP is using the request module :  https://github.com/request/request
- The user agent is not mandatory. Default value will be : 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:40.0) Gecko/20100101 Firefox/40.1'


## With proxy

You can add the proxy reference in the options

``` javascript
var serp = require("serp");

var options = {
  qs : {
    q : "test",
  },
  proxy : "http://username:password@host:port"  
};

serp.search(options)
  .then(links => console.log(links))
  .catch(error => console.log(error));
```

You can also use the module simple proxy if you have several proxies (see : https://github.com/christophebe/simple-proxies).

``` javascript
var serp = require("serp");

var options = {
  qs : {
    q : "test",
  },
  proxyList : proxyList
};

serp.search(options)
  .then(links => console.log(links))
  .catch(error => console.log(error));
```

## Delay between requests

It is possible to add a delay between each request made on Google with the option *delay* (value in ms).
The delay is also applied when the tool read the next result page on Google.


``` javascript
var serp = require("serp");

var options = {

  qs : {
    q : "test"
  },
  num : 100,
  delay : 2000 // in ms
};

serp.search(options)
  .then(links => console.log(links))
  .catch(error => console.log(error));
```

## Retry if error

If an error occurs (timeout, network issue, invalid HTTP status, ...), it is possible to retry the same request on Google. If a proxyList is set into the options, another proxy will be used.

``` javascript
var serp = require("serp");

var options = {

  qs : {
    q : "test"
  },
  num : 100,
  retry : 3,
  proxyList : proxyList
};

serp.search(options)
  .then(links => console.log(links))
  .catch(error => console.log(error));
```

## Get the number of results

You can get the number of indexed pages in Google by using the following code.


``` javascript
var serp = require("serp");

var options = {
  host : "google.fr",
  numberOfResults : true,
  qs : {
    q   : "site:yoursite.com"
  },
  proxyList : proxyList
};

serp.search(options)
  .then(nbrOfResults => console.log(nbrOfResults))
  .catch(error => console.log(error));
```
