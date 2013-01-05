var osrfContinueStatus = function(hash) { 
    this.hash = hash;
    this._encodehash = true;
}
osrfContinueStatus.prototype.status = function(d) {
    if(arguments.length == 1) 
        this.hash.status = d; 
    return this.hash.status; 
};
osrfContinueStatus.prototype.statusCode = function(d) {
    if(arguments.length == 1) 
        this.hash.statusCode = d; 
    return this.hash.statusCode; 
};

module.exports = osrfContinueStatus;