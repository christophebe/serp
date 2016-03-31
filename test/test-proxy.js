var assert      = require("assert");
var proxyLoader = require("simple-proxies/lib/proxyfileloader");
var serp        = require("../index.js");


describe('Test Search with proxies', function() {

        var proxyList = null;

        before(function(done) {
              this.timeout(100000);
              proxyLoader.loadDefaultProxies(function(error, pl){
                  proxyList = pl;
                  done();
              });

        });


        it('ProxyList Test', function(done) {
            this.timeout(100000);
            var options = {
              host : "google.com",
              num : 78,
              qs : {
                q : "test",
                pws : 0,
                lr : "lang_fr"
              },
              proxyList : proxyList
            };

            serp.search(options, function(error, links){
                  if (error) {
                    console.log(error);
                    done(false);
                  }
                  //console.log("Result.nbr", links.length);
                  //console.log("Result", links);

                  assert(links.length===78);

                  done();
            });

        });

});
