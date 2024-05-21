const {Router} = require('express')
const router = Router()

const {protect} = require('../middleware/auth')

const {
    getAllLocations,
    workersOnLocation,
    createTable
} = require('../controller/table.controller')

router.get("/location", protect, getAllLocations)
router.get('/workers/:id', protect, workersOnLocation )
router.post('/create/:id', protect, createTable)

module.exports = router