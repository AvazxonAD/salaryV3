const asyncHandler = require('../middleware/async')
const ErrorResponse = require('../utils/errorResponse')
const Folder = require('../models/folder.model')
const File = require('../models/file.model')
const Minimum = require('../models/minimum')
const Position = require('../models/position.model')
const Rank = require('../models/rank.model')
const Worker = require('../models/worker.model')
const Location = require('../models/location.model')
const Tip = require('../models/tip.model')
const Coctav = require('../models/coctav.model')

const pathUrl = require('../utils/path')

// create new file
exports.createFile = asyncHandler(async (req, res, next) => {
    const minimum = await Minimum.findOne()
    const folder = await Folder.findById(req.params.id)
    let result = []
    const {files} = req.body
    
    for(let file of files){
        if(!file.selectPosition  || !file.selectPercent || !file.selectSalary ||  !file.selectCoctav || !file.selectTip   || !file.selectRegion  || !file.selectStavka ){
            return next(new ErrorResponse("Sorovlar bosh qolmasligi kerak", 402))
        }
        const test = await File.findOne({selectPosition : file.Position, parent : folder._id})
        if(test){
            return next(new ErrorResponse(`Bu malumotdan oldin foydalanilgan : ${test.selectPosition}`))
        }
    }
    const now = new Date();
    
    // Hozirgi yil, oy va kunni olish
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Oylarda 0 dan boshlanganligi uchun 1 qo'shamiz
    const day = String(now.getDate()).padStart(2, '0');
    const createDate = `${year}-${month}-${day}`;

    for(let file of files){
        const newFile = await File.create({
            selectPosition : file.selectPosition,
            selectSalary : file.selectSalary, 
            selectPercent : file.selectPercent, 
            selectTip : file.selecTip, 
            selectCoctav : file.selectCoctav, 
            selectRegion : file.selectRegion,
            selectStavka: file.selectStavka,
            parentMaster : req.user.id,
            parent : folder._id,
            date : createDate
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
    
    if(!file.selectPosition  || !file.selectPercent || !file.selectSalary ||  !file.selectCoctav || !file.selectTip   || !file.selectRegion  || !file.selectStavka ){
        return next(new ErrorResponse("Sorovlar bosh qolmasligi kerak", 402))
    }

    if(file.selectPosition !== req.body.selectPosition){
       const test = await  File.findOne({parent : file.parent, selectPosition : req.body.selectPosition })
       if(test){
        return next(new ErrorResponse(`Ushbu malumotdan foydalanilgan : ${test.selectPosition} `))
       } 
    }
    
    file.selectCoctav = req.body.selectCoctav
    file.selectTip = req.body.selectTip
    file.selectPosition = req.body.selectPosition
    file.selectPercent = req.body.selectPercent
    file.selectSalary = req.body.selectPercent * minimum.summa
    file.selectRegion = req.body.selectRegion
    file.selectStavka = req.body.selectStavka

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
    if(!file){
        return next(new ErrorResponse("server xatolik shtatka topilmadi", 500))
    }
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
    const folder = await Folder.findById(req.params.id)
    const path = "/" + req.user.username + await pathUrl(folder)
    // lavozimlar royhatini olish 
    const positions = await Position.find({parent : req.user.id}).sort({career : 1}).select("name percent  salary -_id")
    // unvonlar royhatini olish 
    const tips = await Tip.find({parent : req.user.id}).sort({name : 1}).select("-_id name")
    // ishchilar royhatini olib kelish 
    const coctavs = await Coctav.find({parent : req.user.id}).sort({name : 1}).select("name -_id")
    // joylashuvlarni olib kelish 
    const locations = await Location.find({parent : req.user.id}).sort({name : 1}).select("-_id name")
    // jabob qaytarish
    return res.status(200).json({success : true, positions, tips, coctavs, locations, path})
}) 