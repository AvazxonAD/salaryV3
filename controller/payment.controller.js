const asyncHandler = require('../middleware/async')
const ErrorResponse = require('../utils/errorResponse')
const Payment = require('../models/payment.model')
const Master = require('../models/master.model')

//get all payment 
exports.getAllPayment = asyncHandler(async (req, res, next) => {
    // barcha paymentlarni topish 
    const payments =await Payment.find({parent : req.user.id})
    
    return res.status(200).json({success : true, data : payments})
})

// create payment 
exports.createNewPayment = asyncHandler(async (req, res, next) => {
    // ega userni topish 
    const parent = await Master.findById(req.user.id)
    // tekshiruv
    if(!parent){
        return next(new ErrorResponse("Foydalanuvchi topilmadi", 404))
    }
    // malumotlarni olish
    const {payments} = req.body
    // tekshiruv
    if(payments.length <1 || !payments){
        return next(new ErrorResponse("Sororvlar bosh qolmasligi kerak", 403))
    }
    for(let payment of payments){
        // sorovlar bosh emasligini tekshirish 
        if(!payment.name || !payment.summa){
            return next(new ErrorResponse("Sororvlar bosh qolmasligi kerak", 403))
        }       
        // oldin kiritilmaganini tekshirish 
        const test = await Payment.findOne({name : payment.name.trim(), parent : req.user.id})
        if(test){
            return next(new ErrorResponse(`Bu tolov turi oldin kiritilgan : ${test.name}`, 400))
        }
    }
    // malumotlarni bazaga saqlash
    for(let payment of payments){
        const newPayment = await Payment.create({
            name : payment.name,
            summa : payment.summa,
            parent : req.user.id
        })
        parent.payments.push(newPayment._id)
    }
    // bazaga malumotni saqlash
    await parent.save()
    // javob qaytarish
    return res.status(200).json({success : true, data : "Kiritildi"})
})

// update payment 
exports.updatePayment = asyncHandler(async (req, res, next) => {
    // paymentni qidirib topish 
    const payment = await Payment.findById(req.params.id)
    // paymemtni yangilash 
    payment.name = req.body.name || payment.name
    payment.summa = req.body.summa || payment.summa
    await payment.save()
    // javob qayatarish
    return res.status(200).json({success : true, data : "Ozgardi"})
})

// delete payment
exports.deletePayment = asyncHandler(async (req, res, next) => {
    // ega userni topish 
    const parent = await Master.findById(req.user.id)
    // tolovni ochirish 
    const payment = await Payment.findByIdAndDelete(req.params.id)
    // ega userdagi tolov id sini ochirish
    parent.payments.pull(payment._id) 
    await parent.save()
    return res.status(200).json({success : true, data : "Delete"})
})