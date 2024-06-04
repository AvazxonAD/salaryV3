const asyncHandler = require('../middleware/async')
const ErrorResponse = require('../utils/errorResponse')
const Master = require('../models/master.model')
const Location = require('../models/location.model')
const Worker = require('../models/worker.model')
const File = require('../models/file.model')
const Folder = require('../models/folder.model.js')
// create location
exports.createLocation = asyncHandler(async (req, res, next) => {
    const {locations} = req.body
    let result = []
    if(!locations || locations.length < 1){
        return next(new ErrorResponse('Sorovlar bosh qolishi mumkin emas', 403))
    }
    for(let location of locations){
        if(!location.name){
            return next(new ErrorResponse('Sorovlar bosh qolmasligi kerak', 403))
        }
        const test = await Location.findOne({name : location.name.trim(), parent : req.user.id})
        if(test){
            return next(new ErrorResponse('Bu joylashuvda ushbu faoliyat avval kiritilgan', 403))
        }
    }
    for(let location of locations){
        const now = new Date();
        // Hozirgi yil, oy va kunni olish
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0'); // Oylarda 0 dan boshlanganligi uchun 1 qo'shamiz
        const day = String(now.getDate()).padStart(2, '0');
        const createDate = `${year}-yil/${month}-oy/${day}-kun`;

        const newLocation = await Location.create({
            name : location.name,
            parent : req.user.id,
            date : createDate
        })
        await Master.findByIdAndUpdate(req.user.id, {$push : {locations : newLocation._id}})
        result.push(newLocation)
    }
    return res.status(200).json({success : true, data : result})
})
//get all location 
exports.getAllLocation = asyncHandler(async (req, res, next) => {
    const locations = await Location.find({parent : req.user.id}).sort({name : 1})
    return res.status(200).json({success : true, data : locations})
})
// delete locations 
exports.deleteLocation = asyncHandler(async (req, res, next) => {
    const location = await Location.findByIdAndDelete(req.params.id)
    if(!location){
        return next(new ErrorResponse("Joylashuv topilmadi", 403))
    }
    const master = await Master.findByIdAndUpdate(req.user.id, {locations : req.params.id}, {$pull : {locations : req.params.id}}, {new : true})
    if(!master){
        return next(new ErrorResponse('Foydalanuvchi topilmadi', 403))
    }
    return res.status(200).json({success : true, data : "Delete"})
})
// change location's  location 
exports.changeLocations = asyncHandler ( async ( req, res, next ) => {
    // ozgartrilmoqchi bolgan joylashuvni topish 
    const location = await Location.findById (req.params.id)
    // malumotlarni olish 
    const {username, id} = req.body
    // hozirgi userni topish
    const user = await Master.findById(req.user.id)
    if(!user){
        return next(new ErrorResponse("Foydalanuvchi topilmadi server xatolik", 500))
    }
    // otkazilmoqchi bolgan userni topish 
    const changeUser = await Master.findOne({username, _id : id})
    if(!changeUser){
        return next(new ErrorResponse("Hamkor foydalanuvchi topilmadi", 403))
    }
    // location bor yoqligini tekshirish 
    const testLocation = await Location.findOne({parent : changeUser._id, name : location.name})
    if(testLocation){
        return next(new ErrorResponse("Allaqachon bu foydalanuvchida ushbu tuman rohatdan otkazilgan", 403))
    }
    // malumotlarni tekshirish 
    if ( !username || !id ) {
        return next(new ErrorResponse("Sorovlar bosh qolishi mumkin emas", 403))
    }
    // barcha locationga bogliq filelarni  olib kelish
    const files = await File.find({parentMaster : user._id, selectRegion : location.name})
    if(files.length < 1 || !files){
        return next(new ErrorResponse("Bu joylashuvga bog'liq rasmiy ischi yoq", 403))
    }
    // barcha locationga bogliq workerlarni olib kelish
    const FIOlotins = files.map(item => item.selectLotin)
    const workers = await Worker.find({parent : user._id, FIOlotin : {$in : FIOlotins}})
    if(!workers || workers.length < 1){
        return next(new ErrorResponse("Fuqarolar topilmadi server xatolik", 500))
    }
    // workerlarni  ozgartrish
    for(let i = 0; i < workers.length; i++){
        // worker parentni ozgartrish
        workers[i].parent = changeUser._id
        // yangi parentga worker id larini qoshish
        changeUser.workers.push(workers[i]._id)
        // eski parentdan worker id larini ochirish 
        user.workers.pull(workers[i]._id)
        // workerni saqlash
        await  workers[i].save()
    }
    // filelarni ozgartrish
    // yangi folder bor yoqligini tekshirish
    const testFolder = await Folder.findOne({name : location.name, parent : changeUser._id})
    if(testFolder){
        return next(new ErrorResponse("Hamkor foydalanuvchida bu bolim mavjud iltimos bolimni ochirishni yoki ozgartrishini sorang", 403))
    }
    // yangi folder yaratish kochirilayotgan parent uchun 
    const newFolder = await Folder.create({name : location.name, parent : changeUser._id, parentMaster : changeUser._id}) 
    // kochirilayotgan parentga folderni id sini qoshish
    changeUser.folders.push(newFolder._id)
    for(let i = 0; i < files.length; i++){
        // filelarni eski parentni topish 
        const parentFolder = await Folder.findById(files[i].parent)
        // eski parentdan file id larini ochirish
        parentFolder.files.pull(files[i]._id)
        // eski parentni saqlash
        await parentFolder.save()
        // file parentni ozhgartrish
        files[i].parent = newFolder._id
        // file masterParentni ozgartrish
        files[i].parentMaster = changeUser._id
        // filelarni saqlash
        await files[i].save()
        // yangi folderga ozgargan file id sini qoshish 
        newFolder.files.push(files[i]._id)
    }
    // tezroq ishlashi uchun bularni loplardan keyin saqlaymiz 
    await newFolder.save()
    await changeUser.save()
    await user.save()
    location.parent = changeUser._id
    await location.save()
    // javob qaytarish
    return res.status(200).json({success : true, data : "Muvaffiqiyatli kochirildi"})
})
// update location 
exports.updateLocation = asyncHandler(async (req, res, next) => {
    const location = await Location.findById(req.params.id)
    await Location.findByIdAndUpdate(req.params.id, {
        name : req.body.name || location.name
    }, {new : true})
    return res.status(200).json({success : true, data : "Ozgardi"})
})