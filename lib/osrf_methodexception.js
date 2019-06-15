'use strict'

function osrfMethodException (hash) {
  this.hash = hash
  this._encodehash = true
}
osrfMethodException.prototype.status = function (d) {
  if (arguments.length === 1) { this.hash.status = d }
  return this.hash.status
}
osrfMethodException.prototype.statusCode = function (d) {
  if (arguments.length === 1) { this.hash.statusCode = d }
  return this.hash.statusCode
}

module.exports = osrfMethodException
