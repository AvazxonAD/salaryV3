const mongoose = require('mongoose')

const minimumSchema = new mongoose.Schema({
    summa : Number
}, {timestamps : true})

module.exports = mongoose.model("Minimum", minimumSchema)

