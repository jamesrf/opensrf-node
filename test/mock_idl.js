const nock = require('nock');
const idl = require('../lib/idl');

let aouBody = `
var _preload_fieldmapper_IDL = {aou:{name:"aou",label:"Organizational Unit",table:"actor.org_unit",pkey:"id",pkey_sequence:"actor.org_unit_id_seq",fields:[{name:"children",label:"Subordinate Organizational Units",virtual:true,type:"link",key:"parent_ou","class":"aou",reltype:"has_many",datatype:"org_unit"},{name:"billing_address",label:"Billing Address",type:"link",key:"id","class":"aoa",reltype:"has_a",datatype:"link"},{name:"holds_address",label:"Holds Receiving Address",type:"link",key:"id","class":"aoa",reltype:"has_a",datatype:"link"},{name:"id",label:"Organizational Unit ID",selector:"shortname",datatype:"org_unit"},{name:"ill_address",label:"ILL Receiving Address",type:"link",key:"id","class":"aoa",reltype:"has_a",datatype:"link"},{name:"mailing_address",label:"Mailing Address",type:"link",key:"id","class":"aoa",reltype:"has_a",datatype:"link"},{name:"name",label:"Name",i18n:true,datatype:"text"},{name:"ou_type",label:"Organizational Unit Type",type:"link",key:"id","class":"aout",reltype:"has_a",datatype:"link"},{name:"parent_ou",label:"Parent Organizational Unit",type:"link",key:"id","class":"aou",reltype:"has_a",datatype:"link"},{name:"shortname",label:"Short (Policy) Name",required:true,datatype:"text"},{name:"email",label:"Email Address",datatype:"text"},{name:"phone",label:"Phone Number",datatype:"text"},{name:"opac_visible",label:"OPAC Visible",datatype:"bool"},{name:"fiscal_calendar",label:"Fiscal Calendar",type:"link",key:"id","class":"acqfc",reltype:"has_a",datatype:"link"},{name:"users",label:"Users",virtual:true,type:"link",key:"home_ou","class":"au",reltype:"has_many",datatype:"link"},{name:"closed_dates",label:"Closed Dates",virtual:true,type:"link",key:"org_unit","class":"aoucd",reltype:"has_many",datatype:"link"},{name:"circulations",label:"Circulations",virtual:true,type:"link",key:"circ_lib","class":"circ",reltype:"has_many",datatype:"link"},{name:"settings",label:"Settings",virtual:true,type:"link",key:"org_unit","class":"aous",reltype:"has_many",datatype:"link"},{name:"addresses",label:"Addresses",virtual:true,type:"link",key:"org_unit","class":"aoa",reltype:"has_many",datatype:"link"},{name:"checkins",label:"Checkins",virtual:true,type:"link",key:"checkin_lib","class":"circ",reltype:"has_many",datatype:"link"},{name:"workstations",label:"Workstations",virtual:true,type:"link",key:"owning_lib","class":"aws",reltype:"has_many",datatype:"link"},{name:"fund_alloc_pcts",label:"Fund Allocation Percentages",virtual:true,type:"link",key:"org","class":"acqfap",reltype:"has_many",datatype:"link"},{name:"copy_location_orders",label:"Copy Location Orders",virtual:true,type:"link",key:"org","class":"acplo",reltype:"has_many",datatype:"link"},{name:"atc_prev_dests",label:"Transit Copy Prev Destinations",virtual:true,type:"link",key:"prev_dest","class":"atc",reltype:"has_many",datatype:"link"},{name:"resv_requests",label:"Reservation Requests",virtual:true,type:"link",key:"request_lib","class":"bresv",reltype:"has_many",datatype:"link"},{name:"resv_pickups",label:"Reservation Pickups",virtual:true,type:"link",key:"pickup_lib","class":"bresv",reltype:"has_many",datatype:"link"},{name:"rsrc_types",label:"Resource Types",virtual:true,type:"link",key:"owner","class":"brt",reltype:"has_many",datatype:"link"},{name:"resources",label:"Resources",virtual:true,type:"link",key:"owner","class":"brsrc",reltype:"has_many",datatype:"link"},{name:"rsrc_attrs",label:"Resource Attributes",virtual:true,type:"link",key:"owner","class":"bra",reltype:"has_many",datatype:"link"},{name:"attr_vals",label:"Attribute Values",virtual:true,type:"link",key:"owner","class":"brav",reltype:"has_many",datatype:"link"},{name:"hours_of_operation",label:"Hours of Operation",virtual:true,type:"link",key:"id","class":"aouhoo",reltype:"might_have",datatype:"link"}],permacrud:{create:{perms:['CREATE_ORG_UNIT']},retrieve:{},update:{perms:['UPDATE_ORG_UNIT']},"delete":{perms:['DELETE_ORG_UNIT']}}}};
for (var c in _preload_fieldmapper_IDL) {
    var x = _preload_fieldmapper_IDL[c]; x.field_map = {};
    var p = x.fields.length;
    for (var n in {isnew:1,ischanged:1,isdeleted:1}) {
        x.fields[p] = {name:n,virtual:true};
        p++;
    }
    for (var f in x.fields) x.field_map[x.fields[f].name] = x.fields[f];
}
`

async function mockIDL(idl){
    nock.disableNetConnect();

    let scope =  nock(/example\.com/)
        .get("/IDL2js")
        .reply(200, aouBody)

    await idl.parseIdl("https://example.com")    
}

module.exports = mockIDL