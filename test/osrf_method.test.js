var osrfMethod = require('../lib/osrf_method');

// function osrfMethod(hash) {
//     this.hash = hash;
//     this._encodehash = true;
// }
// osrfMethod.prototype.method = function(d) {
//     if(arguments.length == 1) 
//         this.hash.method = d; 
//     return this.hash.method; 
// };
// osrfMethod.prototype.params = function(d) {
//     if(arguments.length == 1) 
//         this.hash.params = d; 
//     return this.hash.params; 
// };
// osrfMethod.prototype.serialize = function() {
//     return {
//         "__c":"osrfMethod",
//         "__p": {
//             'method' : this.hash.method,
//             'params' : this.hash.params
//         }
//     };
// };

// module.exports = osrfMethod;