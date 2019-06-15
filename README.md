# NodeJS OpenSRF -- OpenSRF Websockets Client
[![npm package](https://nodei.co/npm/opensrf.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/opensrf/)
[![Build Status](https://travis-ci.com/jamesrf/opensrf-node.svg?branch=master)](https://travis-ci.com/jamesrf/opensrf-node)

## Automate your Evergreen!
OpenSRF is a dense and confusing API.  This library is designed for libraries using a 3rd party hosted Evergreen instance to built tools to interact with Evergreen from the client side, such as:
- scripting things
- building simple web views
- building simple CLI applications

## NodeJS OpenSRF Library

This library is designed for client NodeJS applications to talk to Evergreen servers using OpenSRF over websockets.

It is based heavily on the OpenSRF Javascript libraries by Bill Erickson, found in the [https://git.evergreen-ils.org/OpenSRF](OpenSRF Git Repo).  The IDL component has been derived from bits of the Angular IDL service.

This client only works with websockets.  I have removed the code for other transports to simplify things.

This runs only over websockets, I have removed the code for HTTP to simplify things.

This doesn't work as as a server-side OpenSRF framework, although could be adapated to such.

## Installation

```npm install opensrf```

## Usage Examples
- [Basic Org Tree Example](#basic-org-tree-example)
- [Promises](#promises-example)

## Basic API call
The request method returns an EventEmitter which could fire the following events:
- response
- complete
- error
- methoderror
- transporterror
```javascript
var OpenSRF = require('opensrf');

var opts = { host: "demo.evergreencatalog.com", port:"7682"};

var conn = new OpenSRF.Connection(opts);
var ses = conn.createSession("open-ils.actor");

// parses the org tree and prints the shortname of each org unit
let parseTree = function(ou) {
    ou.children().forEach( function(child) {
      console.log(child.shortname());
      parseTree(child);
    });
};
// to call more complex methods use an argument object like:
// {"method":"open-ils.something", "params":[authtoken, 123, etc]}
var req = ses.request('open-ils.actor.org_tree.retrieve');

req.on("response", function(tree) {
    parseTree(t);
    conn.close(); // close the connection when you're done
});
```

## Promises Example
The requestPromise method returns a promise instead of an EventEmitter.
```javascript
//... create connection and session first, then:
var req = ses.requestPromise('open-ils.actor.org_tree.retrieve');

req.then( function(t) => {
    parseTree(t);
    conn.close();
}).catch( function(e){
  console.error(e);
});
```

## Login Example
The connection object has a convenience login method which returns a promise.

```javascript
conn.login("username","password")
  .then( function(authtoken){
     // do a request using authtoken here
     // if you only need one auth session, you can put it in conn.authtoken for conveience
  })
 .catch( (e) => {
   // handle errors
 })
```

## IDL Example
To create IDL objects, access the IDL via the OpenSRF Connection.  It will pull down and generate
The IDL from /IDL2js based on your connection hostname.
```javascript
var myAou = conn.IDL.create("aou");
myAou.shortname("FOOBAR");
myAou.name("Foobar Library");
```

## Pcrud Search Example 
The connection object also can create a handy pcrud session

```javascript
conn.login("username","password")
  .then( function(authtoken) {

    var pcrud = conn.createPcrud(authToken);
    var query = {"id":1}

    pcrud.search("aou",query)
      .then(function(result){
        // do something with the results
      }
      .catch(function(err){
        // handle errors from the pcrud method
      })
    )
 })
 .catch( (e) => {
   // handle errors from the login method
 })
```

## Pcrud Write Example 
You can also use pcrud to update records

```javascript
conn.login("username","password")
  .then( function(authtoken) {

    var pcrud = conn.createPcrud(authToken);
    var query = {"id":1}

    var commit = function(){ pcrud.commit(); conn.close(); }
    var rollback = function(){ pcrud.rollback(); conn.close(); }

    var createAou = function(){
      pcrud.create(myAou)
        .then(commit)
        .catch(rollback);
    }

    pcrud.begin()
      .then( createAou )
      .catch( rollback );
 })
 .catch( (e) => {
   // handle errors from the login method
 })
```
