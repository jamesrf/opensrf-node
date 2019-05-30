
var osrfResult = require('../lib/osrf_result');

var assert = require('assert');
describe('osrfResult', function() {
    describe('constructor()', function() {
        it('should construct', function() {
            let o = new osrfResult({});
        });
    });
    describe('status()', function() {
        it('should have a status', function() {
            var o = new osrfResult({});
            o.status("foo");
            assert(o.hash.status, "foo");
        });
        it('should reject array status', function() {
            var o = new osrfResult({});
            o.status("foo");
            o.status("bar","baz");
            assert(o.hash.status, "foo");
        });
    });
    describe('statusCode()', function() {
        it('should have a statusCode', function() {
            var o = new osrfResult({});
            o.statusCode("foo");
            assert(o.hash.statusCode, "foo");
        });
        it('should reject array statusCode', function() {
            var o = new osrfResult({});
            o.statusCode("foo");
            o.statusCode("bar","baz");
            assert(o.hash.statusCode, "foo");
        });
    });
    describe('content()', function() {
        it('should have a content', function() {
            var o = new osrfResult({});
            o.content("foo");
            assert(o.hash.content, "foo");
        });
        it('should reject array content', function() {
            var o = new osrfResult({});
            o.content("foo");
            o.content("bar","baz");
            assert(o.hash.content, "foo");
        });
    });
});