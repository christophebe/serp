var assert = require("assert");
var serp   = require("../index.js");


describe('test Search', function() {


        it('Should return 10 links with a minimal option set', function(done) {
            var options = {
              qs : {
                q : "test"
              }
            };

            serp.search(options, function(error, links){
                  assert(! error);
                  assert(links.length===10);
                  console.log(links);
                  done();
            });

        });

        it('Should return 10 links with a specific host', function(done) {

            var options = {
              host : "google.be",
              qs : {
                q   : "crédit+hypothécaire",
                num : 20
              }
            };

            serp.search(options, function(error, links){
                  assert(! error);
                  assert(links.length === 20);
                  console.log("simple search", links);
                  done();
            });

        });

        it('Should return 10 links with a specific host and extra parameters', function(done) {
            this.timeout(100000);
            var options = {
              host : "google.be",
              qs : {
                q   : "prêt+personnel+rapide",
                num : 20,
                pws : 0,
                lr : "lang_fr"
                //,
                //cr : "BE"
              }
            };

            serp.search(options, function(error, links){
                  assert(! error);
                  assert(links.length === 20);
                  console.log(links);
                  done();
            });

        });


});
