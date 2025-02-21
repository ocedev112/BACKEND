const mongoose = require("mongoose");


const VoterSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    votedForPost: {type: Map, of: Boolean},
})


module.exports = mongoose.model("Voter", VoterSchema)