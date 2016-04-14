var url     = require('url');
var async   = require('async');
var request = require('request');
var cheerio = require('cheerio');
var _       = require('underscore');
var log     = require("crawler-ninja-logger").Logger;


var DEFAULT_USER_AGENT = 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:40.0) Gecko/20100101 Firefox/40.1';
var DEFAULT_NUM_RESULTS = 10;

/**
 *  Make a search based on a keyword on a google domain
 *
 * @param the options used to make the google search, based on the following structure :
 *  var options : {
 *      host : "google.be",  //the google host (eg : google.com, google.fr, ... - default : google.com)
 *      num  : 100, // number of result
 *      qs : {
 *        q : "keyword", // The keyword
 *        hl : "fr"      // the language (iso code), if not specify, the SERP can contains a mix
 *        //and all query parameters supported by Google : https://moz.com/ugc/the-ultimate-guide-to-the-google-search-parameters
 *      }
 *      // If needed, add all request options like proxy : https://github.com/request/request
 * }
 *
 *
 * @param callback(error, urls) url = an array of urls matching to the SERP
 */
function search(options, callback) {

  async.waterfall([
      async.apply(init, options),
      function(options, callback) {
          httpRequest(options, [], callback);
      }],
      callback
  );
}


/**
 *  Check the search options
 *
 * @param the options to check
 * @callback(error, options)
 */
function init(options, callback) {
    if ( ! options.qs) {
      return callback(new Error("No qs attribute in the options"));
    }

    if ( ! options.qs.q ) {
      return callback(new Error("the option object doesn't contain the keyword"));
    }

    options.url = getGoogleUrl(options, "/search");
    options.num = options.num || DEFAULT_NUM_RESULTS;

    // Making request on Google without user agent => not a good idea
    var hasUserAgent = (options.headers || {})["User-Agent"];

    if ( ! hasUserAgent) {
      options.headers = (options.headers || {});
      options.headers["User-Agent"] = DEFAULT_USER_AGENT;
    }

    options.jar = true;

    callback(null, options);
}

/**
 *  Execute a request on Google
 *  This function can called recursivly in order to get multiple google result pages
 *
 * @param the search options
 * @param the already found links
 * @callback(error, links)
 */
function httpRequest(options, links, callback) {

    //console.log("Google request : " + options.url + " - " + (options.proxy || "no proxy"));
    if (options.delay) {
       logInfo("Wait before exec Google request : " + options.delay, options);
       setTimeout(execRequest, options.delay, options, links, callback);
    }
    else {
      execRequest(options, links, callback);
    }


}

function execRequest(options, links, callback) {
    logInfo("Exec Google request", options);
    request(options, function(error, response, body){
          checkGoogleResponse(options, error, response, body, links, callback);
    });
}


function checkGoogleResponse(options, error, response, body, links, callback) {

        if (error) {
          logError("Error during Google request", options, error );
          return callback(null, links);
        }

        if (response.statusCode !== 200) {
          logError("Invalid HTTP code from Goorl : " + response.statusCode, options);
          return callback(null, links);
        }
        var extract = extractLinks(body);
        if (extract.links.length === 0) {
           return callback(null, links);
        }

        links = links.concat(extract.links);

        // We have all links
        if (links.length >= options.num) {
          return callback(null, _.first(links, options.num));
        }

        // We have not sufficiant links, get another google page
        if (extract.nextPage) {
            var nextPageOptions = _.pick(options, 'host', 'num', 'headers', 'proxy', 'delay', 'jar');

            nextPageOptions.url = getGoogleUrl(options, extract.nextPage);

            return httpRequest(nextPageOptions, links, callback);
        }


        callback(null, links);
}


/**
 * Extract links from a google SERP page
 *
 * @param The HTML body
 * @return A list of links (String)
 */
function extractLinks(body) {
    var links = [];

    var $ = cheerio.load(body);

    // Get the links matching to the web sites
    $('.g h3 a').each(function(i, elem) {

        var parsed = url.parse(elem.attribs.href, true);
        if (parsed.pathname === '/url') {
          links.push(parsed.query.q);
        }
        else {
          links.push(elem.attribs.href);
        }

    });

    // Get the link used to access to the next google page for this result
    var nextPage = $("#pnnext").attr("href");

    return {links : links, nextPage : nextPage};
}

/**
 *
 *  Build the Google url based on the options
 *
 * @param the options
 * @callback the relative google path
 */
function getGoogleUrl(options, path) {
    return "https://www." + (options.host || "google.com") + path;
}


function logInfo(message, options) {
  log.info({module : "serp", message : message, url : options.url, proxy : options.proxy, options});
}

function logError(message, options, error) {
  log.error({module : "serp", message : message, url : options.url, proxy : options.proxy, error : error, options});
}

module.exports.search = search;
