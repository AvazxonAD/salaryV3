const asyncHandler = require('../middleware/async')
const ErrorResponse = require("../utils/errorResponse")
const Master = require('../models/master.model')
const Table = require('../models/table.model')
const Location = require('../models/location.model')
const File = require('../models/file.model')
const Position = require("../models/position.model")


// get all tables date
exports.getAllDateTables = asyncHandler(async (req, res, next) => {
    const location = await Location.findById(req.params.id);
    
    if (!location) {
        return next(new ErrorResponse("Joylashuv topilmadi", 404))
    }

    const copyArray = [...location.datesTable];
    const uniqueDatesTable = Array.from(new Set(copyArray.map(item => item.date)));

    return res.status(200).json({ success: true, data: uniqueDatesTable });
});

//get all tables 
exports.getAllTables = asyncHandler(async (req, res, next) => {
    // req.params.id = sanaga teng boladi 
    const tables = await Table.find({date : req.params.id, parentMaster : req.user.id}).sort({career : 1})
    return res.status(200).json({success : true, data : tables})
})

// get all locations 
exports.getAllLocations = asyncHandler(async (req, res, next) => {
    const locations = await Location.find({ parent: req.user.id }).sort({ name: 1 }).select("name tables");

    const uniqueLocations = [];
    const seenNames = new Set();

    for (const location of locations) {
        if (!seenNames.has(location.name)) {
            seenNames.add(location.name);
            uniqueLocations.push(location);
        }
    }

    return res.status(200).json({ success: true, data: uniqueLocations });
});

// all workers on location
exports.workersOnLocation = asyncHandler(async (req, res, next) => {
    const location = await Location.findById(req.params.id);
    if(!location) {
        return next(new ErrorResponse("Joylashuv topilmadi", 404))
    }
    const workers = await File.find({ parentMaster: req.user.id, selectRegion: location.name }).sort({career : 1})
        .select("selectLotin selectKril selectPosition selectRank")

    const newWorkers = workers.map(worker => {
        return {
            ...worker._doc, 
            rest: worker.selectRank === "Fuqaro"
        };
    });

    return res.status(200).json({ success: true, data: newWorkers });
});

 // create table 
 exports.createTable = asyncHandler(async (req, res, next) => {
    const location = await Location.findById(req.params.id)
    const {tables} = req.body
    const date = req.query.date
    const result = []

    if(!date || tables.length < 1){
        return next(new ErrorResponse("Sorovlar bosh qolishi mumkin emas", 403))
    }
    for(let table of tables){
        if(!table.FIOlotin || !table.FIOkril || !table.workerDay || !table.currentDay || !table.position || !table.rank){
            return next(new ErrorResponse("Sorovlar bosh qolishi mumkin emas", 403))
        }
        const test  = await Table.findOne({parent : location._id, date : date, FIOlotin : table.FIOlotin, FIOkril : table.FIOkril, parentMaster : req.user.id})
        if(test){
            return next(new ErrorResponse(`Bu fuqaro oldin hisoblangan : ${table.FIOlotin}, ${table.FIOkril}`, 403))
        }
    }
    for(let table of tables){
        const worker = await File.findOne({selectLotin : table.FIOlotin})
        const oneDaySalary = worker.selectSalary / table.currentDay
        const workerSalary = oneDaySalary * table.workerDay
        const newTable = await Table.create({
            date,
            FIOlotin : table.FIOlotin,
            FIOkril : table.FIOkril,
            workerDay : table.workerDay,
            currentDay : table.currentDay,
            salary : workerSalary,
            position : table.position,
            rank : table.rank,
            parent : location._id,
            parentMaster : req.user.id,
            career : worker.career
        })
        location.tables.push(newTable._id)
        await location.save()
        result.push(newTable)
    }
    const test = location.datesTable.find(item => item.date === req.query.date)
    if(!test){ 
        location.datesTable.push({date})
        await location.save()
    }
    return res.status(200).json({success : true, data : result})
})

// delete table 
exports.deleteOneTable = asyncHandler(async (req, res, next) => {
    const table = await Table.findById(req.params.id)
    const parent = await Location.findById(table.parent)
    const index = parent.tables.indexOf(table._id)
    parent.tables.splice(index, 1)
    await parent.save()
    
    const test = await Table.find({date : table.date, parent : parent._id})

    if( test.length <= 1 ){
        const date  = parent.datesTable.find(item => item.date === table.date)
        const index = parent.datesTable.indexOf(date)
        parent.datesTable.splice(index, 1)
        await parent.save()
    }
    await table.deleteOne()
    return res.status(200).json({success : true, data : "Delete"})
})

// delete many table 
exports.deleteMany = asyncHandler(async (req, res, next) => {
    const tables = await Table.find({parentMaster : req.user.id, date : req.params.id})
    const location = await Location.findById(tables[0].parent)  
    
    const datesTable = location.datesTable.filter(date => date.date !== req.params.id)
    location.datesTable = datesTable
    await location.save()

    for(let table of tables){
        const index = location.tables.indexOf(table._id)
        location.tables.splice(index, 1)
        await location.save()
        await table.deleteOne()
    }
    return res.status(200).json({success : true, data : "Delete"})
})