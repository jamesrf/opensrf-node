'use strict'

function osrfResultPartialComplete (hash) {
  this.hash = hash
  this._encodehash = true
}
osrfResultPartialComplete.prototype.status = function (d) {
  if (arguments.length === 1) { this.hash.status = d }
  return this.hash.status
}
osrfResultPartialComplete.prototype.statusCode = function (d) {
  if (arguments.length === 1) { this.hash.statusCode = d }
  return this.hash.statusCode
}
osrfResultPartialComplete.prototype.content = function (d) {
  if (arguments.length === 1) { this.hash.content = d }
  return this.hash.content
}

module.exports = osrfResultPartialComplete
