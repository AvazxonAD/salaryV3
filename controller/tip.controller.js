const asyncHandler = require('../middleware/async')
const ErrorResponse = require('../utils/errorResponse')
const Master = require('../models/master.model')
const Tip = require('../models/tip.model')

// create tip
exports.createTip = asyncHandler(async (req, res, next) => {
    const { tips } = req.body
    if(!tips || tips.length < 1){
        return next(new ErrorResponse('Sorovlar bosh qolishi mumkin emas', 403))
    }
    for(let tip of tips){
        if(!tip.name){
            return next(new ErrorResponse('Sorovlar bosh qolmasligi kerak', 403))
        }
        const test = await Tip.findOne({name : tip.name.trim(), parent : req.user.id})
        if(test){
            return next(new ErrorResponse(`Bu tip avval kiritilgan: ${test.name}`, 403))
        }
    }
    for(let tip of tips){
        const now = new Date();
        // Hozirgi yil, oy va kunni olish
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0'); // Oylarda 0 dan boshlanganligi uchun 1 qo'shamiz
        const day = String(now.getDate()).padStart(2, '0');
        const createDate = `${year}-${month}-${day}`;

        await Tip.create({
            name : tip.name,
            parent : req.user.id,
            date : createDate
        })
    }
    return res.status(200).json({success : true, data : "kiritildi"})
})

//get all tip
exports.getAllTip = asyncHandler(async (req, res, next) => {
    const tips = await Tip.find({parent : req.user.id}).sort({name : 1})
    return res.status(200).json({success : true, data : tips})
})

// delete tips 
exports.deleteTip = asyncHandler(async (req, res, next) => {
    const tip = await Tip.findByIdAndDelete(req.params.id)
    if(!tip){
        return next(new ErrorResponse("tip topilmadi", 403))
    }
    return res.status(200).json({success : true, data : "Delete"})
})

// update tip 
exports.updateTip = asyncHandler(async (req, res, next) => {
    const tip = await Tip.findById(req.params.id)
    if(!req.body.name){
        return next(new ErrorResponse('sorovlar bosh qolishi mumkin emas', 403))
    }
    if(tip.name !== req.body.name){
        const test = await Tip.findOne({name: req.body.name, parent: req.user.id})
        if(test){
            return next(new ErrorResponse(`bunday nomli tip turi kiritilgan: ${test.name}`, 403))
        }
    }
    const updateTip = await Tip.findByIdAndUpdate(req.params.id, {
        name : req.body.name
    }, {new : true})
    
    return res.status(200).json({success : true, data: updateTip})
})