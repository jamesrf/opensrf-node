# NodeJS OpenSRF -- OpenSRF Websockets Client
[![npm package](https://nodei.co/npm/opensrf.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/opensrf/)

## Automate your Evergreen!
OpenSRF is a nortoriously dense and confusing API.  This library is designed for libraries using a 3rd party hosted Evergreen instance to built tools to interact with Evergreen from the client side, such as:
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
var req = ses.request('open-ils.actor.org_tree.retrieve');

req.on("response",(t) => {
    let parseTree = (ou) => {
      ou.children().forEach( (child) => {
        console.log(child.shortname());
        parseTree(child);
      });
    };
    parseTree(t);
    conn.close();
});
```

## Promises Example
The requestPromise method returns a promise instead of an EventEmitter.
```javascript
...
var req = ses.requestPromise('open-ils.actor.org_tree.retrieve');
req.then( (t) => {
    let parseTree = (ou) => {
      ou.children().forEach( (child) => {
        console.log(child.shortname());
        parseTree(child);
      });
    };
    parseTree(t);
    conn.close();
}).catch( (e) => console.dir );
```

## Login Example
The login method also returns a promise.

```javascript
var conn = new OpenSRF.Connection(opts);
conn.login("username","password")
  .then( (authtoken) => {
     // do a request using authtoken here
     // if you only need one auth session, you can put it in conn.authtoken for conveience
  })
 .catch( (e) => {
   // handle errors
 })
```


## Pcrud Example
The login method also returns a promise.

```javascript
var conn = new OpenSRF.Connection(opts);


conn.login("username","password")
  .then( (authtoken) => {

    var pcrud = conn.createPcrud(authToken);
    pcrud.retrieve("aou",1).then(

    )
     // do a request using authtoken here
     // if you only need one auth session, you can put it in conn.authtoken for conveience
  })
 .catch( (e) => {
   // handle errors
 })
```
