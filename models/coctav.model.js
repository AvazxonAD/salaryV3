const mongoose = require('mongoose')

const coctavSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Master"
    },
    date:{
        type: String,
        required: true
    }
}, 
{timestamps: true}
)

module.exports = mongoose.model("Coctav", coctavSchema)
