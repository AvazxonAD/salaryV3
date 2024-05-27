const asyncHandler = require('../middleware/async')
const ErrorResponse = require('../utils/errorResponse')
const Position = require('../models/position.model')
const Master = require('../models/master.model')
const File = require('../models/file.model')
const Location  = require('../models/location.model') 
const PaymentsAndDeducts = require('../models/paymentAndDeduct.model')
const Table = require('../models/table.model')
const Worker = require('../models/worker.model')
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
    
    return res.status(200).json({success : true, data : location.datesPaymentsAndDeducts})  
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
    const location = await Location.findById(req.params.id)
    let result = []
    const { workers } = req.body
    if (!workers || workers.length < 1 || !req.query.date) {
        return next(new ErrorResponse("Sorovlar bosh qolishi mumkin emas", 403))
    }
    for (let worker of workers) {
        if (!worker || !worker.FIOlotin || !worker.FIOkril || !worker.position || !worker.rank) {
            return next(new ErrorResponse("Sorovlar bosh qolishi mumkin emas", 403))
        }

        const test = await PaymentsAndDeducts.findOne({
            FIOlotin: worker.FIOlotin,
            FIOkril: worker.FIOkril,
            date: req.query.date
        })
        if (test) {
             return next(new ErrorResponse(`Bu fuqaro oylik tolovlari va ushlanmalari hisoblab bolingan: ${test.FIOlotin} ${test.FIOkril}`, 403))
        }
    }

    for (let worker of workers) {
        // tolovlar
        let career = 0
        let salary = 0
        let rankSumma = 0
        let yearOfService = 0
        let apartment = 0
        let fmc = 0
        let foodMoney = 0
        let forHarmfulWork = 0
        let dateOfEmployment = null
        let payments = 0
        // ushlanmalar
        let tradeUnion = 0
        let sportsFund = 0
        let incomeTax = 0
        let alimony1 = 0
        let penalty = 0
        let deducts = 0

        // lavozim martabasini aniqlash 
        const position = await Position.findOne({ name: worker.position, parent: req.user.id }).select("-_id career")
        career = position.career
        if (!career) {
            return next(new ErrorResponse(`Lavozimni aniqlab bolmadi ${worker.FIOlotin}  ${worker.FIOkril}`, 403))
        }

        // qachon ishga kirganini aniqlashtrish 
        if (worker.payments.yearOfService) {
            const workerDate = await Worker.findOne({ FIOlotin: worker.FIOlotin, FIOkril: worker.FIOkril, parent: req.user.id }).select("dateOfEmployment -_id")
            dateOfEmployment = workerDate.dateOfEmployment
            if (!dateOfEmployment) {
                return next(new ErrorResponse(`Fuqaroning ishga kirgan  kunini aniqlab bolmadi ${worker.FIOlotin}  ${worker.FIOkril}`, 403))
            }
        }
        //  TOLOVLARNI HISOBLASH 

        // ish haqisini hisoblash 
        if (worker.payments.salary) {
            const table = await Table.findOne({ date: req.query.date, FIOlotin: worker.FIOlotin, parentMaster: req.user.id }).select("-_id salary")
            salary = table.salary
            if (!salary) {
                return next(new ErrorResponse(`Ish jadvalini aniqlab bolmadi ${worker.FIOlotin}  ${worker.FIOkril}`, 403))
            }
        }
        // unvon pulini hisoblash 
        if (worker.payments.rankSumma) {
            const rank = await Rank.findOne({ name: worker.rank, parent: req.user.id }).select("-_id summa")
            rankSumma = rank.summa
            if (!rankSumma) {
                return next(new ErrorResponse(`Bu fuqaroning unvon pulini hisoblab bolmadi ${worker.FIOlotin}  ${worker.FIOkril}`, 403))
            }
        }
        // xizmat yilini hisoblash 
        if (rankSumma !== 0) {
            if (worker.payments.yearOfService) {
                const workerYear = new Date(dateOfEmployment)
                const currentDate = new Date()
                const yearDifference = currentDate.getFullYear() - workerYear.getFullYear()
                if (yearDifference < 5) {
                    yearOfService = 0
                } else if (yearDifference >= 5 && yearDifference < 10) {
                    yearOfService = salary * 0.1
                } else if (yearDifference >= 10 && yearDifference < 15) {
                    yearOfService = salary * 0.2
                } else if (yearDifference >= 15 && yearDifference < 20) {
                    yearOfService = salary * 0.3
                } else if (yearDifference >= 20 && yearDifference < 25) {
                    yearOfService = salary * 0.4
                } else if (yearDifference >= 25 && yearDifference < 30) {
                    yearOfService = salary * 0.5
                } else if (yearDifference >= 30 && yearDifference < 35) {
                    yearOfService = salary * 0.6
                } else if (yearDifference >= 35 && yearDifference < 40) {
                    yearOfService = salary * 0.7
                } else if (yearDifference >= 40 && yearDifference < 45) {
                    yearOfService = salary * 0.8
                } else if (yearDifference >= 45 && yearDifference < 50) {
                    yearOfService = salary * 0.9
                } else if (yearDifference >= 50) {
                    yearOfService = salary * 1
                }
            }
        }

        if (rankSumma === 0) {
            if (worker.payments.yearOfService) {
                const workerYear = new Date(dateOfEmployment)
                const currentDate = new Date()
                const yearDifference = currentDate.getFullYear() - workerYear.getFullYear()
                if (yearDifference < 3) {
                    yearOfService = 0
                } else if (yearDifference >= 3 && yearDifference < 5) {
                    yearOfService = salary * 0.1
                } else if (yearDifference >= 5 && yearDifference < 10) {
                    yearOfService = salary * 0.2
                } else if (yearDifference >= 10 && yearDifference < 15) {
                    yearOfService = salary * 0.3
                } else if (yearDifference >= 15 && yearDifference < 20) {
                    yearOfService = salary * 0.4
                } else if (yearDifference >= 20 && yearDifference < 25) {
                    yearOfService = salary * 0.5
                } else if (yearDifference >= 25 && yearDifference < 30) {
                    yearOfService = salary * 0.6
                } else if (yearDifference >= 30 && yearDifference < 35) {
                    yearOfService = salary * 0.7
                } else if (yearDifference >= 35 && yearDifference < 40) {
                    yearOfService = salary * 0.8
                } else if (yearDifference >= 40 && yearDifference < 45) {
                    yearOfService = salary * 0.9
                } else if (yearDifference >= 50) {
                    yearOfService = salary * 1
                }
            }
        }

        // kvartira tolovi 
        if (worker.payments.apartment.check) {
            apartment = worker.payments.apartment.summa
        }

        // fmc tolovi 
        if (worker.payments.fmc.check) {
            fmc = (salary + rankSumma) * (worker.payments.fmc.percent / 100)
        }

        // ovqat pulini hisoblash
        if (worker.payments.foodMoney.check) {
            foodMoney = worker.payments.foodMoney.summa
        }

        // zararli muhitda ishlagani uchun tolov 
        if (worker.payments.forHarmfulWork) {
            forHarmfulWork = salary + rankSumma + yearOfService
        }

        // TOLOVLARNI BARCHASINI HISOBLASH
        payments = career + salary + rankSumma + yearOfService + apartment + fmc + foodMoney + forHarmfulWork

        // USHLANMALARNI HISOBLASH  

        // kasaba uyishmasi ushlanmasi 
        if (worker.deducts.tradeUnion) {
            tradeUnion = salary * 0.001
        }
        // sport fondi ushlanmasi 
        if (worker.deducts.sportsFund) {
            sportsFund = payments * 0.001
        }
        
        // daromad solig'ini hisoblash
        if (worker.privilege.check) {
            if (worker.deducts.incomeTax) {
                incomeTax = (payments - worker.privilege.summa) * 0.12
            }
        }else if (!worker.privilege.check){
            if(worker.deducts.incomeTax){
                incomeTax = payments * 0.12
            }
        }

        // alimentni hisoblash 1 xotinidan 
        if (worker.deducts.alimony1.check) {
            alimony1 = (payments - incomeTax) * (worker.deducts.alimony1.percent / 100)
        }

        // shtraflarni hisoblash
        if (worker.deducts.penalty.check) {
            if (worker.deducts.penalty.select === "salary") {
                penalty = salary * (worker.deducts.penalty.percent / 100)
            } else if (worker.deducts.penalty.select === "payments") {
                penalty = payments * (worker.deducts.penalty.percent / 100)
            } else if (worker.deducts.penalty.select === "rankSumma") {
                penalty = rankSumma * (worker.deducts.penalty.percent / 100)
            }
        }

        // BARCHA USHLANMALAR YIGINDISI 
        deducts = tradeUnion + sportsFund + incomeTax + alimony1 + penalty
        
        const newPaymentsAndDeduct = await PaymentsAndDeducts.create({
            date: req.query.date,
            FIOlotin: worker.FIOlotin,
            FIOkril: worker.FIOkril,
            position: worker.position,
            rank: worker.rank,
            career: career,
            salary: salary,
            rankSumma: rankSumma,
            payments: payments,
            deducts: deducts,
            parentMaster: req.user.id,
            parent: location._id,

        })
        location.paymentsAndDeducts.push(newPaymentsAndDeduct._id)
        await location.save()
        result.push(newPaymentsAndDeduct)
    }
    const test = location.datesPaymentsAndDeducts.find(item => item.date === req.query.date)
    if(!test){
        location.datesPaymentsAndDeducts.push({date : req.query.date})
        await location.save()
    }
    return res.status(200).json({success : true, data : result})
})

//delete paymnet anad deduct 
exports.paymentAndDeductDelete = asyncHandler(async (req, res, next) => {

})
