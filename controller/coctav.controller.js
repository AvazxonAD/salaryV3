const asyncHandler = require('../middleware/async')
const ErrorResponse = require('../utils/errorResponse')
const Master = require('../models/master.model')
const Coctav = require('../models/coctav.model')

// create coctav
exports.createCoctav = asyncHandler(async (req, res, next) => {
    const { coctavs } = req.body
    if(!coctavs || coctavs.length < 1){
        return next(new ErrorResponse('Sorovlar bosh qolishi mumkin emas', 403))
    }
    for(let coctav of coctavs){
        if(!coctav.name){
            return next(new ErrorResponse('Sorovlar bosh qolmasligi kerak', 403))
        }
        const test = await Coctav.findOne({name : coctav.name.trim(), parent : req.user.id})
        if(test){
            return next(new ErrorResponse('Bu joylashuvda ushbu faoliyat avval kiritilgan', 403))
        }
    }
    for(let coctav of coctavs){
        const now = new Date();
        // Hozirgi yil, oy va kunni olish
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0'); // Oylarda 0 dan boshlanganligi uchun 1 qo'shamiz
        const day = String(now.getDate()).padStart(2, '0');
        const createDate = `${year}-${month}-${day}`;

        const newCoctav = await Coctav.create({
            name : coctav.name,
            parent : req.user.id,
            date : createDate
        })
    }
    return res.status(200).json({success : true, data : "kiritildi"})
})

//get all coctav
exports.getAllCoctav = asyncHandler(async (req, res, next) => {
    const coctavs = await Coctav.find({parent : req.user.id}).sort({name : 1})
    return res.status(200).json({success : true, data : coctavs})
})

// delete coctavs 
exports.deleteCoctav = asyncHandler(async (req, res, next) => {
    const coctav = await Coctav.findByIdAndDelete(req.params.id)
    if(!coctav){
        return next(new ErrorResponse("Joylashuv topilmadi", 403))
    }
    return res.status(200).json({success : true, data : "Delete"})
})

// update coctav 
exports.updateCoctav = asyncHandler(async (req, res, next) => {
    const coctav = await Coctav.findById(req.params.id)
    if(!req.body.name){
        return next(new ErrorResponse('sorovlar bosh qolishi mumkin emas', 403))
    }
    if(coctav.name !== req.body.name){
        const test = await Coctav.findOne({name: req.body.name, parent: req.user.id})
        if(test){
            return next(new ErrorResponse(`bunday nomli coctav turi kiritilgan: ${test.name}`, 403))
        }
    }
    await Coctav.findByIdAndUpdate(req.params.id, {
        name : req.body.name
    }, {new : true})
    
    return res.status(200).json({success : true, data: coctav})
})