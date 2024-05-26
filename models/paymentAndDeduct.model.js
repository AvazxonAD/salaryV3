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
    payments : {
        type : Number,
        required : true
    },
    deducts : {
        type : Number,
        required : true
    },
    salary : {
        type : Number,
        required : true
    },
    rankSumma : {
        type : Number,
        required : true
    },
    career : {
        type : Number,
        required : true
    },
    date : {
        type : String,
        required : true
    },
    parent : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Location"
    },
    parentMaster : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Master"
    }
}, {timestamps : true})

module.exports = mongoose.model("PaymentAndDeduct", paymentAndDeductSchema)

