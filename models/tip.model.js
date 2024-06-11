const mongoose = require('mongoose')

const tipSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Master"
    }
}, 
{timestamps: true}
)

module.exports = mongoose.model("Tip", tipSchema)
