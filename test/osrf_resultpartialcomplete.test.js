
var osrfResultPartialComplete = require('../lib/osrf_resultpartialcomplete');

var assert = require('assert');
describe('osrfServerError', function() {
    describe('constructor()', function() {
        it('should construct', function() {
            let o = new osrfResultPartialComplete({});
        });
    });
    describe('status()', function() {
        it('should have a status', function() {
            var o = new osrfResultPartialComplete({});
            o.status("foo");
            assert(o.hash.status, "foo");
        });
        it('should reject array status', function() {
            var o = new osrfResultPartialComplete({});
            o.status("foo");
            o.status("bar","baz");
            assert(o.hash.status, "foo");
        });
    });
    describe('statusCode()', function() {
        it('should have a statusCode', function() {
            var o = new osrfResultPartialComplete({});
            o.statusCode("foo");
            assert(o.hash.statusCode, "foo");
        });
        it('should reject array statusCode', function() {
            var o = new osrfResultPartialComplete({});
            o.statusCode("foo");
            o.statusCode("bar","baz");
            assert(o.hash.statusCode, "foo");
        });
    });
    describe('content()', function() {
        it('should have a content', function() {
            var o = new osrfResultPartialComplete({});
            o.content("foo");
            assert(o.hash.content, "foo");
        });
        it('should reject array content', function() {
            var o = new osrfResultPartialComplete({});
            o.content("foo");
            o.content("bar","baz");
            assert(o.hash.content, "foo");
        });
    });
});