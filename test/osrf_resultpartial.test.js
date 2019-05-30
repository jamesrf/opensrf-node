
var osrfResultPartial = require('../lib/osrf_resultpartial');

var assert = require('assert');
describe('osrfResultPartial', function() {
    describe('constructor()', function() {
        it('should construct', function() {
            let o = new osrfResultPartial({});
        });
    });
    describe('status()', function() {
        it('should have a status', function() {
            var o = new osrfResultPartial({});
            o.status("foo");
            assert(o.hash.status, "foo");
        });
        it('should reject array status', function() {
            var o = new osrfResultPartial({});
            o.status("foo");
            o.status("bar","baz");
            assert(o.hash.status, "foo");
        });
    });
    describe('statusCode()', function() {
        it('should have a statusCode', function() {
            var o = new osrfResultPartial({});
            o.statusCode("foo");
            assert(o.hash.statusCode, "foo");
        });
        it('should reject array statusCode', function() {
            var o = new osrfResultPartial({});
            o.statusCode("foo");
            o.statusCode("bar","baz");
            assert(o.hash.statusCode, "foo");
        });
    });
    describe('content()', function() {
        it('should have a content', function() {
            var o = new osrfResultPartial({});
            o.content("foo");
            assert(o.hash.content, "foo");
        });
        it('should reject array content', function() {
            var o = new osrfResultPartial({});
            o.content("foo");
            o.content("bar","baz");
            assert(o.hash.content, "foo");
        });
    });
});