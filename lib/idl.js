var rp = require('request-promise');

var _preload_fieldmapper_IDL = null;

function IDL(){
    this.classes = {}
    this.constructors = {}

    this.objectifier = function(){

    }
    this.create = function(cls, seed){
        if(this.constructors[cls]){
            return new this.constructors[cls](seed);
        }
        throw new Error(`No such IDL class ${cls}`);
    }

    this.parseIdl = async function(host){
        let options = {
            uri: host + "/IDL2js",
            timeout: 12000
        };
        let data = await rp(options);
        eval(data);

        try {
            this.classes = _preload_fieldmapper_IDL;
        } catch (E) {
            console.error('IDL (IDL2js) not found.  Is the system running?');
            return;
        }

        const mkclass = (cls, fields) => {
            
            this.classes[cls].classname = cls;

            function generator() {
                let x = function(seed) {
                    this.a = seed || [];
                    this.classname = cls;
                    this._isfieldmapper = true;
                };

                fields.forEach(function(field, idx) {
 
                    x.prototype[field.name] = function(n) {
                        if (arguments.length === 1) {
                            this.a[idx] = n;
                        }
                        return this.a[idx];
                    };

                    if (!field.label) {
                        field.label = field.name;
                    }

                    // Coerce 'aou' links to datatype org_unit for consistency.
                    if (field.datatype === 'link' && field.class === 'aou') {
                        field.datatype = 'org_unit';
                    }
    
                });
                return x;
            };
            this.constructors[cls] = generator();

            // // global class constructors required for JSON_v1.js
            // // TODO: polluting the window namespace w/ every IDL class
            // // is less than ideal.
            // window[cls] = this.constructors[cls];
        };
        Object.keys(this.classes).forEach(class_ => {
            mkclass(class_, this.classes[class_].fields);
        });

    }

    this.clone = function(source, depth) {
        if (depth === undefined) {
            depth = 100;
        }

        let result;
        if (typeof source === 'undefined' || source === null) {
            return source;

        } else if (source._isfieldmapper) {
            // same depth because we're still cloning this same object
            result = this.create(source.classname, this.clone(source.a, depth));

        } else {
            if (Array.isArray(source)) {
                result = [];
            } else if (typeof source === 'object') { // source is not null
                result = {};
            } else {
                return source; // primitive
            }

            for (const j in source) {
                if (source[j] === null || typeof source[j] === 'undefined') {
                    result[j] = source[j];
                } else if (source[j]._isfieldmapper) {
                    if (depth) {
                        result[j] = this.clone(source[j], depth - 1);
                    }
                } else {
                    result[j] = this.clone(source[j], depth);
                }
            }
        }

        return result;
    }


    // Given a field on an IDL class, returns the name of the field
    // on the linked class that acts as the selector for the linked class.
    // Returns null if no selector is found or the field is not a link.
    this.getLinkSelector = function(fmClass, field) {
        let fieldDef = this.classes[fmClass].field_map[field];

        if (fieldDef.map) {
            // For mapped fields, we want the selector field on the
            // remotely linked object instead of the directly
            // linked object.
            const linkedClass = this.classes[fieldDef.class];
            fieldDef = linkedClass.field_map[fieldDef.map];
        }

        if (fieldDef.class) {
            const classDef = this.classes[fieldDef.class];
            if (classDef.pkey) {
                return classDef.field_map[classDef.pkey].selector || null;
            }
        }
        return null;
    }
}


module.exports = IDL;
