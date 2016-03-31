var assert = require("assert");
var serp   = require("../index.js");


describe('Test Simple Search', function() {


        it('Should return 10 links with a minimal option set', function(done) {
            this.timeout(4000);
            var options = {
              qs : {
                q : "test"
              }
            };

            serp.search(options, function(error, links){

                  assert(! error);
                  assert(links.length===10);

                  done();
            });

        });


        it('Should return 12 links with a specific host and extra parameters', function(done) {
            this.timeout(4000);
            var options = {
              host : "google.be",
              num : 12,
              qs : {
                q   : "test",
                pws : 0,
                lr : "lang_fr",
                cr : "BE"
              }
            };

            serp.search(options, function(error, links){
                  assert(! error);
                  assert(links.length === 12);

                  done();
            });

        });


        it('Should return 13 links with delay between each requests', function(done) {
            this.timeout(60000);
            var options = {
              delay : 2000,
              num : 13,
              qs : {
                q   : "mac os"
              }
            };

            serp.search(options, function(error, links){
                  assert(! error);
                  assert(links.length === 13);

                  done();
            });

        });


        it('Should return 40 links for multiple keyword query', function(done) {
            this.timeout(60000);
            var options = {
              delay : 2000,
              num : 13,
              qs : {
                q   : "test"
              }
            };

            serp.search(options, function(error, links){
                  assert(! error);
                  assert(links.length === 13);

                  done();
            });

        });



});
