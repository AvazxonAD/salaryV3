const asyncHandler = require('../middleware/async')
const ErrorResponse = require('../utils/errorResponse')
const Position = require('../models/position.model')
const Master = require('../models/master.model')
const File = require('../models/file.model')
const Location  = require('../models/location.model') 
const PaymentsAndDeducts = require('../models/paymentAndDeduct.model')
const Table = require('../models/table.model')
const Worker = require('../models/worker.model'),
const Rank = require('../models/rank.model')

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
    let career = null 
    let salary = null
    let rankSumma = null
    let serviceOfYear = null 
    const location = await Location.findById(req.params.id)
    let result = []
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

    for(let worker of workers){
        let career = 0 
        let salary = 0
        let rankSumma = 0
        let yearOfService = 0
        let apartment = 0
        let fmc = 0
        let foodMoney = 0
        let dateOfEmployment = null
        
        
        
        // lavozim martabasini aniqlash 
        const position = await Position.findOne({name : worker.position, parent : req.user.id}).select("-_id career")
        career = position.career
        if(!career){
            return next(new ErrorResponse(`Lavozimni aniqlab bolmadi ${worker.FIOlotin}  ${worker.FIOkril}`, 403))
        }
        
        // qachon ishga kirganini aniqlashtrish 
        if(worker.payments.yearOfService){
            const worker = await Worker.findOne({FIOlotin : worker.FIOlotin, FIOkril : worker.FIOkril, parent : req.user.id}).select("dateOfEmployment -_id")
            dateOfEmployment = worker.dateOfEmployment
            if(!dateOfEmployment){
                return next(new ErrorResponse(`Fuqaroning ishga kirgan  kunini aniqlab bolmadi ${worker.FIOlotin}  ${worker.FIOkril}`, 403)) 
            }
        }
        
        //  TOLOVLARNI HISOBLASH 
        
        // ish haqisini hisoblash 
        if(worker.payments.salary){
            const table = await Table.findone({date : req.query.date, FIOlotin : worker.FIOlotin, parentMaster : req.user.id}).select("-_id salary")   
            salary = table.salary
            if(!salary){
                return next(new ErrorResponse(`Ish jadvalini aniqlab bolmadi ${worker.FIOlotin}  ${worker.FIOkril}`, 403))
            }
        }

        // unvon pulini hisoblash 
        if(worker.payments.rankSumma){
            const rank = await Rank.findOne({name : worker.rank, parent : req.user.id}).select("-_id summa")
            rankSumma = rank.summa
            if(!rankSumma){
                return next(new ErrorResponse(`Bu fuqaroning unvon pulini hisoblab bolmadi ${worker.FIOlotin}  ${worker.FIOkril}`, 403))
            }
        }    
        
        // xizmat yilini hisoblash 
        if(worker.payments.yearOfService){
            const workerYear = new Date(dateOfEmployment)
            const currentDate = new Date()
            const yearDifference  = currentDate.getFullYear - workerYear.getFullYear
            if(worker.payments.yearOfService < 5){
                yearOfService = 0
            }else if (worker.payments.yearOfService >= 5 && worker.payments.yearOfService < 10){
                yearOfService = salary * 0.1
            }else if (worker.payments.yearOfService >= 10 && worker.payments.yearOfService < 15){
                yearOfService = salary * 0.2
            }else if (worker.payments.yearOfService >= 15 && worker.payments.yearOfService < 20){
                yearOfService = salary * 0.3
            }else if (worker.payments.yearOfService >= 20 && worker.payments.yearOfService < 25){
                yearOfService = salary * 0.4
            }else if (worker.payments.yearOfService >= 25 && worker.payments.yearOfService < 30){
                yearOfService = salary * 0.5
            }else if (worker.payments.yearOfService >= 30 && worker.payments.yearOfService < 35){
                yearOfService = salary * 0.6
            }else if (worker.payments.yearOfService >= 35 && worker.payments.yearOfService < 40){
                yearOfService = salary * 0.7
            }else if (worker.payments.yearOfService >= 40 && worker.payments.yearOfService < 45){
                yearOfService = salary * 0.8
            }else if (worker.payments.yearOfService >= 45 && worker.payments.yearOfService < 50){
                yearOfService = salary * 0.9
            }else if (worker.payments.yearOfService >= 50 && worker.payments.yearOfService < 55){
                yearOfService = salary * 1
            }else if (worker.payments.yearOfService >= 55 && worker.payments.yearOfService < 60){
                yearOfService = salary * 1.1
            }else if (worker.payments.yearOfService >= 60 && worker.payments.yearOfService < 65){
                yearOfService = salary * 1.2
            }else{
                return next(new ErrorResponse("Siz xatolikga yol qoydinggiz xizmat yili 65 yildan otib ketti", 403))
            }
        }

        // kvartra tolovi 
        if(worker.payments.apartment.check){
            apartment = worker.payments.apartment.summa
        } 

        // fmc tolovi 
        if(worker.payments.fmc.check){
            fmc = (salary + rankSumma) * worker.payments.fmc.percent
        }

        // ovaqat pulini hisoblash
        if(worker.payments.foodMoney.check){
            foodMoney = worker.payments.foodMoney.summa
        }

        // zararli muhitda ishlagani uchun tolov 
        if()

        const newPaymentsAndDeduct = await PaymentsAndDeducts.create({
            date : req.query.date,
            FIOlotin : worker.FIOlotin,
            FIOkril : worker.FIOkril,
            position : worker.position,
            rank : worker.rank,
            career : career,
            salary : salary,
            rankSumma : rankSumma,
            payments : ,
            deducts : ,
            parentMaster : req.user.id,
            parent : location._id,

        })
    }
})    
