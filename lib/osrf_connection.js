"use strict";


var constants = require('./constants');
var jstz = require('jstz');
var WebSocket = require('ws');

var osrfSession = require('./osrf_session');
var osrfStack = require('./osrf_stack');
var osrfJSON = require('./osrf_json');
var osrfNetMessage = require('./osrf_netmessage');

var IDL = require('./idl');

function osrfConnection(hash){
    this.tz = jstz.determine().name();
    this.locale = hash.locale || null;
    this.api_level = 1;

    this.IDL = new IDL();
    this.IDL.parseIdl((hash.insecure ? "http://" : "https://") + hash.host);
    
    this.osrfJSON = new osrfJSON();

    this.osrfJSON.IDL = this.IDL;
    
    this.cache = {};
    
    this.pending_messages = [];

    this.promises = [];

    this.host = hash.host;

    this.path = hash.insecure ? "ws://" : "wss://";
    this.path = this.path + this.host;
    if(hash.port){
        this.path = this.path + ":" + hash.port;
    }
    this.path = this.path + constants.WEBSOCKET_URL_PATH;

    this.websocketConnection = null;

    this.connect();
    this.stack = new osrfStack(this)


    return this;
};

osrfConnection.prototype.close = function(){
    this.websocketConnection.close();
}
osrfConnection.prototype.find_session = function(thread_trace) {
    return this.cache[thread_trace];
};


osrfConnection.prototype.connected = function() {
    return (
        this.websocketConnection.readyState == this.websocketConnection.OPEN
    );
}

osrfConnection.prototype.connect = function(){
    var self = this;

    this.websocketConnection = new WebSocket(this.path);

    this.websocketConnection.onmessage = function(rawMsg) {
        try {
            var msg = self.osrfJSON.JSON2js(rawMsg.data);
            
        } catch(E) {
            console.error(
                "Error parsing JSON in WS response: " + msg);
            throw E;
        }
    
        if (msg.transport_error) {
            // Websockets gateway returns bounced messages (e.g. for
            // requets to unavailable services) with a transport_error
            // flag set.  
            console.error(
                'Websocket request failed with a transport error', msg);
    
            var ses = self.find_session(msg.thread); 
            if (ses) {
                if (msg.osrf_msg && msg.osrf_msg[0]) {
                    var req = self.find_request(msg.osrf_msg[0].threadTrace());
                    if (req) {
                        var handler = req.ontransporterror || req.onerror;
                        if (handler) {
                            handler('Service ' + ses.service + ' unavailable');
                        }
                    }
                }
            }
            return; // No viable error handlers
        }
    
        self.stack.push(                                                        
            new osrfNetMessage(                                                
               null, null, msg.thread, null, msg.osrf_msg)                        
        ); 
    
        return;
    }

    this.websocketConnection.onopen = function() {
        // deliver any queued messages
        var msg;
        while ( (msg = self.pending_messages.shift()) )
            self.websocketConnection.send(msg);
    }

    /**
     * Websocket error handler.  This type of error indicates a probelem
     * with the connection.  I.e. it's not port-specific. 
     * Broadcast to all ports.
     */
    this.websocketConnection.onerror = function(evt) {
        var err = "WebSocket Error " + evt + ' : ' + evt.data;
        self.websocketConnection.close(); // connection is no good; reset.
        throw new Error(err); 
    }

    /**
     * Called when the websocket connection is closed.
     *
     * Once a websocket is closed, it will be re-opened the next time
     * a message delivery attempt is made.  Clean up and prepare to reconnect.
     */
    this.websocketConnection.onclose = function() {
        console.debug('closing websocket');
        self.websocketConnection = null;
    }
}



osrfConnection.prototype.send = function(message) {
    var self = this;

    if (this.connected()) {
        // this.socket connection is viable.  send our message now.
        this.websocketConnection.send(message);
        return;
    }

    // no viable connection. queue our outbound messages for future delivery.
    this.pending_messages.push(message);

    if (this.websocketConnection && this.websocketConnection.readyState == this.websocketConnection.CONNECTING) {
        // we are already in the middle of a setup call.  
        // our queued message will be delivered after setup completes.
        return;
    }

    // we have no websocket or an invalid websocket.  build a new one.
    this.connect()

}

osrfConnection.prototype.NewSession = function(service){
    return new osrfSession(this, service);
}

osrfConnection
module.exports = osrfConnection;