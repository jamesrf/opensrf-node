'use strict'
function osrfNetMessage (to, from, thread, body, osrfMsg) {
  this.to = to
  this.from = from
  this.thread = thread
  this.body = body
  this.osrf_msg = osrfMsg
};
module.exports = osrfNetMessage
