const { expect } = require('chai');
const serp = require('../index.js');

const accessKey = 'xxxx';

describe.only('Test Search via a scrape api', async () => {
  it('expect return 10 links with a minimal option set', async () => {
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
  });

  it('expect return 20 links with a specific host and extra parameters', async () => {
    const options = {
      host: 'google.be',
      num: 20,
      qs: {
        q: 'test',
        pws: 0,
        lr: 'lang_fr',
        cr: 'BE'
      },
      scrapeApiUrl: `http://api.scraperapi.com/?api_key=${ accessKey }`
    };

    try {
      const links = await serp.search(options);

      // console.log(links);
      expect(links).to.have.lengthOf(20);
    } catch (e) {
      expect(e).be.null;
    }
  });

  it('expect return 100 links within one request', async () => {
    const options = {
      host: 'google.be',
      num: 100,
      qs: {
        q: 'test',
        pws: 0,
        lr: 'lang_fr',
        cr: 'BE',
        num: 100
      },
      scrapeApiUrl: `http://api.scraperapi.com/?api_key=${ accessKey }`
    };

    try {
      const links = await serp.search(options);

      console.log(links.length);
      expect(links).to.have.lengthOf(100);
    } catch (e) {
      expect(e).be.null;
    }
  });

  it('expect return 0 for number of results of a non indexed site', async () => {
    const options = {
      host: 'google.be',
      numberOfResults: true,
      qs: {
        q: 'site:objectifxxxssq-web.be'
      },
      scrapeApiUrl: `http://api.scraperapi.com/?api_key=${ accessKey }`
    };

    try {
      const nbr = await serp.search(options);

      expect(nbr).equals(0);
    } catch (e) {
      expect(e).be.null;
    }
  });

  it('expect return a number > 0 for the number of results of an indexed site', async () => {
    const options = {
      host: 'google.be',
      numberOfResults: true,
      qs: {
        q: 'site:lesoir.be',
        pws: 0,
        lr: 'lang_fr',
        cr: 'BE'
      },
      scrapeApiUrl: `http://api.scraperapi.com/?api_key=${ accessKey }`
    };

    try {
      const num = await serp.search(options);

      expect(num).to.be.an('number').above(0);
    } catch (e) {
      expect(e).be.null;
    }
  });
});
