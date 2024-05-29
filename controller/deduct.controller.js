const Deduct = require("../models/deduct.model")
const asyncHandler = require('../middleware/async')
const ErrorResponse = require('../utils/errorResponse')
const Master = require('../models/master.model')

// get all deduct 
exports.getAllDeduct = asyncHandler(async (req, res, next) => {
    // ushlanmalarni olish 
    const deducts = await Deduct.find({parent : req.user.id})
    // javob qaytarish
    return res.status(200).json({success : true, data : deducts})
})

// create new deduct 
exports.createDeduct = asyncHandler(async (req, res, next) => {
    //parent ni topish 
    const  parent = await Master.findById(req.user.id)
    // malumotlarni olish 
    const { deducts } = req.body
    // malumotlarni tekshirish 
    if (!deducts || deducts.length < 1){
        return next(new ErrorResponse("Sorovlar bosh qolishi mumkin emas", 403))
    }
    for (let i = 0; i < deducts.length; i++) {
        if(!deducts[i].name || !deducts[i].summa){
            return next(new ErrorResponse("Sorovlar bosh qolishi mumkin emas", 403))
        }
        // oldin kiritilmaganini tekshirish 
        const test = await Deduct.findOne({name : deducts[i].name, parent : req.user.id})
        if(test){
            return next(new ErrorResponse(`Bu ushlanma avval kiritilgan : ${test.name}`, 403))
        }
    }
    // malumotlarni kiritish 
    for(let i = 0; i < deducts.length; i++){
        const deduct = await Deduct.create({
            name : deducts[i].name,
            summa : deducts[i].summa,
            parent : parent._id
        })
        parent.deducts.push(deduct._id)
    }
    await parent.save()
    // javob qaytarish 
    return res.status(200).json({success : true, data : "Kiritildi"})
})

// update deduct 
exports.updateDeduct = asyncHandler(async (req, res, next) => {
    // malumotlarni olish 
    const {name, summa} = req.body
    // ushlamani topish 
    const deduct = await Deduct.findById(req.params.id)
    // ushlanmani yangilash 
    deduct.name = name || deduct.name
    deduct.summa = summa || deduct.summa
    // bazaga saqlash 
    await deduct.save()
    // javob qaytarish
    return res.status(200).json({success : true, data : "Ozgardi"})
})

// delete deduct 
exports.deleteDeduct = asyncHandler(async (req, res, next) => {
    // ushlanmani topish va ochirish 
    const deduct = await Deduct.findByIdAndDelete(req.params.id)
    // ushlanma egasini topish 
    const parent = await Master.findById(req.user.id)
    // parentdan deduct id ochirish 
    parent.deducts.pull(deduct._id)
    await parent.save()
    // javob qaytarish 
    return res.status(200).json({success : true, data : "Delete"}) 
})
