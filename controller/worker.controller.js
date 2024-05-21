const asyncHandler = require('../middleware/async')
const ErrorResponse = require('../utils/errorResponse')
const Worker = require('../models/worker.model')
const Master = require('../models/master.model')

// create worker  
exports.createWorker = asyncHandler(async (req, res, next) => {
    const {workers} = req.body
    let result = []
    if(!workers || workers.length < 1){
        return next(new ErrorResponse("Sorovlar bosh qolmasligi kerak", 403))
    }
    for(let worker of workers){
        if(!worker.FIOlotin || !worker.FIOkril || !worker.inps || !worker.inn || !worker.plastic || !worker.dateOfEmployment || !worker.budget){
            return next(new ErrorResponse("Sorovlar bosh qolmasligi kerak", 403))
        }
        const testFIOlotin = await Worker.findOne({FIOlotin : worker.FIOlotin.trim(), parent : req.user.id})
        if(testFIOlotin){
            return next(new ErrorResponse(`Bu fuqaro oldin kiritilgan :  ${worker.FIOlotin}`, 403))
        }
        const testFIOkril = await Worker.findOne({FIOkril : worker.FIOkril.trim(), parent : req.user.id})
        if(testFIOkril){
            return next(new ErrorResponse(`Bu fuqaro oldin kiritilgan :  ${worker.FIOkril}`, 403))
        }
        const testInn = await Worker.findOne({inn : worker.inn, parent : req.user.id})
        if(testInn){
            return next(new ErrorResponse(`Bu fuqaro oldin kiritilgan : ${worker.inn}`, 403))
        }
    }
    for(let worker of workers){
        const now = new Date();
        // Hozirgi yil, oy va kunni olish
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0'); // Oylarda 0 dan boshlanganligi uchun 1 qo'shamiz
        const day = String(now.getDate()).padStart(2, '0');
        const createDate = `${year}-${month}-${day}`;

        const newWorker = await Worker.create({
            FIOlotin : worker.FIOlotin,
            FIOkril : worker.FIOkril,
            inps : worker.inps,
            inn : worker.inn,
            plastic : worker.plastic,
            dateOfEmployment : worker.dateOfEmployment,
            budget : worker.budget,
            parent : req.user.id,
            date : createDate
        })
        result.push(newWorker)
        await Master.findByIdAndUpdate(req.user.id, {$push : {workers : newWorker._id}}, {new : true})
    }
    return res.status(200).json({success : true, data : result})
})
// get all workers 
exports.getAllWorker = asyncHandler(async (req, res, next) => {
    const workers = await Worker.find({parent : req.user.id})
    return res.status(200).json({success : true, data : workers})
})
// delete worker 
exports.deleteWorker = asyncHandler(async (req, res, next) => {
    const worker = await Worker.findByIdAndDelete(req.params.id)
    if(!worker){
        return next(new ErrorResponse("Fuqaro topilmadi", 403))
    }
    const worker2 = await Master.findByIdAndUpdate(req.user.id, {workers : req.params.id}, {$pull : {workers : req.params.id}}, {new : true})
    if(!worker2){
        return next(new ErrorResponse("Fuqaro topilmadi", 403))
    }
    return res.status(200).json({success : true, data : "Delete"})
})
// update worker 
exports.updateWorker = asyncHandler(async (req, res, next) => {
    const worker = await Worker.findById(req.params.id)
    if(req.body.FIOlotin){
        if(worker.FIOlotin !== req.body.FIOlotin.trim()){
            const testLotin = await Worker.findOne({FIOlotin : req.body.FIOlotin.trim(), parent : req.user.id})
            if(testLotin){
                return next(new ErrorResponse(`Bu malumotdan oldin foydalangansiz ism familya sharif : ${req.body.FIOlotin}`))
            }
        }
    }
    if(req.body.FIOkril){
        if(worker.FIOkril !== req.body.FIOkril.trim()){
            const testKril = await Worker.findOne({FIOkril : req.body.FIOkril.trim(), parent : req.user.id})
            if(testKril){
                return next(new ErrorResponse(`Bu malumotdan oldin foydalangansiz ism familya sharifi : ${req.body.FIOkril}`))
            }
        }
    }
    if(req.body.inn){
        if(worker.inn !== req.body.inn){
            const testInn = await Worker.findOne({inn : req.body.inn, parent : req.user.id})
            if(testInn){
                return next(new ErrorResponse(`Bu malumotdan oldin foydalangansiz inn raqami  : ${req.body.inn}`))
            }
        }
    }
    worker.FIOlotin = req.body.FIOlotin || worker.FIOlotin
    worker.FIOkril = req.body.FIOkril || worker.FIOkril
    worker.inps = req.body.inps ||  worker.inps,
    worker.inn = req.body.inn   || worker.inn,
    worker.plastic = req.body.plastic|| worker.plastic,
    worker.dateOfEmployment = req.body.dateOfEmployment||  worker.dateOfEmployment,
    worker.budget = req.body.budget || worker.budget
    await worker.save()
    return res.status(200).json({success : true, data : worker})
})
// worker get by id 
exports.getWorkerById = asyncHandler(async (req, res, next) => {
    const worker = await Worker.findById(req.params.id)
    if(!worker){
        return next(new ErrorResponse("Server xatolik", 403))
    }
    return res.status(200).json({success : true, data : worker})
})