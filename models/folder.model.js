const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FolderSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim : true
    },
    folders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Folder'
    }],
    files: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'File'
    }],
    tables: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Table'
    }],
    parent : {
        type: mongoose.Schema.Types.ObjectId,
    },
    parentMaster : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Master"
    }
});

// Rekursiv ravishda ichidagi barcha folderlarni o'chirish
FolderSchema.methods.deleteAllSubfolders = async function () {
    const subfolderPromises = this.folders.map(async (subfolderId) => {
        const subfolder = await this.model('Folder').findById(subfolderId);
        if (subfolder) {
            await subfolder.deleteAllSubfolders();
            await subfolder.deleteAllFiles();
            await subfolder.deleteAllTables();
            await subfolder.deleteOne();
        }
    });
    await Promise.all(subfolderPromises);
};

// Asosiy folder va undagi barcha subfolderlarni o'chirish
FolderSchema.methods.deleteAllFolders = async function () {
    await this.deleteAllSubfolders();
    await this.deleteAllFiles();
    await this.deleteAllTables();
    await this.deleteOne();
};

// Fayllarni o'chirish
FolderSchema.methods.deleteAllFiles = async function () {
    const filePromises = this.files.map(async (fileId) => {
        const file = await this.model('File').findById(fileId);
        if (file) {
            await file.deleteOne();
        }
    });
    await Promise.all(filePromises);
};

// Tablelarni o'chirish
FolderSchema.methods.deleteAllTables = async function () {
    const tablePromises = this.tables.map(async (tableId) => {
        const table = await this.model('Table').findById(tableId);
        if (table) {
            await table.deleteOne();
        }
    });
    await Promise.all(tablePromises);
};

module.exports = mongoose.model('Folder', FolderSchema);
