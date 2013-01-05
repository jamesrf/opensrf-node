
var osrfConnectStatus = function(hash) { 
    this.hash = hash;
    this._encodehash = true;
}
osrfConnectStatus.prototype.status = function(d) {
    if(arguments.length == 1) 
        this.hash.status = d; 
    return this.hash.status; 
};
osrfConnectStatus.prototype.statusCode = function(d) {
    if(arguments.length == 1) 
        this.hash.statusCode = d; 
    return this.hash.statusCode; 
};

module.exports = osrfConnectStatus;