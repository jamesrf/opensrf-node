/* -----------------------------------------------------------------------
 * Copyright (C) 2008  Georgia Public Library Service
 * Bill Erickson <erickson@esilibrary.com>
 *  
 * Copyright (C) 2013 James Fournie <james.fournie@gmail.com>
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * ----------------------------------------------------------------------- */

/* session states */
var OSRF_APP_SESSION_CONNECTED = 0;
var OSRF_APP_SESSION_CONNECTING = 1;
var OSRF_APP_SESSION_DISCONNECTED = 2;

/* types of transport layers */
var OSRF_TRANSPORT_TYPE_HTTP = 1;  // XHR is not relevant, replace with HTTP for node
var OSRF_TRANSPORT_TYPE_XMPP = 2;

/* message types */
var OSRF_MESSAGE_TYPE_REQUEST = 'REQUEST';
var OSRF_MESSAGE_TYPE_STATUS = 'STATUS';
var OSRF_MESSAGE_TYPE_RESULT = 'RESULT';
var OSRF_MESSAGE_TYPE_CONNECT = 'CONNECT';
var OSRF_MESSAGE_TYPE_DISCONNECT = 'DISCONNECT';

/* message statuses */
var OSRF_STATUS_CONTINUE = 100;
var OSRF_STATUS_OK = 200;
var OSRF_STATUS_ACCEPTED = 202;
var OSRF_STATUS_COMPLETE = 205;
var OSRF_STATUS_REDIRECTED = 307;
var OSRF_STATUS_BADREQUEST = 400;
var OSRF_STATUS_UNAUTHORIZED = 401;
var OSRF_STATUS_FORBIDDEN = 403;
var OSRF_STATUS_NOTFOUND = 404;
var OSRF_STATUS_NOTALLOWED = 405;
var OSRF_STATUS_TIMEOUT = 408;
var OSRF_STATUS_EXPFAILED = 417;
var OSRF_STATUS_INTERNALSERVERERROR = 500;
var OSRF_STATUS_NOTIMPLEMENTED = 501;
var OSRF_STATUS_VERSIONNOTSUPPORTED = 505;

var osrfMessage = require('./osrf_message');
var osrfMethod = require('./osrf_method');

var osrfJSON = require('./osrf_json');

var http = require('http');

var OpenSRF = {};

OpenSRF.locale = null;

/* makes cls a subclass of pcls */
OpenSRF.set_subclass = function(cls, pcls) {
    var str = cls+'.prototype = new '+pcls+'();';
    str += cls+'.prototype.constructor = '+cls+';';
    str += cls+'.baseClass = '+pcls+'.prototype.constructor;';
    str += cls+'.prototype["super"] = '+pcls+'.prototype;';
    eval(str);
};


/* general session superclass */
OpenSRF.Session = function() {
    this.remote_id = null;
    this.state = OSRF_APP_SESSION_DISCONNECTED;
};

OpenSRF.Session.transport = OSRF_TRANSPORT_TYPE_HTTP; /* default to HTTP */
OpenSRF.Session.cache = {};
OpenSRF.Session.find_session = function(thread_trace) {
    return OpenSRF.Session.cache[thread_trace];
};
OpenSRF.Session.prototype.cleanup = function() {
    delete OpenSRF.Session.cache[this.thread];
};

OpenSRF.Session.prototype.send = function(osrf_msg, args) {
    args = (args) ? args : {};
    switch(OpenSRF.Session.transport) {
        case OSRF_TRANSPORT_TYPE_HTTP:
            return this.send_http(osrf_msg, args);
        case OSRF_TRANSPORT_TYPE_XMPP:
            return this.send_xmpp(osrf_msg, args);
    }
};

OpenSRF.Session.prototype.send_http = function(osrf_msg, args) {
    args.thread = this.thread;
    args.rcpt = this.remote_id;
    args.rcpt_service = this.service;
    new OpenSRF.HTTPRequest(this.host, osrf_msg, args).send();
};

OpenSRF.Session.prototype.send_xmpp = function(osrf_msg, args) {
    alert('xmpp transport not yet implemented');
};


/* client sessions make requests */
OpenSRF.ClientSession = function(host,service) {
    this.host = host;
    this.service = service;
    this.remote_id = null;
    this.locale = OpenSRF.locale || 'en-US';
    this.last_id = 0;
    this.thread = Math.random() + '' + new Date().getTime();
    this.requests = [];
    this.onconnect = null;
    OpenSRF.Session.cache[this.thread] = this;
};
OpenSRF.set_subclass('OpenSRF.ClientSession', 'OpenSRF.Session');


