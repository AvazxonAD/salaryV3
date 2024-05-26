const {Router} = require('express')
const router = Router()

const {protect} = require('../middleware/auth')

const {
    getAllLocations,
    getAlldates,
    getAllPaymnetsAndDeducts,
    getAllWorkers,
} = require('../controller/paymentAndDeduct.controller')

router.get("/get/location", protect, getAllLocations)
router.get("/get/dates/:id", protect, getAlldates)
router.get("/get/payments/and/deducts/:id", protect, getAllPaymnetsAndDeducts)
router.get("/get/workers/:id", protect, getAllWorkers)

module.exports = router