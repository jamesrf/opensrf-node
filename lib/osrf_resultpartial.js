'use strict'

function osrfResultPartial (hash) {
  this.hash = hash
  this._encodehash = true
}
osrfResultPartial.prototype.status = function (d) {
  if (arguments.length === 1) { this.hash.status = d }
  return this.hash.status
}
osrfResultPartial.prototype.statusCode = function (d) {
  if (arguments.length === 1) { this.hash.statusCode = d }
  return this.hash.statusCode
}
osrfResultPartial.prototype.content = function (d) {
  if (arguments.length === 1) { this.hash.content = d }
  return this.hash.content
}

module.exports = osrfResultPartial
