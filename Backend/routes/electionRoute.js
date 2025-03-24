const express = require("express");
const {createElection, adminLogin , addCandidate, getElection} = require("../controllers/electionController")
const upload = require('../middleware/multer')
const router = express.Router();


router.post("/create", createElection)
router.post("/adminLogin", adminLogin)
router.post("/add-candidate", upload.single('photo') , addCandidate)
router.get("/results/:electionId", getElection)

module.exports = router
