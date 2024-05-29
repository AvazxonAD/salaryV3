const {Router} = require("express")
const router = Router()

const {protect} = require("../middleware/auth")
const {
    getAllPayment,
    createNewPayment,
    deletePayment
} = require('../controller/payment.controller')

router.get("/get", protect, getAllPayment)
router.post("/create", protect, createNewPayment)
router.delete("/delete/:id", protect, deletePayment)


module.exports = router