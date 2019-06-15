const idl = require('../lib/idl');
const assert = require('assert');
const mockIDL = require('./mock_idl');

 describe('idl', function() {
     describe('constructor()', function() {
         it('should construct', function() {
             let myIDL = new idl();
         });
     });
     describe('create()', function() {
        it('should retrieve and call the constructor', function() {
            let myIDL = new idl();
            myIDL.constructors["foo"] = function(seed){ assert.equal(seed,"bar")}
            myIDL.create("foo","bar");
        });
        it('should throw if the class does not exist', function() {
            let myIDL = new idl();
            let create = () => {myIDL.create("foo","bar")}
            assert.throws(create, Error);
        });
    });
    describe("fetch IDL2js", function(){
        var myIDL = new idl();
        var aou;

        it('should retrieve the IDL2js and parse it', async function(){
            await mockIDL(myIDL);
        })
        it('should create an aou', function(){
            aou = myIDL.create("aou");
            assert.equal(aou.classname, "aou");
        })  
        it('should have setable methods', function(){
            aou.id(77);
            assert.equal(aou.id(),77);
            aou.shortname("FOO")
            assert.equal(aou.shortname(),"FOO");
        })
        it('should clone', function(){
            var cl = myIDL.clone(aou)
            assert.deepEqual(cl,aou);
        })
        it('should return null if trying to clone null', function(){
            var cl = myIDL.clone(null)
            assert.equal(cl,null);
        })
        it('should clone an more complex object', function(){
            var cl = myIDL.clone({"x":null,"y":aou})
            assert.deepEqual(cl,{"x":null,"y":aou});
        })
        it('should get the link selector', function(){
            var x = myIDL.getLinkSelector("aou","parent_ou");
            assert.equal(x,"shortname");
        })
    })
});
