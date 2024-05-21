const {Router} = require('express')
const router = Router()

const {protect} = require('../middleware/auth')

const {createPosition, getAllPosition, deletePosition} = require('../controller/position.controller')

router.get("/get", protect, getAllPosition)
router.post('/create', protect, createPosition)
router.delete('/delete/:id', protect, deletePosition)

module.exports = router
