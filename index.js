var url     = require('url');
var request = require('request');
var cheerio = require('cheerio');

/**
 *  Make a search based on a keyword on a google domain
 *
 * @param the options used to make the google search, based on the following structure :
 *  var options : {
 *      host : "google.be",  //the google host (eg : google.com, google.fr, ... - default : google.com)
 *      qs : {
 *        q : "keyword", // The keyword
 *        num : 100,     // the number of result (default : 10)
 *        hl : "fr"      // the language (iso code), if not specify, the SERP can contains a mix
 *        //and all query parameters supported by Google : https://moz.com/ugc/the-ultimate-guide-to-the-google-search-parameters
 *      }
 *      // If needed, add all request options like proxy : https://github.com/request/request
 * }
 *
 *
 * @param callback(error, urls) url = an array of urls matching to the SERP
 */
module.exports.search = function(options, callback) {

  options.uri = "https://www." + (options.host || "google.com") + "/search" ;

  if ( ! options.qs || ! options.qs.q ) {
    return callback(new Error("the option object doesn't contain the keyword"));
  }

  request(options, function(error, response, body) {
          if (error) {
            return callback(error);
          }

          if (response.statusCode != 200) {
            return callback(new Error("Invalid HTTP code : " + response.statusCode));
          }
          var links = extractLinks(body);
          callback(null, links);
  });

}

function extractLinks(body) {
  var results = [];
  var $ = cheerio.load(body);

  $('.g h3 a').each(function(i, elem) {
    var parsed = url.parse(elem.attribs.href, true);
    if (parsed.pathname === '/url') {
      results.push(parsed.query.q);
    }
  });

  return results;
}
