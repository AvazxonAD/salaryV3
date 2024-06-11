const {Router} = require('express')
const router = Router()

const {protect} = require('../middleware/auth')

const {
    createCoctav,
    getAllCoctav,
    deleteCoctav,
    updateCoctav
} = require('../controller/coctav.controller')

router.get('/get', protect, getAllCoctav)
router.post('/create', protect,  createCoctav)
router.delete('/delete/:id', protect, deleteCoctav)
router.put("/update/:id", protect, updateCoctav)

module.exports = router

