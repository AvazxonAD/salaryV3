const {Router} = require('express')
const router = Router()

const {protect} = require('../middleware/auth')

const {
    createLocation,
    getAllLocation,
    deleteLocation,
    changeLocations,
    updateLocation
} = require('../controller/location.controller')

router.get('/get', protect, getAllLocation)
router.post('/create', protect,  createLocation)
router.delete('/delete/:id', protect, deleteLocation)
router.put("/change/:id", protect, changeLocations)
router.put("/update/:id", protect, updateLocation)

module.exports = router

