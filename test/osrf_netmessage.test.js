var osrfNetMessage = require('../lib/osrf_netmessage');

var assert = require('assert');
describe('osrfNetMessage', function() {
  describe('constructor()', function() {
    it('should construct', function() {
        let o = new osrfNetMessage("to","from","thread","body","msg");
    });
  });
});