const should = require("chai").should();
const serp = require("../index.js");


describe("Test Simple Search", () => {
  it("Should return 10 links with a minimal option set", function test() {
    this.timeout(20000);
    const options = {
      qs: {
        q: "test",
      },
    };

    return serp.search(options)
      .then(links => links.should.to.have.lengthOf(10))
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
    };

    return serp.search(options)
      .then(links => links.should.to.have.lengthOf(15))
      .catch(error => error.should.not.be.null);
  });


  it("Should return 0 for number of results of a non indexed site", function test() {
    this.timeout(20000);
    const options = {
      host: "google.be",
      numberOfResults: true,
      qs: {
        q: "site:objectifxxxssq-web.be",
      },
    };

    return serp.search(options)
      .then(num => num.should.to.be.an("number").to.equal(0))
      .catch(error => error.should.not.be.null);
  });

  it("Should return a number > 0 for the number of results of an indexed site", function test() {
    this.timeout(20000);
    const options = {
      host: "google.be",
      numberOfResults: true,
      qs: {
        q: "site:lesoir.be",
        pws: 0,
        lr: "lang_fr",
        cr: "BE",
      },
    };

    return serp.search(options)
      .then(num => num.should.to.be.an("number").above(0))
      .catch(error => error.should.not.be.null);
  });
});
