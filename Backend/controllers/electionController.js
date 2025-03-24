const {web3,  contract, account} = require("../web3/web3")
const express = require("express")
const Election = require("../models/Election")
app = express()




const createElection = async (req,res) =>{
    try{
      const{adminFirstName, adminLastName, email, password,confirmPassword ,electionName, days, hours, minutes, seconds} = req.body
      if (!adminFirstName || !adminLastName || !password ||!confirmPassword ||!electionName ||!days ||!hours ||!minutes  ||!seconds){
          return res.status(400).json({ error : "All field are required"})
      }

      const duplicate = await Election.findOne({email: email}).exec();
      if(duplicate) return res.status(409).json({error: "Email address already in use"})
      
      
      if(password  !== confirmPassword){
        return res.status(400).json({error: "Passwords do not match"})
      }

      const adminName = `${adminFirstName} ${adminLastName}`
      const duration = (days*24*60*60) + (hours*60*60) + (minutes * 60) + seconds


      

      const txData = contract.methods.createElection(electionName, duration).encodeABI();
      const gasEstimate = await contract.methods.createElection(electionName, duration).estimateGas({ from: account.address })
      const gasPrice = await web3.eth.getGasPrice();

      
    
    

      const tx  = {
        from: account.address,
        to: contract.options.address,
        gas: gasEstimate,
        gasPrice,
        data: txData,

      };

      const signedTx = await web3.eth.accounts.signTransaction(tx, account.privateKey)
      const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

      const electionId = await contract.methods.electionCount().call()

      const newElection = new Election({
        adminName,
        email,
        password,
        electionName,
        electionId,
        duration,
        candidates: []
      })

      await newElection.save()

      res.json({success: true, message: "Election created successfuly", election: newElection})
    }
    catch(error){
         res.status(500).json({ success: false, error: error.message})
       
    }
}


const adminLogin = async(req,res) =>{
  try{
    const {email,password} = req.body


    
           if(!email || !password){
             return res.status(400).json({ error: " All fields required"})
           }
           
    
           const admin = await Election.findOne({email, password})
    
           if(!admin){
              return res.status(404).json({error: "Invalid email address or password"})
           }
    
    
    
           const election = await Election.findOne({ electionId: admin.electionId})
           
    
           if(!election){
              return res.status(404).json({ error: "Election not found"})
           }
    
           res.status(200).json({message: "Login successfull", admin })
  }catch(error){

  }
}



const addCandidate = async(req,res) =>{
  try{
    const {electionId, name, post, manifesto, photo} = req.body
    if(!electionId || !post ||!name){
       return res.status(400).json({error: "Election ID, name and post are required"})
    }

    const election = await Election.findOne({electionId})

    if(!election){
        return res.status(404).json({error : "Election not found"})
    }

  
    const photoPath = req.file ? req.file.filename : null
    const txData = contract.methods.addCandidate(electionId, post, name).encodeABI()
    const gas = await contract.methods.addCandidate(electionId, post, name).estimateGas({from: account.address});
    const gasPrice = await web3.eth.getGasPrice();

    const tx = {
      from: account.address,
      to: contract.options.address,
      gas,
      gasPrice,
      data: txData,
    };

    const signedTx = await web3.eth.accounts.signTransaction(tx, account.privateKey);
    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction)

    const eventSignature = web3.utils.keccak256("CandidateAdded(uint256,uint256,string,string)")
    const log = receipt.logs.find(l => l.topics[0] === eventSignature);

    if(!log) {
      throw new Error("CandidateAdded event not found")
    }

  
    const decodedLog = web3.eth.abi.decodeLog([
      {type: "uint256", name: "ElectionId"},
      { type: "uint256", name: "candidateId"},
      { type: "string", name: "name"},
      { type: "string", name: "post"},
    ], log.data, log.topics.slice(1))
    

    const candidatenumId = decodedLog.candidateId

    const candidateId = Number(candidatenumId)


    const newCandidate = {
      candidateId,
      name,
      post,
      manifesto,
      photo: photoPath
    }

    election.candidate.push(newCandidate)

    await election.save()


    res.status(200).json({ success: true, message: "voter added successfuly", canidate: newCandidate})
  }
  catch(error){
    res.status(500).json({ sucess: false, error: error.message})
  }
}

const getElection = async (req, res) =>{
  try {

    const electionId = Number(req.params.electionId);

    const election = await Election.findOne({ electionId });



    if (!election) {

      return res.status(404).json({ message: "Election not found" });

    }



    const candidates = election.candidate; 


    const resultFromContract = await contract.methods.getResults(electionId).call();
    const voteCount = resultFromContract['1'];

    const candidateResults = await Promise.all(

      candidates.map(async (candidate, index) => {

        

      
        return {

          candidateId: candidate.candidateId, 
          name: candidate.name,              
          post: candidate.post,
          manifesto: candidate.manifesto,
          voteCount: Number(voteCount[index]),       
        };

      })

    );



    res.status(200).json({
      electionId,
      electionName: election.electionName,
      results: candidateResults,
    });



  } catch (error) {
    console.error("Error fetching election results:", error);
    res.status(500).json({ message: "Failed to fetch election results" });
  }
};




module.exports = {createElection, adminLogin , addCandidate, getElection}
