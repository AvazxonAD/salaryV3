const Folder = require("../models/folder.model");

async function pathUrl(folder) {
    if (!folder) {
        throw new Error("Folder topilmadi", 403);
    }

    let pathArray = [folder.name];
    
    const parent = await Folder.findById(folder.parent);

    if (!parent) {
        return '/' + pathArray.reverse().join('/');
    }

    const parentPath = await pathUrl(parent);
    return parentPath + '/' + folder.name;
}

module.exports = pathUrl;
