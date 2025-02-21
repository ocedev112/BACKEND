
const mongoose = require("mongoose")



const CandidateSchema = new mongoose.Schema({
    name: String,
    post: String,
    Votes:{type: Number, default: 0},
    election: [{type: mongoose.Schema.Types.ObjectId, ref: "Election"}]
})

module.exports = mongoose.model("Election", CandidateSchema);