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

* No Fieldmapper as of yet, meaning what you get back from your Evergreen server will be a bit zany.

* Maybe implement something to capture all req promises and auto-close the websocket when they're done

## Usage example

```javascript
var OpenSRF = require('./lib/index.js');

var opts = { host: "demo.evergreencatalog.com", port:"7682"};

// helper function to parse the flat/un-fieldmappered org tree
var parseTree = function(tree) {
  var name = tree['__p'][6];
  var children = tree['__p'][0];

  var newChildren = new Array();
  
  for (var x = 0; x <= children.length; x++){
    if(children[x]){
      newChildren[x] = parseTree(children[x]);
    } 
  }  
  if(newChildren.length > 0){
    return {"name": name, "children": newChildren};
  } else {
    return {"name": name};
  }
}
var conn = new OpenSRF.Connection(opts);
var ses = conn.NewSession("open-ils.actor");
var req = ses.request('open-ils.actor.org_tree.retrieve');

// req is a promise
req.then((t) => {
    console.dir(parseTree(t));

    // connection must be manually closed when you're done
    conn.close();
});
```
