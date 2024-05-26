const mongoose = require('mongoose')

const paymentAndDeductSchema = new mongoose.Schema({
    FIOlotin : {
        type : String,
        trim : true,
        required : true
    },
    FIOkril : {
        type : String,
        required : true
    },
    payment : {
        type : Number,
        required : true
    },
    deduct : {
        type : Number,
        required : true
    },
    salary : {
        type : Number,
        required : true
    },
    parent : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Location"
    },
    parentMaster : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Master"
    },
    career : {
        type : Number,
        required : true
    },
    date : {
        type : String,
        required : true
    }
}, {timestamps : true})

module.exports = mongoose.model("PaymentAndDeduct", paymentAndDeductSchema)

