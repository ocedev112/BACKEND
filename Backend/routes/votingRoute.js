const express = require("express");
const {registerVoter, loginVoter , vote, getResults, joinNewElection} = require("../controllers/votingController")
const upload = require('../middleware/multer')

const router = express.Router();


router.post("/register", upload.single('photo') , registerVoter)
router.post("/login", loginVoter)
router.post("/vote", vote)
router.get("/results/:electionId", getResults)
router.post("/newElection", joinNewElection)


module.exports = router;
