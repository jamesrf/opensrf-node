function Pcrud(session,authtoken){
    this.session = session;
    this.thread = session.thread;
    this.authtoken = authtoken;
}

Pcrud.prototype.begin = async function(){
    var self = this;
    return new Promise( (resolve, reject) => {
        this.session.connect().then( () => {
            var p = this.session.request("open-ils.pcrud.transaction.begin",this.authtoken);
            p.on("response", resolve);
            p.on("complete", resolve)
            p.on("error", reject)
            p.on("transporterror", reject)
            p.on("methoderror", reject)
        }).catch( reject );
    })
}
Pcrud.prototype.commit = async function(){
    var p = this.session.request("open-ils.pcrud.transaction.commit",this.authtoken);
    return new Promise( (resolve, reject) => {
        p.on("response", resolve)
        p.on("complete", resolve)
        p.on("error", reject)
        p.on("transporterror", reject)
        p.on("methoderror", reject)
    })
}

Pcrud.prototype.rollback = async function(){
    var p = this.session.request("open-ils.pcrud.transaction.rollback",this.authtoken);
    return new Promise( (resolve, reject) => {
        p.on("response", resolve);
        p.on("error", reject)
        p.on("transporterror", reject)
        p.on("methoderror", reject)
    })
}
Pcrud.prototype.create = async function(theObject){
    if(typeof theObject != "object"){
        return new Promise.reject("pcrud requires an object");
    } 
    var p = this.session.request(
        {"method":"open-ils.pcrud.create." + theObject.classname,
        "params": [this.authtoken, theObject] }
    );

    return new Promise( (resolve, reject) => {
        p.on("response", resolve);
        p.on("error", (x,m,s) => reject(s) )
        p.on("transporterror", (x,m,s) => reject(s) )
        p.on("methoderror", (x,m,s) => reject(s) )
    })

}
Pcrud.prototype.update = function(){}
Pcrud.prototype.delete = function(){}
Pcrud.prototype.search = function(){}


module.exports = Pcrud;