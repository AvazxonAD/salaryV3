const mongoose = require('mongoose')

const fileSchema = new mongoose.Schema({
    selectPosition : {
        type : String,
        required : true,
        trim : true
    },
    selectSalary : {
        type : Number,
        required : true
    },
    selectPercent : {
        type : Number,
        required : true
    },
    selectCoctav : {
        type : String,
        required : true, 
        trim : true
    },
    selectTip : {
        type : String,
        required : true
    },
    selectRegion : {
        type : String,
        required : true,
        trim : true
    },
    selectStavka: {
        type: String,
        required: true
    },
    parent : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Folder"
    },
    parentMaster : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Master"
    },
    date : {
        type : String,
        required : true
    }
},
 {timestamps : true}
)

module.exports = mongoose.model("File", fileSchema )