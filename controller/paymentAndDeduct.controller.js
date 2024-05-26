const asyncHandler = require('../middleware/async')
const ErrorResponse = require('../utils/errorResponse')
const Position = require('../models/position.model')
const Master = require('../models/master.model')
const File = require('../models/file.model')
const Location  = require('../models/location.model') 
const PaymentsAndDeducts = require('../models/paymentAndDeduct.model')
const Table = require('../models/table.model')
const Worker = require('../models/worker.model')

// get all locations 
exports.getAllLocations = asyncHandler(async (req, res, next) => {
    const locations = await Location.find({ parent: req.user.id }).sort({ name: 1 })

    return res.status(200).json({ success: true, data: locations });
});

// get all dates payment and deduct 
exports.getAlldates = asyncHandler(async (req, res, next) => {
    const location = await Location.findById(req.params.id)
    if(!location){
        return next(new ErrorResponse("Joylashuv topilmadi ", 403))
    }
    
    return res.status(200).json({success : true, data : location.datesPaymentAndDeduct})  
})

// get all payments and deduct 
exports.getAllPaymnetsAndDeducts = asyncHandler(async (req, res, next) => {
  
    const paymentsAndDeducts = await PaymentsAndDeducts.find({date : req.query.date, parent : req.params.id,  parentMaster : req.user.id}).sort({career : 1})
  
    return res.status(200).json({success : true, data : paymentsAndDeducts})  
})

// get all workers for page 
exports.getAllWorkers = asyncHandler(async (req, res, next) => {
    const location = await Location.findById(req.params.id)
    let workers = await File.find({parentMaster: req.user.id, selectRegion: location.name}).sort({career : 1})
        .select("selectLotin selectKril selectPosition parentMaster selectRank -_id")
    
    let resultArray = [];
    for (const worker of workers) {
        let workerObj = worker.toObject();
        const dateOfEmployment = await Worker.findOne({FIOlotin: worker.selectLotin, FIOkril : worker.selectKril, parent: worker.parentMaster})
            .select("-_id dateOfEmployment");
        
        workerObj.dateOfEmployment = dateOfEmployment ? dateOfEmployment.dateOfEmployment : null;
        resultArray.push(workerObj);
    }

    return res.status(200).json({success: true, data: resultArray});
});

// create payments and deduct 
exports.createPaymnetsAndDeduct = asyncHandler(async (req, res, next) => {
    const { workers } = req.body
    if(!workers || workers.length < 1 || !req.query.date){
        return next(new ErrorResponse("Sorovlar bosh qolishi mumkin emas", 403))
    }
    for(let worker of workers){
        if(!worker || !worker.FIOlotin || !worker.FIOkril || !worker.position || !worker.rank){
            return next(new ErrorResponse("Sorovlar bosh qolishi mumkin emas", 403))
        }
        
        const test = await PaymentsAndDeducts.findOne({
            FIOlotin : worker.FIOlotin,
            FIOkril : worker.FIOkril,
            date : worker.date,
        })
        if(test){
            return next(new ErrorResponse(`Bu fuqaro oylik tolovlari va ushlanmalari hisoblab bolingan : ${test.FIOlotin} ${test.FIOkril}`, 403))
        }
    }
})    
