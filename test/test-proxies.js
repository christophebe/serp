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

        it('Should return 0 for number of results of a non indexed site', function(done) {
            this.timeout(60000);
            var options = {
              host : "google.be",
              numberOfResults : true,
              qs : {
                q   : "site:tootofffd.be"
              },
              proxyList : proxyList
            };

            serp.search(options, function(error, result){
                  //console.log(result);
                  assert(result===0);
                  done(error);
            });

        });

        it('Should return the  number of results >0 for a indexed site', function(done) {
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
                  assert(result>0);
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
