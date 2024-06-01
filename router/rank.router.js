const {Router} = require('express')
const router = Router()

const {protect} = require('../middleware/auth')

const {
    createRank,
    getAllRank,
    deleteRank,
    updateRank
} = require('../controller/rank.controller')

router.get('/get', protect, getAllRank)
router.post("/create", protect, createRank)
router.delete('/delete/:id', protect, deleteRank)
router.put("/update/:id", protect, updateRank)

module.exports = router

