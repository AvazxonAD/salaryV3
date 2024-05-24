const mongoose = require("mongoose");
const tableSchema = new mongoose.Schema({
    date: {
      type: String,
      required: true,
      trim: true,
    },
    FIOlotin: {
      type: String,
      required: true,
      trim: true,
    },
    FIOkril: {
      type: String,
      required: true,
      trim: true,
    },
    workerDay: {
      type: Number,
      required: true,
    },
    currentDay: {
      type: Number,
      required: true,
    },
    salary : {
        type : Number,
        required : true
    },
    position : {
      type : String,
      required : true
    },
    rank : {
      type : String,
      required : true
    },
    career : {
      type : Number,
      required : true
    },
    parentMaster: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Master",
    },
    parent : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Location"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Table", tableSchema);
