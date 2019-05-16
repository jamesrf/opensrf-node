"use strict";

var constants = require('./constants');
var osrfMessage = require('./osrf_message');
var osrfRequest = require('./osrf_request');


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

osrfSession.prototype.send = function(osrf_msg, args) {
    args = (args) ? args : {};

    if (!this.conn.websocketConnection) {
        this.conn.connect();
    }

    var json = this.conn.osrfJSON.js2JSON({
        service : this.service,
        thread : this.thread,
        osrf_msg : [osrf_msg.serialize()]
    });

    this.conn.send(json);
};


osrfSession.prototype.connect = function(args) {
    args = (args) ? args : {};
    this.remote_id = null;

    if (this.state == constants.OSRF_APP_SESSION_CONNECTED) {
        if (args.onconnect) args.onconnect();
        return true;
    }

    if(args.onconnect) {
        this.onconnect = args.onconnect;

    } else {
        /* if no handler is provided, make this a synchronous call */
        this.timeout = (args.timeout) ? args.timeout : 5;
    }

    message = new osrfMessage({
        'threadTrace' : this.last_id++, 
        'type' : constants.OSRF_MESSAGE_TYPE_CONNECT
    });

    this.send(message, {'timeout' : this.timeout});

    if(this.onconnect || this.state == constants.OSRF_APP_SESSION_CONNECTED)
        return true;

    return false;
};


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
    req.send();
    //return req; // originally this returned the req, we'd like to return a promise instead
    var p = new Promise(function(resolve, reject){
        req.onresponse = function(r){
            let data = r.recv();
            resolve(data.hash.content);
        }
        req.onerror = reject;
        req.onmethoderror = reject;
        req.ontransporterror = reject;
    
     })
     return p;
};

osrfSession.prototype.find_request = function(reqid) {
    for(var i = 0; i < this.requests.length; i++) {
        var req = this.requests[i];
        if(req.reqid == reqid)
            return req;
    }
    return null;
};

module.exports = osrfSession;





