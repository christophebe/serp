const assert = require("assert");
const serp = require("../index.js");
const proxyLoader = require("simple-proxies/lib/proxyfileloader");


describe.skip("Test Simple Search with proxy", () => {
  let proxyList = null;

  before(function beforeTest(done) {
    this.timeout(100000);

    const config = proxyLoader.config().setProxyFile("./proxies.txt")
      .setCheckProxies(true)
      .setRemoveInvalidProxies(false);

    proxyLoader.loadProxyFile(config, (error, pl) => {
      if (error) {
        done(error);
      }
      proxyList = pl;
      console.log("proxies loaded");
      done();
    });
  });

  it("Should return 0 for number of results of a non indexed site", function test() {
    this.timeout(60000);
    const options = {
      host: "google.be",
      numberOfResults: true,
      qs: {
        q: "site:tootofffd.be",
      },
      proxyList,
    };

    return serp.search(options)
      .then(num => num.should.to.be.an("number").to.equal(0))
      .catch(error => error.should.not.be.null);
  });


  it("Should return 12 links with a specific host and extra parameters", function test() {
    this.timeout(20000);
    const options = {
      host: "google.be",
      num: 12,
      qs: {
        q: "test",
        pws: 0,
        lr: "lang_fr",
        cr: "BE",
      },
      proxyList,
    };

    return serp.search(options)
      .then(links => links.should.to.have.lengthOf(12))
      .catch(error => error.should.not.be.null);
  });

  it("Should return 15 links with delay between each requests", function test() {
    this.timeout(60000);
    const options = {
      host: "google.be",
      num: 15,
      delay: 5000,
      qs: {
        q: "test",
        pws: 0,
        lr: "lang_fr",
        cr: "BE",
      },
      proxyList,
    };

    return serp.search(options)
      .then(links => links.should.to.have.lengthOf(15))
      .catch(error => error.should.not.be.null);
  });
});
