const mongoose = require('mongoose')

const coctavSchema = new mongoose.Schema({
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

module.exports = mongoose.model("Coctav", coctavSchema)
