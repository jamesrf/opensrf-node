"use strict";
var constants = require('./constants');
var osrfSession = require('./osrf_session');

function osrfStack(conn){
    this.conn = conn;
    this.queue = [];
}

// ses may be passed to us by the network handler
osrfStack.prototype.push = function(net_msg, callbacks) {
    var ses = this.conn.findSession(net_msg.thread); 
    if (!ses) return;
    ses.remote_id = net_msg.from;

    // NetMessage's from websocket connections are parsed before they get here
    var osrf_msgs = net_msg.osrf_msg;

    if (!osrf_msgs) {

        try {
            osrf_msgs = this.conn.osrfJSON.osrfJSON.JSON2js(net_msg.body);

            // // TODO: pretty sure we don't need this..
            // if (OpenSRF.Session.transport == OSRF_TRANSPORT_TYPE_WS) {
            //     // WebSocketRequests wrap the content
            //     osrf_msgs = osrf_msgs.osrf_msg;
            // }

        } catch(E) {
            log('Error parsing OpenSRF message body as JSON: ' + net_msg.body + '\n' + E);

            /** UGH
              * For unknown reasons, the Content-Type header will occasionally
              * be included in the XHR.responseText for multipart/mixed messages.
              * When this happens, strip the header and newlines from the message
              * body and re-parse.
              */
            net_msg.body = net_msg.body.replace(/^.*\n\n/, '');
            log('Cleaning up and retrying...');

            try {
                osrf_msgs = this.conn.osrfJSON.JSON2js(net_msg.body);
            } catch(E2) {
                log('Unable to clean up message, giving up: ' + net_msg.body);
                return;
            }
        }
    }

    // push the latest responses onto the end of the inbound message queue
    for(var i = 0; i < osrf_msgs.length; i++)
        this.queue.push({msg : osrf_msgs[i], ses : ses});

    // continue processing responses, oldest to newest
    while(this.queue.length) {
        var data = this.queue.shift();
        this.handleMessage(data.ses, data.msg);
    }
};


osrfStack.prototype.handleMessage = function(ses, osrf_msg) {
    var req = ses.findRequest(osrf_msg.threadTrace());
    
    var payload = osrf_msg.payload();
    var status = payload.statusCode();
    var status_text = payload.status();

    if(osrf_msg.type() == constants.OSRF_MESSAGE_TYPE_STATUS) {


        if(status == constants.OSRF_STATUS_COMPLETE) {
            if(req) {
                req.complete = true;
                if(req.oncomplete && !req.oncomplete_called) {
                    req.oncomplete_called = true;
                    return req.oncomplete(req);
                }
            }
        }

        if(status == constants.OSRF_STATUS_OK) {
            ses.state = constants.OSRF_APP_SESSION_CONNECTED;

            /* call the connect callback */
            if(ses.onconnect && !ses.onconnect_called) {
                ses.onconnect_called = true;
                return ses.onconnect();
            }
        }

        // capture all 400's and 500's as method errors
        if ((status+'').match(/^4/) || (status+'').match(/^5/)) {
            if(req && req.onmethoderror)
                return req.onmethoderror(req, status, status_text);
        }
    }

    if(osrf_msg.type() == constants.OSRF_MESSAGE_TYPE_RESULT) {
        req = ses.findRequest(osrf_msg.threadTrace());
        if(req) {
            if (status == constants.OSRF_STATUS_PARTIAL) {
                req.part_response_buffer += payload.content()
                return; // we're just collecting a big chunked payload
            } else if (status == constants.OSRF_STATUS_NOCONTENT) {
                payload.content( ses.conn.osrfJSON.JSON2js(req.part_response_buffer) );
                payload.statusCode( constants.OSRF_STATUS_OK );
                req.part_response_buffer = '';
            }
            req.response_queue.push(payload);
            if(req.onresponse) {
                return req.onresponse(req);
            }
        }
    }
};

module.exports = osrfStack;