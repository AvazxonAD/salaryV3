const asyncHandler = require('../middleware/async')
const ErrorResponse = require('../utils/errorResponse')
const Folder = require('../models/folder.model')
const File = require('../models/file.model')
const mongoose = require('mongoose')
const Minimum = require('../models/minimum')
const Position = require('../models/position.model')
// create new file
exports.createFile = asyncHandler(async (req, res, next) => {
    const minimum = await Minimum.findOne()
    const folder = await Folder.findById(req.params.id)
    let result = []
    const {files} = req.body
    
    for(let file of files){
        if(!file.selectPosition  || !file.selectPercent || !file.selectLotin || !file.selectKril || !file.selectRank  || !file.selectRegion  || !file.selectType || !file.selectBudget){
            return next(new ErrorResponse("Sorovlar bosh qolmasligi kerak", 402))
        }
        const testLotin = await File.findOne({selectLotin : file.selectLotin, parent : folder._id })
        if(testLotin){
            return next(new ErrorResponse(`Bu malumotdan oldin foydalanilgan : ${testLotin.selectLotin}`))
        }    
        const testKril = await File.findOne({selectKril : file.selectKril, parent : folder._id})
        if(testKril){
            return next(new ErrorResponse(`Bu malumotdan oldin foydalanilgan : ${testKril.selectKril}`))
        }
    }
    for(let file of files){
        const career = await Position.findOne({name : file.selectPosition})
        const newFile = await File.create({
            selectPosition : file.selectPosition,
            selectSalary : file.selectPercent * minimum.summa, 
            selectPercent : file.selectPercent, 
            selectLotin : file.selectLotin, 
            selectKril : file.selectKril,
            selectRank : file.selectRank,  
            selectSumma : file.selectSumma,  
            selectRegion : file.selectRegion,
            selectType : file.selectType,
            selectBudget : file.selectBudget,
            parentMaster : req.user.id,
            parent : folder._id,
            career : career.career
        })
        folder.files.push(newFile._id)
        await folder.save()
        result.push(newFile)
    }
    return res.status(200).json({success : true, data : result})
})
// update file 
exports.updateFile = asyncHandler(async (req, res, next) => {
    const minimum = await Minimum.findOne()
    const file = await File.findById(req.params.id)
    if(file.selectLotin !== req.body.selectLotin && file.selectKril !== req.body.selectKril){
       const test = await  File.findOne({parent : file.parent, selectLotin : req.body.selectLotin, selectKril : req.body.selectKril})
       if(test){
        return next(new ErrorResponse(`Ushbu malumotdan foydalanilgan : ${test.selectLotin} ${test.selectKril}`))
       } 
    }
    
    file.selectLotin = req.body.selectLotin ?? file.selectLotin
    file.selectKril = req.body.selectKril ?? file.selectKril
    file.selectPosition = req.body.selectPosition ?? file.selectPosition
    file.selectPercent = req.body.selectPercent ?? file.selectPercent
    file.selectSalary = req.body.selectPercent * minimum.summa ?? file.selectPercent * minimum.summa
    file.selectRank = req.body.selectRank ?? file.selectRank
    file.selectSumma = req.body.selectSumma ?? file.selectSumma
    file.selectRegion = req.body.selectRegion ?? file.selectRegion
    file.selectType = req.body.selectType ?? file.selectType
    file.selectBudget = req.body.selectBudget ?? file.selectBudget
    await file.save()
    return res.status(200).json({success : true, data : file})    
})
// delete file 
exports.deleteFile = asyncHandler(async (req, res, next) => {
    const file = await File.findById(req.params.id)
    const folder = await Folder.findById(file.parent)
    const index = folder.files.indexOf(file._id)
    folder.files.splice(index, 1)
    await folder.save()
    await file.deleteOne()
    return res.status(200).json({ success : true, data : "Delete"})
})
// get file by id 
exports.getFileById = asyncHandler(async (req, res, next) => {
    const file = await File.findById(req.params.id)
    return res.status(200).json({success : true, data : file})
})