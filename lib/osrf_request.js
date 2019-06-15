'use strict'

var osrfMessage = require('./osrf_message')
var osrfMethod = require('./osrf_method')
var constants = require('./constants')

function osrfRequest (session, reqid, args) {
  this.session = session
  this.reqid = reqid

  /* callbacks */
  this.onresponse = args.onresponse
  this.oncomplete = args.oncomplete
  this.onerror = args.onerror
  this.onmethoderror = args.onmethoderror
  this.ontransporterror = args.ontransporterror

  this.method = args.method
  this.params = args.params
  this.timeout = args.timeout
  this.api_level = args.api_level || session.conn.api_level
  this.response_queue = []
  this.part_response_buffer = ''
  this.complete = false
};

osrfRequest.prototype.peekLast = function (timeout) {
  if (this.response_queue.length > 0) {
    var x = this.response_queue.pop()
    this.response_queue.push(x)
    return x
  }
  return null
}

osrfRequest.prototype.peek = function (timeout) {
  if (this.response_queue.length > 0) { return this.response_queue[0] }
  return null
}

osrfRequest.prototype.recv = function (timeout) {
  if (this.response_queue.length > 0) { return this.response_queue.shift() }
  return null
}

osrfRequest.prototype.send = function () {
  let method = new osrfMethod({ 'method': this.method, 'params': this.params })
  let message = new osrfMessage({
    'threadTrace': this.reqid,
    'type': constants.OSRF_MESSAGE_TYPE_REQUEST,
    'payload': method,
    'locale': this.session.locale,
    'tz': this.session.tz,
    'api_level': this.api_level
  })

  this.session.send(message, {
    'timeout': this.timeout,
    'onresponse': this.onresponse,
    'oncomplete': this.oncomplete,
    'onerror': this.onerror,
    'onmethoderror': this.onmethoderror,
    'ontransporterror': this.ontransporterror
  })
}

module.exports = osrfRequest
