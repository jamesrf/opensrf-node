var osrfMethod = require('../lib/osrf_method');
var assert = require('assert');

describe('osrfMethod', function(){

    it('should create', function(){
        var o = new osrfMethod({})
    })
    it('should have a method', function() {
        var o = new osrfMethod({})
        o.method("foo");
        assert(o.hash.method, "foo");
    });
    it('should reject array params', function() {
        var o = new osrfMethod({});
        o.method("foo");
        o.method("bar","baz");
        assert(o.hash.method, "foo");
    });
    it('should have a params', function() {
        var o = new osrfMethod({})
        o.params("foo");
        assert(o.hash.params, "foo");
    });
    it('should reject array params', function() {
        var o = new osrfMethod({});
        o.params("foo");
        o.params("bar","baz");
        assert(o.hash.params, "foo");
    });
    it('should serialize', function(){
        var o = new osrfMethod({});
        o.method("foo");
        o.params("bar");
        var s = o.serialize();
        assert.deepEqual(
            {"__c":"osrfMethod",
             "__p": {
                "method": "foo",
                "params": "bar"
             }
            }, s );
    })
});