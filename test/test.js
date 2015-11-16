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
                  assert(links.length==10);
                  console.log(links);
                  done();
            });

        });

        it.only('Should return 10 links with a specific host', function(done) {
            var options = {
              host : "google.be",
              qs : {
                q   : "crédit+hypothécaire",
                num : 100
              }
            };

            serp.search(options, function(error, links){
                  assert(! error);
                  //assert(links.length==10);
                  console.log(links);
                  done();
            });

        });


});
