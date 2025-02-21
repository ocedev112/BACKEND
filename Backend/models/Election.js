const mongoose = require("mongoose")



const ElectionSchema = new mongoose.Schema({
    name: String,
    startTime: Number,
    duration: Number,
    candidate: [{type: mongoose.Schema.Types.ObjectId, ref: "Election"}]
})

module.exports = mongoose.model("Election", ElectionSchema);