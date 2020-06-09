const util = require('util');
const request = require('request-promise-native');
const cheerio = require('cheerio');

const delay = util.promisify(setTimeout);

const DEFAULT_USER_AGENT = 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:40.0) Gecko/20100101 Firefox/40.1';
const DEFAULT_OPTIONS = {
  num: 10,
  retry: 3,
  delay: 0,
  resolveWithFullResponse: true,
  jar: true
};

/**
  *  Make a search based on a keyword on a google domain
  *
  * @param  {json} params  the options used to make the google search, based on the following structure :
  * {
  *      host : "google.be",  //the google host (eg : google.com, google.fr, ... - default : google.com)
  *      num  : 100, // number of result
  *      qs : {
  *        q : "keyword", // The keyword
  *        hl : "fr"      // the language (iso code), if not specify, the SERP can contains a mix
  *        //and all query parameters supported by Google : https://moz.com/ugc/the-ultimate-guide-to-the-google-search-parameters
  *      }
  *      // If needed, add all request options like proxy : https://github.com/request/request
  * }
  * @returns {Array<string>} list of url that match to the Google SERP
  */
async function search(params) {
  const options = check(params);
  const result = await doRequest(options, 0);

  if (Array.isArray(result)) {
    return result.slice(0, options.num);
  }

  return result;
}

/**
 * check - Check is the search options are well defined & add default value
 *
 * @param  {Json} params  The options to check
 * @returns {Json} a Json clone of the params with default values
 */
function check(params) {
  if (!params.qs) {
    throw new Error('No qs attribute in the options');
  }

  if (!params.qs.q) {
    throw new Error('the option object doesn\'t contain the keyword');
  }

  const options = Object.assign({}, DEFAULT_OPTIONS, params);

  options.url = getGoogleUrl(options, '/search');

  // Making request on Google without user agent => not a good idea
  const hasUserAgent = (options.headers || {})['User-Agent'];

  if (!hasUserAgent) {
    options.headers = options.headers || {};
    options.headers['User-Agent'] = DEFAULT_USER_AGENT;
  }

  if (options.proxyList) {
    options.proxy = options.proxyList.pick().getUrl();
  }

  return options;
}

/**
 * tryRequest - Execute a Google request with some retries in the case of errors
 *
 * @param  {Json} options The search options
 * @param {number} nbrOfLinks the number of links already retrieved
 * @returns {Array<string>|number} The list of url found in the SERP or the number of result
 */
async function doRequest(options, nbrOfLinks) {
  let response = -1;

  for (let i = 0; i < options.retry; i += 1) {
    try {
      /* eslint-disable no-await-in-loop */
      await delay(options.delay);
      response = await execRequest(options, nbrOfLinks);
      break;
    } catch (error) {
      logError(`Error during the request, retry : ${ i }`, options, error);

      if (options.proxyList) {
        /* eslint-disable no-param-reassign */
        options.proxy = options.proxyList.pick().getUrl();
      }

      if (i === options.retry - 1) {
        throw error;
      }
    }
  }

  return response;
}

/**
 * execRequest - Execute a Google Request
 *
 * @param  {Json} options The search options
 * @param {number} nbrOfLinks the number of links already retrieved
 * @returns {Array<string>|number} The list of url found in the SERP or the number of result
 */
async function execRequest(options, nbrOfLinks) {
  // If we want to get the number of results => force the interface language = EN
  // Otherwise it becomes difficult to parse the html body
  if (options.numberOfResults) {
    options.qs.hl = 'EN';
  }

  const response = await request(options);

  if (response && response.statusCode !== 200) {
    throw new Error(`Invalid HTTP status code on ${ options.url }`);
  }
  if (options.numberOfResults) {
    return getNumberOfResults(options, response);
  }

  return await getLinks(options, response, nbrOfLinks);
}

/**
 * getNumberOfResults - Return the number of result found in Google
 *
 * @param  {Json} options The search options
 * @param  {Object} response The Http response
 * @returns {number} The number of results
 */
function getNumberOfResults(options, response) {
  const $ = cheerio.load(response.body);

  const hasNumberofResult = $('body').find('#result-stats').length > 0;

  if (!hasNumberofResult) {
    return 0;
  }

  const result = $('#result-stats').text().split(' ');

  if (result.length > 1) {
    // Convert String with a format number into a number
    return Number(result[1].replace(/\D/g, ''));
  }

  return 0;
}

/**
  * getLinks - Get all URL(links) found in the top positions of the SERP
  *
  * @param {Json} options The search options
  * @param {Object} response The Http response
  * @param {number} nbrOfLinks the number of links already retrieved
  * @returns {Array} The list of the links
  */
async function getLinks(options, response, nbrOfLinks) {
  const result = extractLinks(options, response.body);
  let allLinks = result.links;

  if (allLinks.length === 0) {
    return allLinks;
  }

  const nbr = nbrOfLinks + allLinks.length;

  if (nbr >= options.num) {
    return allLinks;
  }

  if (result.nextPage) {
    const nextPageOptions = Object.assign({}, options);

    nextPageOptions.url = getGoogleUrl(options, result.nextPage);

    allLinks = [ ...allLinks, ...await doRequest(nextPageOptions, nbr) ];
  }

  return allLinks;
}

/**
 * extractLinks - Get the links from the HTML body
 *
 * @param {Json} options The search options
 * @param  {type} body th HTML body
 * @returns {Object} The list of the links & information about the next SERP page
 */
function extractLinks(options, body) {
  const links = [];

  const $ = cheerio.load(body);

  // if exactQuery option is present then
  // check if the result is exactly for the provided query
  // if it is for some modified/suggested query, return empty array
  if (options.exactQuery) {
    let query = options.qs.q;
    let a = $(`div:contains(No results found for ${query})`).text().includes(`No results found for ${query}`);
    if (a) return { links };
  }

  // Get the links matching to the web sites
  // Update May 2020 : search only the h3. Google changes its CSS name
  // $('body').find('.srg h3').each((i, h3) => {
  $('body').find('h3').each((i, h3) => {
    if ($(h3).parent()) {
      const href = $(h3).parent().attr('href');

      if (href) {
        links.push({ url: href, title: $(h3).text() });
      }
    }
  });

  // Get the link used to access to the next google page for this result
  const nextPage = $('#pnnext').attr('href');

  return { links, nextPage };
}

/**
 * getGoogleUrl - description
 *
 * @param  {type} options description
 * @param  {type} path    description
 * @returns {type}         description
 */
function getGoogleUrl(options, path) {
  return `https://www.${ options.host || 'google.com' }${ path }`;
}

/**
 * logError - description
 *
 * @param  {type} message description
 * @param  {type} options description
 * @param  {type} error   description
 */
function logError(message, options, error) {
  console.error({ module: 'serp', message, url: options.url, proxy: options.proxy, error, options });
}

module.exports.search = search;
