'use strict'

var constants = require('./constants')
var jstz = require('jstz')
var WebSocket = require('ws')

var osrfSession = require('./osrf_session')
var osrfStack = require('./osrf_stack')
var osrfJSON = require('./osrf_json')
var osrfNetMessage = require('./osrf_netmessage')
var Pcrud = require('./pcrud')

var IDL = require('./idl')

function osrfConnection (hash) {
  this.tz = jstz.determine().name()
  this.locale = hash.locale || null
  this.api_level = 1
  this.timeout = 240000
  this.IDL = new IDL()
  this.osrfJSON = null

  this.cache = {}

  this.pending_messages = []

  this.host = hash.host

  this.idlHost = (hash.insecure ? 'http://' : 'https://') + this.host
  this.path = hash.insecure ? 'ws://' : 'wss://'
  this.path = this.path + this.host
  if (hash.port) {
    this.path = this.path + ':' + hash.port
  }
  this.path = this.path + constants.WEBSOCKET_URL_PATH

  this.websocketConnection = null

  this.stack = new osrfStack(this)
  this.authtoken = null

  return this
};

osrfConnection.prototype.close = function () {
  if (this.websocketConnection) { this.websocketConnection.close() }
}
osrfConnection.prototype.findSession = function (thread_trace) {
  return this.cache[thread_trace]
}

osrfConnection.prototype.connected = function () {
  return (
    this.websocketConnection.readyState == this.websocketConnection.OPEN
  )
}

osrfConnection.prototype.connect = async function () {
  // we have to wait for the IDL to load
  await this.IDL.parseIdl(this.idlHost)
  this.osrfJSON = new osrfJSON(this.IDL)

  var self = this

  this.websocketConnection = new WebSocket(this.path)

  this.websocketConnection.on('message', function (rawMsg) {
    // console.group("<=== REC'D");
    // console.dir(rawMsg.data);
    // console.groupEnd()
    try {
      var msg = self.osrfJSON.JSON2js(rawMsg)
    } catch (E) {
      console.error(
        'Error parsing JSON in WS response: ' + JSON.stringify(rawMsg))
      throw E
    }

    if (msg.transport_error) {
      // Websockets gateway returns bounced messages (e.g. for
      // requets to unavailable services) with a transport_error
      // flag set.
      console.error(
        'Websocket request failed with a transport error', msg)

      var ses = self.findSession(msg.thread)
      if (ses) {
        if (msg.osrf_msg && msg.osrf_msg[0]) {
          var req = self.findRequest(msg.osrf_msg[0].threadTrace())
          if (req) {
            var handler = req.ontransporterror || req.onerror
            if (handler) {
              handler('Service ' + ses.service + ' unavailable')
            }
          }
        }
      }
      return // No viable error handlers
    }

    self.stack.push(
      new osrfNetMessage(
        null, null, msg.thread, null, msg.osrf_msg)
    )
  })

  this.websocketConnection.on('open', function () {
    // deliver any queued messages
    var msg
    while ((msg = self.pending_messages.shift())) { self.websocketConnection.send(msg) }
  })

  /**
     * Websocket error handler.  This type of error indicates a probelem
     * with the connection.  I.e. it's not port-specific.
     * Broadcast to all ports.
     */
  this.websocketConnection.on('error', function (evt) {
    var err = 'WebSocket Error ' + evt + ' : ' + evt.error
    self.websocketConnection.close() // connection is no good; reset.
    throw new Error(err)
  })

  /**
     * Called when the websocket connection is closed.
     *
     * Once a websocket is closed, it will be re-opened the next time
     * a message delivery attempt is made.  Clean up and prepare to reconnect.
     */
  this.websocketConnection.on('close', function () {
    self.websocketConnection = null
  })
}

osrfConnection.prototype.send = function (message) {
  if (this.connected()) {
    // this.socket connection is viable.  send our message now.
    this.websocketConnection.send(message)
    return
  }

  // no viable connection. queue our outbound messages for future delivery.
  this.pending_messages.push(message)

  if (this.websocketConnection && this.websocketConnection.readyState == this.websocketConnection.CONNECTING) {
    // we are already in the middle of a setup call.
    // our queued message will be delivered after setup completes.
    return
  }

  // we have no websocket or an invalid websocket.  build a new one.
  this.connect()
}

osrfConnection.prototype.createSession = function (service) {
  return new osrfSession(this, service)
}

osrfConnection.prototype.login = async function (username, password) {
  var auth = this.createSession('open-ils.auth')
  var authToken = null
  var req = auth.request('open-ils.auth.login', { 'identifier': username, 'password': password })
  var p = await new Promise((resolve, reject) => {
    req.on('response', function (loginResp) {
      if (loginResp.textcode == 'LOGIN_FAILED') {
        reject(loginResp)
      } else {
        authToken = loginResp.payload.authtoken
      }
    })
    req.on('complete', (req) => resolve(authToken))
    req.on('error', reject)
    req.on('methoderror', reject)
    req.on('transporterror', reject)
  })

  return p
}

osrfConnection.prototype.createPcrud = function (authToken) {
  var ses = this.createSession('open-ils.pcrud')
  var pcrud = new Pcrud(ses, authToken)
  return pcrud
}

module.exports = osrfConnection