OpenSRF.ClientSession.prototype.connect = function(args) {
    args = (args) ? args : {};
    this.remote_id = null;

    if(args.onconnect)
        this.onconnect = args.onconnect;

    /* if no handler is provided, make this a synchronous call */
    if(!this.onconnect) 
        this.timeout = (args.timeout) ? args.timeout : 5;

    message = new osrfMessage({
        'threadTrace' : this.reqid, 
        'type' : OSRF_MESSAGE_TYPE_CONNECT
    });

    this.send(message, {'timeout' : this.timeout});

    if(this.onconnect || this.state == OSRF_APP_SESSION_CONNECTED)
        return true;
    return false;
};

OpenSRF.ClientSession.prototype.disconnect = function(args) {
    this.send(
        new osrfMessage({
            'threadTrace' : this.reqid, 
            'type' : OSRF_MESSAGE_TYPE_DISCONNECT
        })
    );
    this.remote_id = null;
};


OpenSRF.ClientSession.prototype.request = function(args) {
    
    if(this.state != OSRF_APP_SESSION_CONNECTED)
        this.remote_id = null;
        
    if(typeof args == 'string') { 
        params = [];
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

    var req = new OpenSRF.Request(this, this.last_id++, args);
    this.requests.push(req);
    return req;
};

OpenSRF.ClientSession.prototype.find_request = function(reqid) {
    for(var i = 0; i < this.requests.length; i++) {
        var req = this.requests[i];
        if(req.reqid == reqid)
            return req;
    }
    return null;
};

OpenSRF.Request = function(session, reqid, args) {
    this.session = session;
    this.reqid = reqid;
    /* callbacks */
    this.onresponse = args.onresponse;
    this.oncomplete = args.oncomplete;
    this.onerror = args.onerror;
    this.onmethoderror = args.onmethoderror;
    this.ontransporterror = args.ontransporterror;

    this.method = args.method;
    this.params = args.params;
    this.timeout = args.timeout;
    this.response_queue = [];
    this.complete = false;
};

OpenSRF.Request.prototype.peek_last = function(timeout) {
    if(this.response_queue.length > 0) {
        var x = this.response_queue.pop();
        this.response_queue.push(x);
        return x;
    }
    return null;
};

OpenSRF.Request.prototype.peek = function(timeout) {
    if(this.response_queue.length > 0)
        return this.response_queue[0];
    return null;
};

OpenSRF.Request.prototype.recv = function(timeout) {
    if(this.response_queue.length > 0)
        return this.response_queue.shift();
    return null;
};

OpenSRF.Request.prototype.send = function() {
    method = new osrfMethod({'method':this.method, 'params':this.params});
    message = new osrfMessage({
        'threadTrace' : this.reqid, 
        'type' : OSRF_MESSAGE_TYPE_REQUEST, 
        'payload' : method, 
        'locale' : this.session.locale
    });

    this.session.send(message, {
        'timeout' : this.timeout,
        'onresponse' : this.onresponse,
        'oncomplete' : this.oncomplete,
        'onerror' : this.onerror,
        'onmethoderror' : this.onmethoderror,
        'ontransporterror' : this.ontransporterror
    });
};

OpenSRF.NetMessage = function(to, from, thread, body) {
    this.to = to;
    this.from = from;
    this.thread = thread;
    this.body = body;
};

OpenSRF.Stack = function() {
};

// global inbound message queue
OpenSRF.Stack.queue = [];

OpenSRF.Stack.push = function(net_msg, callbacks) {
    var ses = OpenSRF.Session.find_session(net_msg.thread); 
    if(!ses) return;
    ses.remote_id = net_msg.from;
    osrf_msgs = [];

    try {
        osrf_msgs = osrfJSON.JSON2js(net_msg.body);

    } catch(E) {
        console.log('Error parsing OpenSRF message body as JSON: ' + net_msg.body + '\n' + E);

        /** UGH
          * For unknown reasons, the Content-Type header will occasionally
          * be included in the XHR.responseText for multipart/mixed messages.
          * When this happens, strip the header and newlines from the message
          * body and re-parse.
          */
        net_msg.body = net_msg.body.replace(/^.*\n\n/, '');
        console.log('Cleaning up and retrying...');

        try {
            osrf_msgs = osrfJSON.JSON2js(net_msg.body);
        } catch(E2) {
            console.log('Unable to clean up message, giving up: ' + net_msg.body);
            return;
        }
    }

    // push the latest responses onto the end of the inbound message queue
    for(var i = 0; i < osrf_msgs.length; i++)
        OpenSRF.Stack.queue.push({msg : osrf_msgs[i], callbacks : callbacks, ses : ses});

    // continue processing responses, oldest to newest
    while(OpenSRF.Stack.queue.length) {
        var data = OpenSRF.Stack.queue.shift();
        OpenSRF.Stack.handle_message(data.ses, data.msg, data.callbacks);
    }
};

OpenSRF.Stack.handle_message = function(ses, osrf_msg, callbacks) {
    
    var req = null;

    if(osrf_msg.type() == OSRF_MESSAGE_TYPE_STATUS) {

        var payload = osrf_msg.payload();
        var status = payload.statusCode();
        var status_text = payload.status();

        if(status == OSRF_STATUS_COMPLETE) {
            req = ses.find_request(osrf_msg.threadTrace());
            if(req) {
                req.complete = true;
                if(callbacks.oncomplete && !req.oncomplete_called) {
                    req.oncomplete_called = true;
                    return callbacks.oncomplete(req);
                }
            }
        }

        if(status == OSRF_STATUS_OK) {
            ses.state = OSRF_APP_SESSION_CONNECTED;

            /* call the connect callback */
            if(ses.onconnect && !ses.onconnect_called) {
                ses.onconnect_called = true;
                return ses.onconnect();
            }
        }

        if(status == OSRF_STATUS_NOTFOUND || status == OSRF_STATUS_INTERNALSERVERERROR) {
            req = ses.find_request(osrf_msg.threadTrace());
            if(callbacks.onmethoderror) 
                return callbacks.onmethoderror(req, status, status_text);
        }
    }

    if(osrf_msg.type() == OSRF_MESSAGE_TYPE_RESULT) {
        req = ses.find_request(osrf_msg.threadTrace());
        if(req) {
            req.response_queue.push(osrf_msg.payload());
            if(callbacks.onresponse) 
                return callbacks.onresponse(req);
        }
    }
};

var OSRF_HTTP_HEADER_TO = 'X-OpenSRF-to';
var OSRF_HTTP_HEADER_XID = 'X-OpenSRF-xid';
var OSRF_HTTP_HEADER_FROM = 'X-OpenSRF-from';
var OSRF_HTTP_HEADER_THREAD = 'X-OpenSRF-thread';
var OSRF_HTTP_HEADER_TIMEOUT = 'X-OpenSRF-timeout';
var OSRF_HTTP_HEADER_SERVICE = 'X-OpenSRF-service';
var OSRF_HTTP_HEADER_MULTIPART = 'X-OpenSRF-multipart';
var OSRF_HTTP_TRANSLATOR = '/osrf-http-translator'; /* XXX config */
var OSRF_POST_CONTENT_TYPE = 'application/x-www-form-urlencoded';

OpenSRF.HTTPRequest = function(host, osrf_msg, args) {
  this.message = osrf_msg;
  this.args = args;

  this.http_options = {
    host: host,
    path: OSRF_HTTP_TRANSLATOR,
    method: 'POST',
    headers: {'Content-type': OSRF_POST_CONTENT_TYPE }
  };
  
  this.http_options['headers'][OSRF_HTTP_HEADER_THREAD] = args.thread;
  
  if(this.args.rcpt) {
      this.http_options['headers'][OSRF_HTTP_HEADER_TO]= this.args.rcpt;
  } else {
      this.http_options['headers'][OSRF_HTTP_HEADER_SERVICE] = this.args.rcpt_service;
  }

  var args = this.args;
  var meth_error_handler = this.method_error_handler;

  this.request = http.request(this.http_options, function(response){
    var json = '';
    response.on('data', function (chunk) {
      json += chunk;
    });

    response.on('end', function () {
    
      sender = response.headers[OSRF_HTTP_HEADER_FROM.toLowerCase()];
      thread = response.headers[OSRF_HTTP_HEADER_THREAD.toLowerCase()];
    
      stat = response.statusCode;
    
      if(stat >= 400) {
        // FIXME
        return;  //this.transport_error_handler();
      }
      OpenSRF.Stack.push(new OpenSRF.NetMessage(null, sender, thread, json), {
            onresponse : args.onresponse,
            oncomplete : args.oncomplete,
            onerror : args.onerror,
            onmethoderror : meth_error_handler
        }
      );
     });
  });


};

OpenSRF.HTTPRequest.prototype.send = function(){
    var post = 'osrf-msg=' + encodeURIComponent(osrfJSON.js2JSON([this.message.serialize()]));
    this.request.write(post);
    this.request.end();
};

OpenSRF.HTTPRequest.prototype.method_error_handler = function() {
  var xhr = this;
  return function(req, status, status_text) {
      if(xhr.args.onmethoderror) 
          xhr.args.onmethoderror(req, status, status_text);
      if(xhr.args.onerror)  
          xhr.args.onerror(xhr.message, xhr.args.rcpt || xhr.args.rcpt_service, xhr.args.thread);
  };
};

OpenSRF.HTTPRequest.prototype.transport_error_handler = function() {
  if(this.args.ontransporterror) {
      this.args.ontransporterror(this.request); // meh
  }
  if(this.args.onerror) {
      this.args.onerror(this.message, this.args.rcpt || this.args.rcpt_service, this.args.thread);
  }
};




module.exports = OpenSRF;

