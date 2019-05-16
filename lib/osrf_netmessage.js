"use strict";
function osrfNetMessage(to, from, thread, body, osrf_msg) {
    this.to = to;
    this.from = from;
    this.thread = thread;
    this.body = body;
    this.osrf_msg = osrf_msg;
};
module.exports = osrfNetMessage;