const Master = require('../models/master.model')
async function createAdmin(){
    const admin = await Master.findOne({adminStatus : true})
    if(!admin){
        await Master.create({
            username : "Respublika",
            password : "123",
            passwordInfo : "123",
            adminStatus : true
        })
        return;
    }
    return;
}

module.exports = createAdmin