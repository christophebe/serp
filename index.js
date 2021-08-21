const util = require('util');
const { chromium } = require('playwright');
const cheerio = require('cheerio');

const delay = util.promisify(setTimeout);

const SEARCH = '/search';

const DEFAULT_OPTIONS = {
  num: 10,
  retry: 5,
  delay: 0,
  headless: true,

  // request can be slow if a scrape API is used.
  timeout: 60000
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
  * }
  * @returns {Array<string>} list of url that match to the Google SERP
  */
async function search(params) {
  const options = await buildOptions(params);

  try {
    const result = await doRequest(options);

    if (Array.isArray(result)) {
      return result.slice(0, options.num);
    }

    return result;
  } finally {
    await options.browser.close();
  }
}

/**
 * Check is the search options are well defined & add default value
 *
 * @param  {Json} params  The params to check
 * @returns {Json} a Json clone of the params with default values
 */
async function buildOptions(params) {
  if (!params.qs) {
    throw new Error('No qs attribute in the options');
  }

  if (!params.qs.q) {
    throw new Error('the option object doesn\'t contain the keyword');
  }

  const options = Object.assign({}, DEFAULT_OPTIONS, params);

  if (options.numberOfResults) {
    options.qs.hl = 'EN';
  }

  options.browser = await chromium.launch({ headless: options.headless });

  return options;
}

/**
 * Execute a Google request with some retries in the case of errors
 *
 * @param  {Json} options The search options
 * @param {number} nbrOfLinks the number of links already retrieved
 * @returns {Array<string>|number} The list of url found in the SERP or the number of result
 */
async function doRequest(options, nbrOfLinks = 0) {
  let response = -1;

  for (let i = 0; i < options.retry; i += 1) {
    try {
      /* eslint-disable no-await-in-loop */
      await delay(options.delay);
      response = await execRequest(options, nbrOfLinks);
      break;
    } catch (error) {
      if (i === options.retry - 1) {
        throw error;
      }
    }
  }

  return response;
}

/**
 * Execute a Google Request with the help of playwright in order to accept the cookie consent
 *
 * @param  {Json} options The search options
 * @param {number} nbrOfLinks the number of links already retrieved
 * @returns {Array<string>|number} The list of url found in the SERP or the number of result
 */
async function execRequest(options, nbrOfLinks) {
  const content = await requestFromBrowser(buildUrl(options), options);

  if (options.numberOfResults) {
    return getNumberOfResults(content);
  }

  return await getLinks(options, content, nbrOfLinks);
}

async function requestFromBrowser(url, options) {
  const page = await newPage(options);

  const response = await page.goto(url);

  if (response && !response.ok()) {
    throw new Error(`Invalid HTTP status code on ${ options.url }`);
  }

  // If the cookie consent button exist on the page, click on it
  const consentButton = await page.$('//div[text()=\'I agree\']');

  if (consentButton) {
    await consentButton.click();
  }

  return await page.content();
}

async function newPage(options) {
  const contextOptions = {};

  if (options.proxy) {
    contextOptions.proxy = options.proxy;
  }

  if (options.proxyList) {
    contextOptions.proxy = pickNewProxy(options);
  }

  const context = await options.browser.newContext(contextOptions);
  const page = await context.newPage();

  return page;
}

function pickNewProxy(options) {
  if (!options.proxyList) {
    throw new Error('There is no proxy list in the options');
  }

  const p = options.proxyList.pick();

  return {
    server: `http://${ p.host }:${ p.port }`,
    username: p.userName,
    password: p.password

  };
}

/**
 * Return the number of result found in Google
 *
 * @param  {Object} content The Http body content
 * @returns {number} The number of results
 */
function getNumberOfResults(content) {
  const $ = cheerio.load(content);

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
  * Get all URL(links) found in the top positions of the SERP
  *
  * @param {Json} options The search options
  * @param {Object} content The html content
  * @param {number} nbrOfLinks the number of links already retrieved
  * @returns {Array} The list of the links
  */
async function getLinks(options, content, nbrOfLinks) {
  const result = extractLinks(content);
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

    nextPageOptions.path = result.nextPage;

    allLinks = [ ...allLinks, ...await doRequest(nextPageOptions, nbr) ];
  }

  return allLinks;
}

/**
 * Build the url used to make the request on Google. It could be done directly or via a scrape api url
 *
 * @param  {json} options the options used to build the url
 * @returns {string} the url
 */
function buildUrl(options) {
  return options.scrapeApiUrl ? `${ options.scrapeApiUrl }&url=${ buildGoogleUrl(options) }` : buildGoogleUrl(options);
}

function buildGoogleUrl(options) {
  // path is used when we request the second page of the SERP
  if (options.path) {
    return `https://www.${ options.host || 'google.com' }${ options.path }`;
  }

  const url = `https://www.${ options.host || 'google.com' }${ SEARCH }`;
  const queryparams = [];

  // eslint-disable-next-line guard-for-in
  for (const q in options.qs) {
    queryparams.push(`${ q }=${ options.qs[q] }`);
  }

  return encodeURI(`${ url }?${ queryparams.join('&') }`);
}

/**
 * extractLinks - Get the links from the HTML body
 *
 * @param  {type} body th HTML body
 * @returns {Object} The list of the links & information about the next SERP page
 */
function extractLinks(body) {
  const links = [];

  const $ = cheerio.load(body);

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

module.exports.search = search;
