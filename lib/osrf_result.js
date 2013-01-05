
var osrfResult = function(hash) {
    this.hash = hash;
    this._encodehash = true;
}
osrfResult.prototype.status = function(d) {
    if(arguments.length == 1) 
        this.hash.status = d; 
    return this.hash.status; 
};
osrfResult.prototype.statusCode = function(d) {
    if(arguments.length == 1) 
        this.hash.statusCode = d; 
    return this.hash.statusCode; 
};
osrfResult.prototype.content = function(d) {
    if(arguments.length == 1) 
        this.hash.content = d; 
    return this.hash.content; 
};

module.exports = osrfResult;