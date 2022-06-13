# serp

This module allows to get the result of a Google search based on a keyword.

It provides different options for scraping the google results called SERP (Search Engine Result Page) : 
- delay between requests
- retry if error 
- with or without proxy, proxies or scrape API. 

This module uses Playwright in order to accept the cookie consent popup before making a new search. 

# Installation

``` bash
$ npm install serp -S
```


# Simple usage

``` javascript
const serp = require("serp");

var options = {
  host : "google.fr",
  qs : {
    q : "test",
    filter : 0,
    pws : 0
  },
  num : 100
};

const links = await serp.search(options);
```

*Understanding the options structure :*
- For google.com, the param host is not necessary.
- qs can contain the usual Google search parameters : https://moz.com/ugc/the-ultimate-guide-to-the-google-search-parameters.
- options.qs.q is the keyword
- num is the number of desired results (defaut is 10).

## Delay between requests

It is possible to add a delay between each request made on Google with the option *delay* (value in ms).
The delay is also applied when the tool read the next result page on Google.


``` javascript
const serp = require("serp");

var options = {

  qs : {
    q : "test"
  },
  num : 100,
  delay : 2000 // in ms
};

const links = await serp.search(options);
```

## Retry if error

If an error occurs (timeout, network issue, invalid HTTP status, ...), it is possible to retry the same request on Google. If a proxyList is set into the options, another proxy will be used.

``` javascript
const serp = require("serp");

var options = {

  qs : {
    q : "test"
  },
  num : 100,
  retry : 3,
  proxyList : proxyList
};

const links = serp.search(options);
```

## Get the number of results

You can get the number of indexed pages in Google by using the following code.


``` javascript
const serp = require("serp");

var options = {
  host : "google.fr",
  numberOfResults : true,
  qs : {
    q   : "site:yoursite.com"
  },
  proxyList : proxyList
};

const numberOfResults = await serp.search(options);
```



## With proxy

You can add the proxy reference in the options

``` javascript
const serp = require("serp");

var options = {
  qs : {
    q : "test",
  },
  proxy : {
        server: 'hots:port',
        username: 'username',
        password: 'password'
  }
  
};


const links = await serp.search(options);
```

# With multiple proxies

You can also use the module simple proxy if you have several proxies (see : https://github.com/christophebe/simple-proxies).
In this case, a different proxies (choose randomly) will be used of each *serp.search* call. 


See [this unit test](https://github.com/christophebe/serp/blob/master/test/test-proxies.js) to get the complete code. 
The proxies have to be in a txt file : one line for each proxy with the following structure : host:port:user:password

``` javascript
const  serp = require("serp");

var options = {
  qs : {
    q : "test",
  },
  proxyList : proxyList
};

const links = await serp.search(options);
```

# with a scrape API

This module can use a scrape API instead of a list of proxies.

This is an example with [scrapeapi.com](https://www.scraperapi.com/?fp_ref=christophe65)

``` javascript
const options = {
      num: 10,
      qs: {
        q: 'test'
      },
      scrapeApiUrl: `http://api.scraperapi.com/?api_key=${ accessKey }`
    };

    try {
      const links = await serp.search(options);

      // console.log(links);
      expect(links).to.have.lengthOf(10);
    } catch (e) {
      console.log('Error', e);
      expect(e).be.null;
    }
```     

## Proxies or Scrape API ? 

If you make many requests at the same time or over a limited period of time, Google may ban your IP address.  This can happen even faster if you use particular search commands such as:  intitle, inurl, site:, ... 

It is therefore recommended to use proxies. The SERP module supports two solutions: 
- Datacenter proxies  like for example those proposed by [Mexela](https://mexela.com/aff.php?aff=191). Shared proxies are more than enough. 

- Scrape APIs such as [scrapeapi.com](https://www.scraperapi.com/?fp_ref=christophe65)

**What to choose? Datacenter proxies or Scrape API ?** 

It all depends on what you are looking for. Datacenter proxies will provide the best performance and are generally very reliable. You can use the "retry" option to guarantee even more reliability. It's also a solution that offers a good quality/price ratio but it will require more effort in terms of development, especially for the rotation of proxies. If you want to use rotation with datacenter proxies, see [this unit test](https://github.com/christophebe/serp/blob/master/test/test-proxies.js).

Although slower, the scrape APIs offer other features such as the geolocation of IP addresses over a larger number of countries and the ability to scrape dynamic pages. Using such an API can also simplify the code. Unfortunately, this solution is often more expensive than data center proxies. So, scrape APIs becomes interesting if you have other scrape needs. 

In all cases, make a test with [shared proxies](https://mexela.com/aff.php?aff=191) in order to check it is suffisiant for your use cases.Those proxies are really cheap. 
