const asyncHandler = require('../middleware/async')
const ErrorResponse = require("../utils/errorResponse")
const Master = require('../models/master.model')
const Table = require('../models/table.model')
const Location = require('../models/location.model')
const File = require('../models/file.model')

// get all locations 
exports.getAllLocations = asyncHandler(async (req, res, next) => {
    const locations = await Location.find({parent : req.user.id}).sort({name : 1}).select("name tables")
    return res.status(200).json({success : true, data : locations})
})

// all workers on location
exports.workersOnLocation = asyncHandler(async (req, res, next) => {
    const location = await Location.findById(req.params.id);
    if (!location) {
        return res.status(404).json({ success: false, message: "Location not found" });
    }

    const workers = await File.find({ parentMaster: req.user.id, selectRegion: location.name })
        .select("selectLotin selectKril selectPosition selectRank")
        .sort({ selectLotin: 1 });

    const newWorkers = workers.map(worker => {
        return {
            ...worker._doc, // Spread existing properties
            rest: worker.selectRank === "Fuqaro"
        };
    });

    return res.status(200).json({ success: true, data: newWorkers });
});
 // create table 
 exports.createTable = asyncHandler(async (req, res, next) => {
    const location = await Location.findById(req.params.id)
    const {tables, date} = req.body
    const result = []
    if(!date || tables.length < 1){
        return next(new ErrorResponse("Sorovlar bosh qolishi mumkin emas", 403))
    }
    for(let table of tables){
        if(!table.FIOlotin || !table.FIOkril || !table.workerDay || !table.currentDay){
            return next(new ErrorResponse("Sorovlar bosh qolishi mumkin emas", 403))
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
            parent : location._id,
            parentMaster : req.user.id
        })
        location.tables.push(newTable._id)
        await location.save()
        result.push(newTable)
    }
    return res.status(200).json({success : true, data : result})
})