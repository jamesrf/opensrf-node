"use strict";

var constants = require('./constants');
var osrfMessage = require('./osrf_message');
var osrfRequest = require('./osrf_request');

const EventEmitter = require('events');


function osrfSession(conn, service) {
    this.service = service;
    this.remote_id = null;
    this.locale = conn.locale || 'en-US';
    this.tz = conn.tz;
    this.last_id = 0;
    this.requests = [];
    this.onconnect = null;
    this.thread = Math.random() + '' + new Date().getTime();
    this.conn = conn;
    this.conn.cache[this.thread] = this;

    this.remote_id = null;
    this.state = constants.OSRF_APP_SESSION_DISCONNECTED;
};

osrfSession.prototype.cleanup = function() {
    delete this.conn.cache[this.thread];
};

osrfSession.prototype.send = async function(osrf_msg, args) {
    args = (args) ? args : {};

    if (!this.conn.websocketConnection) {
        await this.conn.connect();
    }
    
    var json = this.conn.osrfJSON.js2JSON({
        service : this.service,
        thread : this.thread,
        osrf_msg : [osrf_msg.serialize()]
    });
    // console.group("===> SENT");
    // console.dir(json);
    // console.groupEnd();
    this.conn.send(json);
};


osrfSession.prototype.connect = function(timeout) {
    // TODO: rewrite to use promise instead of onconnect?
    this.timeout = timeout || 5000;
    this.remote_id = null;
    
    let message = new osrfMessage({
        'threadTrace' : this.last_id++, 
        'type' : constants.OSRF_MESSAGE_TYPE_CONNECT
    });

    this.send(message, {'timeout' : this.timeout});
    return new Promise( (resolve, reject) => {
        this.onconnect = resolve;
        setTimeout(reject, this.timeout);
    })
}

osrfSession.prototype.disconnect = function(args) {

    if (this.state == constants.OSRF_APP_SESSION_CONNECTED) {
        this.send(
            new osrfMessage({
                'threadTrace' : this.last_id++,
                'type' : constants.OSRF_MESSAGE_TYPE_DISCONNECT
            })
        );
    }

    this.remote_id = null;
    this.state = constants.OSRF_APP_SESSION_DISCONNECTED;
};

osrfSession.prototype.request = function(args) {
    
    if(this.state != constants.OSRF_APP_SESSION_CONNECTED)
        this.remote_id = null;
       
    if(typeof args == 'string') { 
        var params = [];
        for(var i = 1; i < arguments.length; i++)
            params.push(arguments[i]);

        args = {
            method : args, 
            params : params
        };
    } else {
        if(typeof args == 'undefined')
            args = {};
    }

    var req = new osrfRequest(this, this.last_id++, args);
    this.requests.push(req);

    var resp = new EventEmitter();
    req.onresponse = (r) => resp.emit("response", r.recv().hash.content);
    req.onerror = (req, code, msg) => resp.emit("error", req, code, msg);
    req.onmethoderror = (req, code, msg) => resp.emit("methoderror", req, code, msg);
    req.ontransporterror = (req, code, msg) => resp.emit("transporterror", req, code, msg);
    req.oncomplete = (r) => resp.emit("complete",r);
    req.send();

    return resp;

};
osrfSession.prototype.requestPromise = function(args) {
    var emitter = this.request(args);
    var resp = [];
    return new Promise( (resolve, reject) => {
        emitter.on("response",(r) => resp.push(r))
        emitter.on("complete", () => resolve(resp))
        emitter.on("error", (r,c,m) => reject(m))
        emitter.on("methoderror", (r,c,m) => reject(m))
        emitter.on("transporterror", (r,c,m) => reject(m))
    })
}

osrfSession.prototype.findRequest = function(reqid) {
    for(var i = 0; i < this.requests.length; i++) {
        var req = this.requests[i];
        if(req.reqid == reqid)
            return req;
    }
    return null;
};

module.exports = osrfSession;





