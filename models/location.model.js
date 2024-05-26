const mongoose = require('mongoose')

const locationSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true,
        trim : true
    },
    parent : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Master"
    },
    date : {
        type : String,
        required : true
    },
    tables : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "Table"
    }],
    datesTable : [{
        date : {
            type : String,
            trim : true
        }
    }]
}, {timestamps : true})


module.exports = mongoose.model("Location", locationSchema)