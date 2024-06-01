const {Router} = require('express')
const router = Router()

const {protect} = require('../middleware/auth')

const {createPosition, getAllPosition, deletePosition, updatePosition} = require('../controller/position.controller')

router.get("/get", protect, getAllPosition)
router.post('/create', protect, createPosition)
router.delete('/delete/:id', protect, deletePosition)
router.put("/update/:id", protect, updatePosition)

module.exports = router
