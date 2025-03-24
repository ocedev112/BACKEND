const mongoose = require("mongoose")



const ElectionSchema = new mongoose.Schema({
    adminFistName: {type: String},
    adminLastName: {type: String},
    adminName: {type: String},
    email: {type: String, required: true},
    password: {type: String, required: true, minlength: 6},
    confirmPassword: {type: String},
    electionName: { type: String,  required: true},
    electionId: {type: String, required: true},
    days: {type: Number },
    hours: {type: Number},
    minutes: {type: Number},
    seconds: {type: Number},
    duration: {type: Number, required: true },
    candidate: [{ 
        candidateId: {type: Number, required: true},
        name: {type: String, required: true},
        post: {type: String, required: true},
        manifesto: {type: String},
        photo: {type: String}
    }]
})

module.exports = mongoose.model("Election", ElectionSchema);
