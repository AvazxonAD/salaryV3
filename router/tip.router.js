const {Router} = require('express')
const router = Router()

const {protect} = require('../middleware/auth')

const {
    createTip,
    getAllTip,
    deleteTip,
    updateTip
} = require('../controller/tip.controller')

router.get('/get', protect, getAllTip)
router.post('/create', protect,  createTip)
router.delete('/delete/:id', protect, deleteTip)
router.put("/update/:id", protect, updateTip)

module.exports = router

