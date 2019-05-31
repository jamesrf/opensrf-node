var osrfSession = require('../lib/osrf_session');
var constants = require('../lib/constants')
var assert = require('assert');

function mockJson(){
    this.js2JSON = function(){}
}
function mockConn(){
    this.cache = [];
    this.locale = "en-CA";
    this.send = function(){}
    this.connect = function(){}
    this.osrfJSON = new mockJson();
}

let conn = new mockConn();

function mockMsg(){
    this.serialize = function(){}
}
let msg = new mockMsg();

describe('session', function(){
    var ses;
    it('should create', function(){
        ses = new osrfSession(conn, "FOO");
        assert.equal(ses.locale, conn.locale)
        assert.equal(ses.service,"FOO")
        assert.deepEqual(ses, conn.cache[ses.thread])
        assert.equal(ses.state, constants.OSRF_APP_SESSION_DISCONNECTED)
    })
    it('should send', function(){
        ses.send(msg);
    })
    it('should connect', function(){
        ses.connect()
    })
    it('should send reqs', function(){
        var x = ses.requestPromise("foo","bar").then( () => 
            assert.ok).cach( assert.fail )
    })
})

// osrfSession.prototype.cleanup = function() {
//     delete this.conn.cache[this.thread];
// };

// osrfSession.prototype.send = async function(osrf_msg, args) {
//     args = (args) ? args : {};

//     if (!this.conn.websocketConnection) {
//         await this.conn.connect();
//     }

//     var json = this.conn.osrfJSON.js2JSON({
//         service : this.service,
//         thread : this.thread,
//         osrf_msg : [osrf_msg.serialize()]
//     });

//     this.conn.send(json);
// };



// osrfSession.prototype.connect = function(args) {
//     args = (args) ? args : {};
//     this.remote_id = null;

//     if (this.state == constants.OSRF_APP_SESSION_CONNECTED) {
//         if (args.onconnect) args.onconnect();
//         return true;
//     }

//     if(args.onconnect) {
//         this.onconnect = args.onconnect;

//     } else {
//         /* if no handler is provided, make this a synchronous call */
//         this.timeout = (args.timeout) ? args.timeout : 5;
//     }

//     message = new osrfMessage({
//         'threadTrace' : this.last_id++, 
//         'type' : constants.OSRF_MESSAGE_TYPE_CONNECT
//     });

//     this.send(message, {'timeout' : this.timeout});

//     if(this.onconnect || this.state == constants.OSRF_APP_SESSION_CONNECTED)
//         return true;

//     return false;
// };

// osrfSession.prototype.cleanup = function() {
//     delete this.conn.cache[this.thread];
// };

// osrfSession.prototype.send = async function(osrf_msg, args) {
//     args = (args) ? args : {};

//     if (!this.conn.websocketConnection) {
//         await this.conn.connect();
//     }

//     var json = this.conn.osrfJSON.js2JSON({
//         service : this.service,
//         thread : this.thread,
//         osrf_msg : [osrf_msg.serialize()]
//     });

//     this.conn.send(json);
// };


// osrfSession.prototype.disconnect = function(args) {

//     if (this.state == constants.OSRF_APP_SESSION_CONNECTED) {
//         this.send(
//             new osrfMessage({
//                 'threadTrace' : this.last_id++,
//                 'type' : constants.OSRF_MESSAGE_TYPE_DISCONNECT
//             })
//         );
//     }

//     this.remote_id = null;
//     this.state = constants.OSRF_APP_SESSION_DISCONNECTED;
// };

// osrfSession.prototype.request = function(args) {
    
//     if(this.state != constants.OSRF_APP_SESSION_CONNECTED)
//         this.remote_id = null;
        
//     if(typeof args == 'string') { 
//         var params = [];
//         for(var i = 1; i < arguments.length; i++)
//             params.push(arguments[i]);

//         args = {
//             method : args, 
//             params : params
//         };
//     } else {
//         if(typeof args == 'undefined')
//             args = {};
//     }

//     var req = new osrfRequest(this, this.last_id++, args);
//     this.requests.push(req);
//     var resp = new EventEmitter();
//     req.onresponse = (r) => resp.emit("response", r.recv().hash.content);
//     req.onerror = (req, code, msg) => resp.emit("error", req, code, msg);
//     req.onmethoderror = (req, code, msg) => resp.emit("methoderror", req, code, msg);
//     req.ontransporterror = (req, code, msg) => resp.emit("transporterror", req, code, msg);
//     req.oncomplete = (r) => resp.emit("complete",r);
//     req.send();

//     return resp;

// };

// osrfSession.prototype.findRequest = function(reqid) {
//     for(var i = 0; i < this.requests.length; i++) {
//         var req = this.requests[i];
//         if(req.reqid == reqid)
//             return req;
//     }
//     return null;
// };

// module.exports = osrfSession;





