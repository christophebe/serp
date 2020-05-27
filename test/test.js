const { expect } = require('chai');
const serp = require('../index.js');

describe('Test Simple Search', async () => {
  it('expect return 10 links with a minimal option set', async () => {
    const options = {
      qs: {
        q: 'test'
      }
    };

    try {
      const links = await serp.search(options);

      console.log(links);

      expect(links).to.have.lengthOf(10);
    } catch (e) {
      console.log('Error', e);
      expect(e).be.null;
    }
  });

  it('expect return 12 links with a specific host and extra parameters', async () => {
    const options = {
      host: 'google.be',
      num: 12,
      qs: {
        q: 'test',
        pws: 0,
        lr: 'lang_fr',
        cr: 'BE'
      }
    };

    try {
      const links = await serp.search(options);

      expect(links).to.have.lengthOf(12);
    } catch (e) {
      expect(e).be.null;
    }
  });

  it('expect return 15 links with delay between each requests', async () => {
    const options = {
      host: 'google.be',
      num: 15,
      delay: 5000,
      qs: {
        q: 'test',
        pws: 0,
        lr: 'lang_fr',
        cr: 'BE'
      }
    };

    try {
      const links = await serp.search(options);

      expect(links).to.have.lengthOf(15);
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
      }
    };

    try {
      const links = await serp.search(options);

      console.log(links);

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
      }
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
      }
    };

    try {
      const num = await serp.search(options);

      expect(num).to.be.an('number').above(0);
    } catch (e) {
      expect(e).be.null;
    }
  });
});
