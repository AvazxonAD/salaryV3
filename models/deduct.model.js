const mongoose = require('mongoose')

// yangi deduct model yaaratish 
const deductSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true,
        trim : true
    },
    summa : {
        type : String,
        required : true, 
        trim : true
    },
    parent : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Master"
    }
}, {timestamps : true})

// exports qilsih 
module.exports = mongoose.model('Deduct', deductSchema)
