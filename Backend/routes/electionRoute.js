const express = require("express");
const router = express.Router();
const Election = require("../models/Election")

router.get("/", async (req,res) =>{
    const elections = await Election.find();
    res.json(elections)
})

router.post("/create", async (req, res) =>{
    const {name, duration} = req.body;
    const election = new Election({name, duration, isActive})
    await election.save();
    res.json({success: true, election});
})

module.exports = router