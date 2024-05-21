const mongoose = require('mongoose')

const workerSchema = new mongoose.Schema({
    FIOlotin : {
        type : String,
        required : true,
        trim : true
    },
    FIOkril : {
        type : String,
        required : true,
        trim : true
    },
    inn : {
        type : Number,
        required : true
    },
    inps : {
        type : Number,
        required : true
    },
    plastic : {
        type : Number,
        required : true
    },
    dateOfEmployment : {
        type : String,
        required : true
    },
    budget : {
        type : String,
        required : true
    },
    parent : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Master"
    },
    date : {
        type : String,
        required : true
    }
}, {timestamps : true})


module.exports = mongoose.model("Worker", workerSchema)
