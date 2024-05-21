const asyncHandler = require('../middleware/async')
const ErrorResponse = require('../utils/errorResponse')
const Master = require('../models/master.model')
const Position = require('../models/position.model')
const Minimum = require('../models/minimum')

// create position 
exports.createPosition = asyncHandler(async (req, res, next) => {
    const {positions} = req.body
    if(!positions || positions.length < 1){
        return next(new ErrorResponse('Sorovlar bosh qolmasligi kerak', 403))
    }
    const minimum = await Minimum.findOne()
    let result = []
    for(let position of positions){
        if(!position.name || !position.percent){
            return next(new ErrorResponse("Sorovlar bosh qolmasligi kerak", 403))
        }
        const test = await Position.findOne({name : position.name, parent : req.user.id})
        if(test){
            return next(new ErrorResponse(`Siz bu lavozimni oldin kiritgansiz : ${test.name}`, 403))
        }
    }
    for(let position of positions){
        const now = new Date();
        // Hozirgi yil, oy va kunni olish
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0'); // Oylarda 0 dan boshlanganligi uchun 1 qo'shamiz
        const day = String(now.getDate()).padStart(2, '0');
        const createDate = `${year}-${month}-${day}`;
        
        const newPosition = await Position.create({
            name : position.name,
            percent : position.percent,
            salary : position.percent * minimum.summa,
            parent : req.user.id,
            date : createDate
        })
        await Master.findByIdAndUpdate(req.user.id, {$push : {positions : newPosition._id}}, {new : true})
        result.push(newPosition)
    }
    return res.status(200).json({success : true, data : result})
})
// get all position 
exports.getAllPosition = asyncHandler(async (req, res, next) => {
    const positions = await Position.find({parent : req.user.id})
    return res.status(200).json({success : true, data : positions})
})
// delete position 
exports.deletePosition = asyncHandler(async (req, res, next) => {
    const position = await Position.findByIdAndDelete(req.params.id)
    if(!position){
        return next(new ErrorResponse("Lavozim topilmadi", 500))
    }
    const master = await Master.findByIdAndUpdate(req.user.id, {positions : req.params.id}, {$pull : {positions : req.params.id}}, {new : true})
    if(!master){
        return next(new ErrorResponse('Server xatolik', 500))
    }
    return res.status(200).json({success : true, data : "Delete"})
})

