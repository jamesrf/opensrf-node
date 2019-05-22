This program is free software; you can redistribute it and/or
modify it under the terms of the GNU General Public License
as published by the Free Software Foundation; either version 2
of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.


# OpenSRF Node

This is an OpenSRF client library for node.js.  It is based heavily on the OpenSRF Javascript libraries by Bill Erickson, but has been simplified in some areas and made more compatible with nodejs.

This runs only over websockets, I have removed the code for HTTP to simplify things.

## Todo

* Cleanup
* Tests
* Package for NPM
* ???

## Usage example

```npm install```

Then:

```javascript
var OpenSRF = require('./lib/index.js');

var opts = { host: "demo.evergreencatalog.com", port:"7682"};

var conn = new OpenSRF.Connection(opts);
var ses = conn.NewSession("open-ils.actor");
var req = ses.request('open-ils.actor.org_tree.retrieve');

// req is a promise
req.then((t) => {
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
