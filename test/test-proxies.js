var assert = require("assert");
var serp   = require("../index.js");
var proxyLoader = require("simple-proxies/lib/proxyfileloader");


describe('Test Simple Search with proxy', function() {
        var proxyList = null;

        before(function(done) {
              this.timeout(100000);

              var config = proxyLoader.config().setProxyFile("./proxies.txt")
                                               .setCheckProxies(true)
                                               .setRemoveInvalidProxies(false);

              proxyLoader.loadProxyFile(config,function(error, pl){
                  if (error) {
                    done(error);
                  }
                  proxyList = pl;
                  console.log("proxies loaded");
                  done();
              });

        });

        it('Should return the number of results', function(done) {
            this.timeout(60000);
            var options = {
              host : "google.be",
              numberOfResults : true,
              qs : {
                q   : "site:lesoir.be"
              },
              proxyList : proxyList
            };

            serp.search(options, function(error, result){
                  //console.log(result);
                  done(error);
            });

        });

        it('Should return 20 links with a proxy', function(done) {
            this.timeout(60000);
            var options = {
              host : "google.be",
              num : 20,
              qs : {
                q   : "pret personnel rapide",
                lr : "lang_fr",
                cr : "BE",
                pws : "0"
              },
              proxyList : proxyList
            };

            serp.search(options, function(error, links){
                  if (error) {
                    console.log(error);
                  }
                  assert(! error);
                  assert(links.length === 20);
                  //console.log(links);

                  done();
            });

        });

});
