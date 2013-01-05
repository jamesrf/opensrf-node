This program is free software; you can redistribute it and/or
modify it under the terms of the GNU General Public License
as published by the Free Software Foundation; either version 2
of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.


# OpenSRF Node

This is an OpenSRF client library for node.js.  It is based on the OpenSRF Javascript libraries by Bill Erickson.

There is no Fieldmapper as of yet, meaning what you get back from your Evergreen server will be a bit zany.

## Usage example

var osrf = require('opensrf');

var ses = new osrf.ClientSession('dev1.sitka.bclibraries.ca','open-ils.actor');

var req = ses.request('open-ils.actor.org_tree.retrieve');

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

req.onresponse = function(r) {
  var msg = r.recv();
  var tree = msg.hash.content;
  var n = parseTree(tree);
  console.log(JSON.stringify(n));
    
    
};

var res = req.send();


