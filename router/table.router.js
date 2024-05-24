const {Router} = require('express')
const router = Router()

const {protect} = require('../middleware/auth')

const {
    getAllLocations,
    workersOnLocation,
    createTable,
    deleteOneTable,
    getAllDateTables,
    getAllTables,
    deleteMany
} = require('../controller/table.controller')

router.get("/get/dates/location/:id", protect, getAllDateTables)
router.get("/location", protect, getAllLocations)
router.get('/workers/:id', protect, workersOnLocation )
router.post('/create/:id', protect, createTable)
router.delete("/delete/one/:id", protect, deleteOneTable)
router.get("/get/tables/:id", protect, getAllTables)
router.delete("/delete/many/:id", protect, deleteMany)

module.exports = router