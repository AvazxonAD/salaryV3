const asyncHandler = require('../middleware/async')
const ErrorResponse = require('../utils/errorResponse')
const Folder = require('../models/folder.model')
const Master = require('../models/master.model')
const File = require('../models/file.model')
//create new folder 
exports.createFolder = asyncHandler(async (req, res, next) => {
    parent = null
    const {name} = req.body
    const folder = await Folder.findById(req.params.id)
    parent = folder 
    
    if(!parent){
        const master = await  Master.findById(req.params.id)
        parent = master
        if(!parent){
            return next(new ErrorResponse("Server xatolik", 403))
        }
    }
    const test = await Folder.findOne({name : name.trim(), parent : parent._id})
    if(test){
        return next(new ErrorResponse(`Bu bolimdan bunday nomli bolim mavjud : ${test.name}`))
    }

    const newFolder = await Folder.create({name, parent : parent._id, parentMaster : req.user.id})
    parent.folders.push(newFolder._id)
    await parent.save()
    return res.status(200).json({ success : true, data : newFolder})
})
// get folder open 
exports.getOpenFolder = asyncHandler(async (req, res, next) => {
    const parent = await Folder.findById(req.params.id)
    const folders = await Folder.find({_id : {$in : parent.folders}})
    return res.status(200).json({success : true, data : folders})
})
// get open files
exports.getOpenFolderForFile = asyncHandler(async (req, res, next) => {
    const folder = await Folder.findById(req.params.id)
    const files = await File.find({_id : {$in : folder.files}}).sort({career : 1})
    return res.status(200).json({success : true, data : files})
})
// delete folder 
exports.deleteFolder = asyncHandler(async (req, res, next) => {
    const folder = await Folder.findById(req.params.id)
    parent = null
    const master = await Master.findById(folder.parent)
    parent = master
    if(!parent){
        const folderParent = await Folder.findById(folder.parent)
        parent = folderParent
        if(!parent){
            return next(new ErrorResponse("Server xatolik folder egasi topilmadi", 403))
        }
    }
    const index = parent.folders.indexOf(folder._id)
    parent.folders.splice(index, 1)
    await parent.save()

    await folder.deleteAllFolders()
    return res.status(200).json({success : true, data : "Delete"})
})
// update folder 
exports.updateFolder = asyncHandler(async (req, res, next) => {
    const folder = await Folder.findById(req.params.id)
    const {name} = req.body
    
    let parent = null 
    const master = await Master.findById(folder.parent)
    parent = master
    if(!parent){
        const folderParent = await Folder.findById(folder.parent)
        parent = folderParent
        if(!parent){
            return next(new ErrorResponse(`Bu bolimning egasi topilmadi server xatolik`, 403))
        }
    }
    if(!name){
        return next(new ErrorResponse('Sorovlar bosh qolishi mumkin emas', 403))
    } 
    if(folder.name !== name){
        const test = await Folder.findOne({name : name.trim(), parent : parent._id})
        if(test){
            return next(new ErrorResponse(`Bu bolimda bunday nomli bolim allqachon mavjud : ${test.name}`, 403))
        }
    }
    folder.name = name.trim()
    await folder.save()
    return res.status(200).json({success : true, data : folder})
})
// joy almashtrish 
exports.changeFolderLocation = asyncHandler(async (req, res, next) => {
    // name null emasligini tekshirish 
    if(!req.body.name){
        return next(new ErrorResponse("Sorovlar bosh qolishi mumkin emas", 403))
    }
    // params id null emasligini tekshirish 
    if(!req.params.id){
        return next(new ErrorResponse("id topilmadi 404 ", 404))
    }
    // kerakli ozgaruvchilar elon qilish 
    let folderParent  = null
    let changeParent = null
    // joyini ozgartrmoqchi bolgan folderni topish 
    const folder = await Folder.findById(req.params.id)
    if(!folder){
        return next(new ErrorResponse("Bolim  topilmadi server xatolik", 500))
    }
    // ega folder yoki Userni  topish
    folderParent = await Folder.findById(folder.parent)
    if(!folderParent){
        folderParent = await Master.findById(folder.parent)
        if(!folderParent){
            return next(new ErrorResponse('Ega bolim yoki user  topilmadi server xatolik', 500))
        }
    }
    // folderni qoshmoqchi bolgan folder yoki userni topish  
    changeParent = await Folder.findOne({name : req.body.name.trim(), parentMaster : req.user.id})
    if(!changeParent){
        changeParent = await Master.findOne({username : req.body.name.trim(), _id : req.user.id})
        if(!changeParent){
            return next(new ErrorResponse("Bu nomga ega bolim yoki user topilmadi nomini tekshiring", 403))
        }
    }
    // folderga qayta folder yuklashni cheklash
    if(changeParent._id.toString() === folderParent._id.toString()){
        return next(new ErrorResponse("Notog'ri bolim tanladinggiz", 404))
    }
    // ega folderdan folderni ochirish 
    const index = folderParent.folders.indexOf(folder._id)
    folderParent.folders.splice(index, 1)
    await folderParent.save()
    // joylamoqchi bolgan folder yoki userga  folderni joylash
    changeParent.folders.push(folder._id)
    await changeParent.save()
    // joyi ozgargan folderni ega folder yoki user  id sini ozgartrish 
    folder.parent = changeParent._id
    folder.save()
    return res.status(200).json({success : true, data : "Ozgardi"})
})