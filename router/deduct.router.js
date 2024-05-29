const {Router} = require('express')
const router = Router()

// himoya qilish 
const {protect} = require('../middleware/auth')
// funksiyalarni olib kelish 
const {
    getAllDeduct,
    createDeduct,
    updateDeduct,
    deleteDeduct
} = require('../controller/deduct.controller')

router.get("/get", protect, getAllDeduct)
router.post("/create", protect, createDeduct)
router.put("/update/:id", protect, updateDeduct)
router.delete("/delete/:id", protect, deleteDeduct )

module.exports = router