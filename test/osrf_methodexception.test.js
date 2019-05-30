var osrfMethodException = require('../lib/osrf_methodexception');

var assert = require('assert');
describe('osrfMethodException', function() {
  describe('constructor()', function() {
    it('should construct', function() {
        let o = new osrfMethodException({});
    });
  });
  describe('status()', function() {
    it('should have a status', function() {
        var o = new osrfMethodException({});
        o.status("foo");
        assert(o.hash.status, "foo");
    });
    it('should reject array status', function() {
        var o = new osrfMethodException({});
        o.status("foo");
        o.status("bar","baz");
        assert(o.hash.status, "foo");
    });
  });
  describe('statusCode()', function() {
    it('should have a statusCode', function() {
        var o = new osrfMethodException({});
        o.statusCode("foo");
        assert(o.hash.statusCode, "foo");
    });
    it('should reject array statusCode', function() {
        var o = new osrfMethodException({});
        o.statusCode("foo");
        o.statusCode("bar","baz");
        assert(o.hash.statusCode, "foo");
    });
  });
});