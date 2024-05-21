const asyncHandler = require('../middleware/async')
const ErrorResponse = require('../utils/errorResponse')
const Minimum = require('../models/minimum')
const Master = require('../models/master.model')
const Position = require('../models/position.model') 
const File = require('../models/file.model') 

// get minimum 
exports.getMinimum = asyncHandler(async (req, res, next) => {
    const minimum = await Minimum.findOne()
    return res.status(200).json({success : true, data : minimum})
})
// update minimum 
exports.updateMinimum = asyncHandler(async (req, res, next) => {
    const {summa} = req.body
    if(!summa){
        return next(new ErrorResponse("Sorov bosh qoldirilishi mumkin emas", 403))
    }
    if(!req.user.admin){
        return next(new ErrorResponse("Sizga bu funksiya bajarish ruhsat etilmagan", 403))
    }
    const minimum = await Minimum.findOne()
    minimum.summa = summa
    await minimum.save()
    const positions = await Position.find()
    for(let position of positions){
        position.salary = position.percent * minimum.summa
        await position.save()
    }
    const files = await File.find()
    for(let file of files){
        file.selectSalary = file.selectPercent * minimum.summa 
        await file.save()
    }
    return res.status(200).json({success : true, data : minimum})
})