const Folder = require('../models/folder.model')
const Master = require('../models/master.model')  
async function path(folder){
    let prents = null 
    let parent = null
    
    const master = await Master.findById(folder.parent).select("name -_id")
    parent = master 
    if(!parent){
        const folder = await Folder.finById  
    }
}