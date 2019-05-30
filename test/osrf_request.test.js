
var osrfRequest = require('../lib/osrf_request');


var assert = require('assert');
function mockSession(){
    this.conn = {};
    this.conn.api_level = null;

    this.send = function(msg, args){
        assert.equal(msg.payload().hash.method, "foo");
        assert.equal(msg.threadTrace(), 99);
        assert.equal(args.timeout, 100);
    }
}
let mockSes = new mockSession();

describe('osrfRequest', function() {
    describe('constructor()', function() {
        it('should construct', function() {
            let o = new osrfRequest(mockSes,1,1);
        });
    });
    describe('peekLast()', function() {
        it('should return null if queue is empty', function() {
            let o = new osrfRequest(mockSes,1,1);
            assert.equal(o.peekLast(1),null);
        });
        it('should peek values from queue', function() {
            let o = new osrfRequest(mockSes,1,1);
            o.response_queue.push("a");
            o.response_queue.push("b");
            assert.equal(o.peekLast(1),"b");
            assert.deepEqual(o.response_queue,["a","b"]);
        });
    });
    describe('peek()', function() {
        it('should return null if queue is empty', function() {
            let o = new osrfRequest(mockSes,1,1);
            assert.equal(o.peek(1),null);
        });
        it('should peek values from queue', function() {
            let o = new osrfRequest(mockSes,1,1);
            o.response_queue.push("a");
            o.response_queue.push("b");
            assert.equal(o.peek(1),"a");
        });
    });
    describe('recv()', function() {
        it('should return null if queue is empty', function() {
            let o = new osrfRequest(mockSes,1,1);
            assert.equal(o.recv(1),null);
        });
        it('should shift values from queue', function() {
            let o = new osrfRequest(mockSes,1,1);
            o.response_queue.push("a");
            o.response_queue.push("b");
            assert.equal(o.recv(1),"a");
            assert.deepEqual(o.response_queue,["b"]);

        });
    });
    describe('send()', function() {
        it('should send', function() {
            var args = {"method":"foo","timeout":100}
            let o = new osrfRequest(mockSes,99,args);
            o.send();

        });
    });
});
