const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const { Wallet } = require("web3");

const VoterSchema = new mongoose.Schema({
    electionId:{type: Number, required: true },
    firstName: { type: String},
    lastName: { type: String},
    voterName: { type: String},
    email:{type: String, required: true},
    password:{type: String, required: true, minlength: 6}, 
    confirmPassword:{type: String},
    walletAddress: {
        type: String,
      
    },
    walletPrivateKey: {
        type: String
       
    },
    photo:{
        type: String
    },
    joinedElections : [{
         electionId: {type: String},
         electionName: {type: String},
         duration: {type: Number},
         candidate: [{
            candidateId: {type: Number},
            name: {type: String},
            post: {type: String},
            manifesto: {type: String},
            photo: {type: String}
         }]

    }],
    votedForPost: {type: Boolean, default: false},

})




module.exports = mongoose.model("Voter", VoterSchema)
