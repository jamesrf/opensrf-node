var osrf = require('./osrf');

var osrfMessage = function(hash) {
    this.hash = hash;
    if(!this.hash.locale)
        this.hash.locale = opensrf.locale || 'en-US';
    this._encodehash = true;
}
osrfMessage.prototype.threadTrace = function(d) { 
    if(arguments.length == 1) 
        this.hash.threadTrace = d; 
    return this.hash.threadTrace; 
};
osrfMessage.prototype.type = function(d) { 
    if(arguments.length == 1) 
        this.hash.type = d; 
    return this.hash.type; 
};
osrfMessage.prototype.payload = function(d) { 
    if(arguments.length == 1) 
        this.hash.payload = d; 
    return this.hash.payload; 
};
osrfMessage.prototype.locale = function(d) { 
    if(arguments.length == 1) 
        this.hash.locale = d; 
    return this.hash.locale; 
};
osrfMessage.prototype.serialize = function() {
    return {
        "__c":"osrfMessage",
        "__p": {
            'threadTrace' : this.hash.threadTrace,
            'type' : this.hash.type,
            'payload' : (this.hash.payload) ? this.hash.payload.serialize() : 'null',
            'locale' : this.hash.locale
        }
    };
};

module.exports = osrfMessage;