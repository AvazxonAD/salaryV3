const mongoose = require('mongoose')

const paymentSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true,
        trim : true
    },
    summa : {
        type : Number,
        required : true
    },
    parent : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Master"
    }
}, {timestamps : true})

module.exports = mongoose.model("Payment", paymentSchema)
