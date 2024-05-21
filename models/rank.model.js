const mongoose = require('mongoose')

const rankSchema = new mongoose.Schema({
    name : {
        type : String,
        trim : true,
        required : true
    },
    summa : {
        type : Number,
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

module.exports = mongoose.model("Rank", rankSchema)
