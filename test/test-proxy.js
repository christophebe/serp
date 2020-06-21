const { expect } = require('chai');
const serp = require('../index.js');

describe('Test Simple Search', async () => {
  it('expect return 10 links with a minimal option set', async () => {
    const options = {
      qs: {
        q: 'test'
      },
      proxy: 'http://user:password@host'
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
});
