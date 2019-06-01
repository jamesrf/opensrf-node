var osrfMessage = require('../lib/osrf_message');
var assert = require('assert');

describe('osrfMessage', function(){
    it('should create', function(){
        let msg = new osrfMessage({});
    })
    it('should only set a threadtrace if it has a single arg', function(){
        let msg = new osrfMessage({});
        msg.threadTrace("abc","def");
        assert.equal(msg.hash.threadTrace, null)
        msg.threadTrace("abc");
        assert.equal(msg.hash.threadTrace, "abc")
    })
    it('should only set a type if it has a single arg', function(){
        let msg = new osrfMessage({});
        msg.type("abc","def");
        assert.equal(msg.hash.type, null)
        msg.type ("abc");
        assert.equal(msg.hash.type, "abc")
    })
    it('should only set a payload if it has a single arg', function(){
        let msg = new osrfMessage({});
        msg.payload("abc","def");
        assert.equal(msg.hash.payload, null)
        msg.payload("abc");
        assert.equal(msg.hash.payload, "abc")
    })
    it('should only set a threadtrace if it has a single arg', function(){
        let msg = new osrfMessage({});
        msg.locale("abc","def");
        assert.equal(msg.hash.locaale, null)
        msg.locale("abc");
        assert.equal(msg.hash.locale, "abc")
    })
    it('should only set a tz if it has a single arg', function(){
        let msg = new osrfMessage({});
        let defTz = msg.hash.tz;
        msg.tz("abc","def");
        assert.equal(msg.hash.tz, defTz);
        msg.tz("abc");
        assert.equal(msg.hash.tz, "abc")
    })
    it('should only set a api_level if it has a single arg', function(){
        let msg = new osrfMessage({});
        msg.api_level("abc","def");
        assert.equal(msg.hash.api_level, null)
        msg.api_level("abc");
        assert.equal(msg.hash.api_level, "abc")
    })
    it('should serialize', function() {
        function payload(){
            this.serialize = function(){ return "foobar" }
        }
        let hash = {
            "threadTrace":1,
            "type":"foo",
            "payload":new payload(),
            "locale":"en-CA",
            "tz":"America/Vancouver",
            "api_level":"1"
        }
        let msg = new osrfMessage( hash );
        let sMsg = msg.serialize();
        hash["payload"] = hash["payload"] = "foobar";

        assert.deepEqual(sMsg, {"__c":"osrfMessage","__p":hash})
    })
})
