const {Router} = require('express')
const router = Router()

const {protect} = require('../middleware/auth')

const {createFolder, getOpenFolder,deleteFolder,updateFolder, getOpenFolderForFile} = require('../controller/folder.controller')

router.get('/open/:id', protect, getOpenFolder)
router.get('/open/file/:id', protect, getOpenFolderForFile)
router.post("/create/:id", protect, createFolder)
router.delete("/delete/:id", protect, deleteFolder)
router.put("/update/:id", protect, updateFolder)

module.exports = router


