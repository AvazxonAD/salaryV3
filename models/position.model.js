const mongoose = require('mongoose')

const positionSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true,
        trim : true
    },
    percent : {
        type : Number,
        required : true
    },
    salary : {
        type : Number,
        required : true
    },
    parent : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Master"
    },
    date :{
        type : String,
        required : true
    }
}, {timestamps : true})

module.exports = mongoose.model('Position', positionSchema)
