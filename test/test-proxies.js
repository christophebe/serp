const { expect } = require('chai');
const proxyLoader = require('simple-proxies/lib/proxyfileloader');
const serp = require('../index.js');

describe('Test Simple Search with proxy', async () => {
  let proxyList = null;

  before(async () => {
    try {
      console.log('Loading proxies ...');
      const config = proxyLoader.config()
        .setProxyFile('./proxies.txt')
        .setCheckProxies(false)
        .setRemoveInvalidProxies(false);

      proxyList = await proxyLoader.loadProxyFile(config);
      console.log(`Proxies loaded : ${ proxyList.getNumberOfProxies() }`);
    } catch (e) {
      console.log(e);
    }
  });

  it('Should return 0 for number of results of a non indexed site', async () => {
    // this.timeout(60000);
    const options = {
      host: 'google.be',
      numberOfResults: true,
      qs: {
        q: 'site:tootofffd.be'
      },
      proxyList
    };

    try {
      const nbr = await serp.search(options);

      expect(nbr).equals(0);
    } catch (e) {
      expect(e).be.null;
    }
  });

  it('Should return 12 links with a specific host and extra parameters', async () => {
    // this.timeout(20000);
    const options = {
      host: 'google.be',
      num: 12,
      qs: {
        q: 'test',
        pws: 0,
        lr: 'lang_fr',
        cr: 'BE'
      },
      proxyList
    };

    try {
      const links = await serp.search(options);

      expect(links).to.have.lengthOf(12);
    } catch (e) {
      expect(e).be.null;
    }
  });

  it('Should return 15 links with delay between each requests', async () => {
    // this.timeout(60000);
    const options = {
      host: 'google.be',
      num: 15,
      delay: 5000,
      qs: {
        q: 'test',
        pws: 0,
        lr: 'lang_fr',
        cr: 'BE'
      },
      proxyList
    };

    try {
      const links = await serp.search(options);

      expect(links).to.have.lengthOf(15);
    } catch (e) {
      expect(e).be.null;
    }
  });
});
