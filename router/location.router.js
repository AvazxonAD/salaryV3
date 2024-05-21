const {Router} = require('express')
const router = Router()

const {protect} = require('../middleware/auth')

const {
    createLocation,
    getAllLocation,
    deleteLocation
} = require('../controller/location.controller')

router.get('/get', protect, getAllLocation)
router.post('/create', protect,  createLocation)
router.delete('/delete/:id', protect, deleteLocation)

module.exports = router

