const Folder = require('../models/folder.model');
const Master = require('../models/master.model');

async function pathUrl(folder) {
    let pathSegments = [];

    // Rekursiv yordamchi funksiya yaratamiz
    async function buildPath(folder) {
        if (!folder) return;

        if (folder.parent) {
            const parentFolder = await Folder.findById(folder.parent);
            await buildPath(parentFolder);
        }
        pathSegments.push(folder.name); // Folder name-ni oxiriga qo'shamiz
    }

    await buildPath(folder);

    // Natijani to'g'ri formatda qaytaramiz
    return '/' + pathSegments.join('/');
}

module.exports = pathUrl;
