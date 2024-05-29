const asyncHandler = require('../middleware/async')
const ErrorResponse = require('../utils/errorResponse')
const Folder = require('../models/folder.model')
const File = require('../models/file.model')
const Minimum = require('../models/minimum')
const Position = require('../models/position.model')
const Rank = require('../models/rank.model')
const Worker = require('../models/worker.model')
const Location = require('../models/location.model')

// create new file
exports.createFile = asyncHandler(async (req, res, next) => {
    const minimum = await Minimum.findOne()
    const folder = await Folder.findById(req.params.id)
    let result = []
    const {files} = req.body
    
    for(let file of files){
        if(!file.selectPosition  || !file.selectPercent || !file.selectLotin || !file.selectKril || !file.selectRank  || !file.selectRegion  || !file.type || !file.selectBudget){
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
            type : file.type,
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
    file.type = req.body.type ?? file.type
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
// change file location 
exports.changeFileLocation = asyncHandler(async (req, res, next) => {

    // req.body null emasligini tekshirish 
    if(!req.body.changeFolderName || req.body.files.length < 1){
        return next(new ErrorResponse("Sorovlar bosh qolmasligi kerak va eng kamida bitta rasmiy xodim tanlanishi kerak", 403))
    }
    // hozirgi parent folderni topish 
    const parent = await Folder.findById(req.params.id)
    if(!parent){
        return next(new ErrorResponse("Server xatolik ega bolim topilmadi", 403))
    }
    // ozgartrilmoqchi bolgan folderni topish 
    const changeParent = await Folder.findOne({name : req.body.changeFolderName, parentMaster : req.user.id})
    if(!changeParent){
        return next(new ErrorResponse("Bolim topilmadi nomini tekshiring", 404))
    }
    // parentlar bir xil emasligini tekshirish
    if(parent._id.toString() === changeParent._id.toString()){
        return next(new ErrorResponse("siz notogri bolimni tanladinggiz", 403))
    }
    // changeParent ga file id larini qoshish parent dan ochirish file parent ni ozgartrish  
    for(let id of req.body.files){

        // file parent ni ozgartrish
        const file = await File.findById(id)
        file.parent = changeParent._id
        await file.save()

        // changeParent ga file id larini qoshish 
        changeParent.files.push(file._id)
        await changeParent.save()
        
        //parent dan ochirish 
        const index = parent.files.indexOf(file._id)
        parent.files.splice(index, 1)
        await parent.save()
    }
    return res.status(200).json({success : true, data : "Ozgardi"})
})
// create info for page 
exports.createInfo = asyncHandler(async (req, res, next) => {
    // lavozimlar royhatini olish 
    const positions = await Position.find({parent : req.user.id}).sort({career : 1}).select("name percent -_id")
    // unvonlar royhatini olish 
    const ranks = await Rank.find({parent : req.user.id}).sort({name : 1}).select("-_id name summa")
    // ishchilar royhatini olib kelish 
    const workers = await Worker.find({parent : req.user.id}).sort({FIOlotin : 1}).select("-_id FIOlotin FIOkril budget")
    // joylashuvlarni olib kelish 
    const locations = await Location.find({parent : req.user.id}).sort({name : 1}).select("-_id name")
    // jabob qaytarish
    return res.status(200).json({success : true, positions, ranks, workers, locations})
}) 