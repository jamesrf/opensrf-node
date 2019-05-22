var osrfMessage = require('./osrf_message');
var osrfResult = require('./osrf_result');
var osrfResultPartial = require('./osrf_resultpartial');
var osrfResultPartialComplete = require('./osrf_resultpartialcomplete');
var osrfMethodException = require('./osrf_methodexception');
var osrfServerError = require('./osrf_servererror');
var osrfConnectStatus = require('./osrf_connectstatus');
var osrfContinueStatus = require('./osrf_continuestatus');

/* turns a javascript object into a JSON string */

var JSON_CLASS_KEY    = '__c';
var JSON_DATA_KEY    = '__p';

//function JSON_version() { return 'wrapper'; }

function osrfJSONParser(idl){
    this.IDL = idl;
}

osrfJSONParser.prototype.JSON2js = function(text) {
    return this.decodeJS(JSON.parse(text));
}

osrfJSONParser.prototype.js2JSON = function(arg) {
    return JSON.stringify(this.encodeJS(arg));
}

/* iterates over object, arrays, or fieldmapper objects */
osrfJSONParser.prototype.jsIterate = function( arg, callback ) {
    if( arg && typeof arg == 'object' ) {
        if( arg.constructor == Array ) {
            for( var i = 0; i < arg.length; i++ ) 
                callback(arg, i);

        }  else if( arg.constructor == Object ) {
                for( var i in arg ) 
                    callback(arg, i);

        } else if( arg._isfieldmapper && arg.a ) {
            for( var i = 0; i < arg.a.length; i++ ) 
                callback(arg.a, i);
        }
    }
}


/* removes the class/paylod wrapper objects */
osrfJSONParser.prototype.decodeJS = function(arg) {
    let self = this;
    if(arg == null) return null;

    if( arg && typeof arg == 'object' &&
            arg.constructor == Object &&
            arg[JSON_CLASS_KEY] ) {

        try {
            arg = eval('new ' + arg[JSON_CLASS_KEY] + '(arg[JSON_DATA_KEY])');    
        } catch(E) {
            if (self.IDL)
                //arg = self.fallbackObjectifier(arg, JSON_CLASS_KEY, JSON_DATA_KEY );
                arg = self.IDL.create(arg[JSON_CLASS_KEY], arg[JSON_DATA_KEY]);

        }
    }

    if(arg._encodehash) {
        self.jsIterate( arg.hash, 
            function(o, i) {
                o[i] = self.decodeJS(o[i]);
            }
        );
    } else {
        self.jsIterate( arg, 
            function(o, i) {
                o[i] = self.decodeJS(o[i]);
            }
        );
    }

    return arg;
}


osrfJSONParser.prototype.jsClone = function(obj) {
    if( obj == null ) return null;
    if( typeof obj != 'object' ) return obj;

    var newobj;
    if (obj.constructor == Array) {
        newobj = [];
        for( var i = 0; i < obj.length; i++ ) 
            newobj[i] = this.jsClone(obj[i]);

    } else if( obj.constructor == Object ) {
        newobj = {};
        for( var i in obj )
            newobj[i] = this.jsClone(obj[i]);

    } else if( obj._isfieldmapper && obj.a ) {
        eval('newobj = new '+obj.classname + '();');
        for( var i = 0; i < obj.a.length; i++ ) 
            newobj.a[i] = this.jsClone(obj.a[i]);
    }

    return newobj;
}
    

/* adds the class/payload wrapper objects */
osrfJSONParser.prototype.encodeJS = function(arg) {
    if( arg == null ) return null;    
    if( typeof arg != 'object' ) return arg;

    if( arg._isfieldmapper ) {
      var newarr = [];
      if(!arg.a) arg.a = [];
      for( var i = 0; i < arg.a.length; i++ ) 
          newarr[i] = this.encodeJS(arg.a[i]);

      var a = {};
      a[JSON_CLASS_KEY] = arg.classname;
      a[JSON_DATA_KEY] = newarr;
      return a;
    }

    var newobj;

    if(arg.length != undefined) {
        newobj = [];
        for( var i = 0; i < arg.length; i++ ) 
            newobj.push(this.encodeJS(arg[i]));
        return newobj;
    } 
   
    newobj = {};
    for( var i in arg )
        newobj[i] = this.encodeJS(arg[i]);
    return newobj;
}

module.exports = osrfJSONParser