const {Router} = require('express')
const router = Router()

const {protect} = require('../middleware/auth')

const {
    createFolder, 
    getOpenFolder,
    deleteFolder,
    updateFolder, 
    getOpenFolderForFile,
    changeFolderLocation,
    searchFolder,
    getOpenUser,
    getBack
} = require('../controller/folder.controller')

router.get("/open/user", protect, getOpenUser)
router.get('/open/:id', protect, getOpenFolder)
router.get('/open/file/:id', protect, getOpenFolderForFile)
router.post("/create/:id", protect, createFolder)
router.delete("/delete/:id", protect, deleteFolder)
router.put("/update/:id", protect, updateFolder)
router.put("/change/:id", protect, changeFolderLocation)
router.post("/search", protect, searchFolder)
router.get("/back/:id", protect, getBack)
console.log("ozgardi")
module.exports = router


