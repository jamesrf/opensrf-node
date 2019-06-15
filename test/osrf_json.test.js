const osrfJson = require('../lib/osrf_json');
const idl = require('../lib/idl');

const assert = require('assert')

const mockIDL = require('./mock_idl');


describe('osrfJSON parser', function(){

    describe('constructor', function(){
        var oj = new osrfJson();
    })
    describe('jsIterate', function(){
        var oj = new osrfJson();

        it('should iterate an array', function(){
            var input = ["foo","bar","baz"];
            oj.jsIterate(input, function(c,i){
                assert.deepEqual(input[i],c[i]) //?
            })
        })
        it('should iterate an obj', function(){
            var input = {"foo":"a","bar":"b","baz":"c"};
            oj.jsIterate(input, function(c,i){
                assert.deepEqual(input[i],c[i]) //?
            })            
        })
        it('should iterate an fmobj', async function(){
            var myIDL = new idl();
            await mockIDL(myIDL);
            let oj = new osrfJson(myIDL)

            let aou = myIDL.create("aou");
            aou.shortname("FOO");
            aou.name("Foobar");

            oj.jsIterate(aou, function(c,i){
                assert.deepEqual(aou.a[i], c[i]);
            })  
          
        })
    })

    describe('decodeJS', function(){

        it('should instantiate the object', function(){
            var oj = new osrfJson();
            let a = oj.decodeJS( {"__c":"String","__p":"foobar"});
            let b = new String("foobar");
            assert.deepEqual(a,b);
        });

        it('should return null if given null', function(){
            var oj = new osrfJson();
            let a = oj.decodeJS(null);
            assert.equal(a,null);
        })
        it('should fallback onto the IDL', async function(){
            var myIDL = new idl();
            await mockIDL(myIDL);
            let oj = new osrfJson(myIDL)

            let a = myIDL.create("aou")
            let b = oj.decodeJS( {"__c":"aou","__p":a.a})
            assert.deepEqual(a, b);
        });

        it('should decode a hash', function(){
            var oj = new osrfJson();

            let h = {
                _encodehash: true,
                hash: {
                    "a":["afoo","abar"],
                    "b":["bfoo","bbar"]
                }
            }
            let a = oj.decodeJS(h)
            let b = {"_encodehash":true,"hash":{"a":["afoo","abar"],"b":["bfoo","bbar"]}}
            assert.deepEqual(a,b)
        });
    })

    describe('jsClone', function(){
        var oj = new osrfJson();

        it('should clone a null', function(){
            assert.equal(oj.jsClone(null),null);
        });
        it('should clone a non object', function(){
            assert.equal(oj.jsClone("foo"),"foo");
        });
        it('should clone an Array', function(){
            let a = ["a","b","c"];
            let z = oj.jsClone(a);
            assert.deepEqual(oj.jsClone(a),a);
        });
        it('should clone a JS Object', function(){
            let a = {"foo":"bar","baz":"qux"}
            assert.deepEqual(oj.jsClone(a),a)
        })
        it('should clone a FM Object', async function(){
            var myIDL = new idl();
            await mockIDL(myIDL);
            var oj2 = new osrfJson(myIDL);

            var aou = myIDL.create("aou");
            aou.shortname("FOOBAR");
            aouc = oj2.jsClone(aou);

            assert.deepEqual(aou,aouc);
        })

    })

    describe('encodeJS', function(){
        it('should return null if given null', function(){
            var oj = new osrfJson();
            var a = oj.encodeJS(null);
            assert.equal(a,null);
        })
        it('should return non-obj if given non-obj', function(){
            var oj = new osrfJson();
            let a = ["a","b","c"];
            var b = oj.encodeJS(a);
            assert.deepEqual(a,b);
        })
        it('should?', async function(){
            var myIDL = new idl();
            await mockIDL(myIDL);
            var oj2 = new osrfJson(myIDL);
            var aou = myIDL.create("aou");
            aou.shortname("FOO");
            aou.name("BAR");
            let result = {"__c":"aou","__p":[null,null,null,null,null,null,"BAR",null,null,"FOO"]}
            let aou2 = oj2.encodeJS(aou);
            assert.deepEqual(result,aou2);
        })
    })

})



// /* adds the class/payload wrapper objects */
// osrfJSONParser.prototype.encodeJS = function(arg) {

//     if( arg._isfieldmapper ) {
//       var newarr = [];
//       if(!arg.a) arg.a = [];
//       for( var i = 0; i < arg.a.length; i++ ) 
//           newarr[i] = this.encodeJS(arg.a[i]);

//       var a = {};
//       a[JSON_CLASS_KEY] = arg.classname;
//       a[JSON_DATA_KEY] = newarr;
//       return a;
//     }

//     var newobj;

//     if(arg.length != undefined) {
//         newobj = [];
//         for( var i = 0; i < arg.length; i++ ) 
//             newobj.push(this.encodeJS(arg[i]));
//         return newobj;
//     } 
   
//     newobj = {};
//     for( var i in arg )
//         newobj[i] = this.encodeJS(arg[i]);
//     return newobj;
// }

// module.exports = osrfJSONParser