let https = require('https')
let url = require('url')

var _preload_fieldmapper_IDL = null

function fetchIDL (options) {
  let u = url.parse(options.uri)

  var toptions = {
    'host': u.hostname,
    'port': u.port,
    'path': '/IDL2js',
    'timeout': options.timeout,
    'method': 'GET'
  }
  return new Promise((resolve, reject) => {
    var req = https.request(toptions, (resp) => {
      if (resp.statusCode < 200 || resp.statsCode > 299) {
        reject(new Error('Not able to retrive IDL: ' + resp.statusCode))
      }
      const body = []
      resp.on('data', (chunk) => {
        body.push(chunk)
      })
      resp.on('end', () => resolve(body.join('')))
    })
    req.on('error', (e) => reject(e))
    req.on('timeout', (e) => reject(e))
    req.end()
  })
}
function IDL () {
  this.classes = {}
  this.constructors = {}

  this.create = function (cls, seed) {
    if (this.constructors[cls]) {
      return new this.constructors[cls](seed)
    }
    throw new Error(`No such IDL class ${cls}`)
  }

  this.parseIdl = async function (host) {
    let options = {
      uri: host,
      timeout: 12000
    }

    var self = this
    return new Promise((resolve, reject) => {
      fetchIDL(options)
        .then((idlData) => {
          eval(idlData)

          self.classes = _preload_fieldmapper_IDL
          const mkclass = (cls, fields) => {
            self.classes[cls].classname = cls

            function generator () {
              let x = function (seed) {
                this.a = seed || []
                this.classname = cls
                this._isfieldmapper = true
              }

              fields.forEach(function (field, idx) {
                x.prototype[field.name] = function (n) {
                  if (arguments.length === 1) {
                    this.a[idx] = n
                  }
                  return this.a[idx]
                }

                if (!field.label) {
                  field.label = field.name
                }

                // Coerce 'aou' links to datatype org_unit for consistency.
                if (field.datatype == 'link' && field.class == 'aou') {
                  field.datatype = 'org_unit'
                }
              })

              x.prototype.pretty_json = function(){
                return fields.reduce( (h, f, i) => {
                  if(this.a[i]){
                    h[f.name] = this.a[i]
                  }
                  return h
                },{})
              }
              return x
            };
            self.constructors[cls] = generator()

          }
          Object.keys(self.classes).forEach(class_ => {
            mkclass(class_, self.classes[class_].fields)
          })
          resolve()
        })
        .catch((e) => {
          reject(e)
        })
    })
  }

  this.clone = function (source, depth) {
    if (depth == undefined) {
      depth = 100
    }

    let result
    if (typeof source == 'undefined' || source == null) {
      return source
    } else if (source._isfieldmapper) {
      // same depth because we're still cloning this same object
      result = this.create(source.classname, this.clone(source.a, depth))
    } else {
      if (Array.isArray(source)) {
        result = []
      } else if (typeof source == 'object') { // source is not null
        result = {}
      } else {
        return source // primitive
      }

      for (const j in source) {
        if (source[j] == null || typeof source[j] == 'undefined') {
          result[j] = source[j]
        } else if (source[j]._isfieldmapper) {
          if (depth) {
            result[j] = this.clone(source[j], depth - 1)
          }
        } else {
          result[j] = this.clone(source[j], depth)
        }
      }
    }

    return result
  }

  // Given a field on an IDL class, returns the name of the field
  // on the linked class that acts as the selector for the linked class.
  // Returns null if no selector is found or the field is not a link.
  this.getLinkSelector = function (fmClass, field) {
    let fieldDef = this.classes[fmClass].field_map[field]

    if (fieldDef.map) {
      // For mapped fields, we want the selector field on the
      // remotely linked object instead of the directly
      // linked object.
      const linkedClass = this.classes[fieldDef.class]
      fieldDef = linkedClass.field_map[fieldDef.map]
    }

    if (fieldDef.class) {
      const classDef = this.classes[fieldDef.class]
      if (classDef.pkey) {
        return classDef.field_map[classDef.pkey].selector || null
      }
    }
    return null
  }
}

module.exports = IDL
