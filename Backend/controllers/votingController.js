const {web3,  contract, userAccount, sendSepoliaETH} = require("../web3/web3")
const  Voter = require("../models/Voter");
const Election = require("../models/Election")
const mongoose = require("mongoose");

console.log(userAccount.address)

async function getBal(){
  try{
  const balance = await web3.eth.getBalance(userAccount.address);
  console.log("Balance:", web3.utils.fromWei(balance, "ether"), "ETH");
  }
  catch(error){
    console.log("couldn't get balance")
  }
}



async function register(electionId, voterName){
    const balance = await web3.eth.getBalance(userAccount.address);
    console.log("Balance:", web3.utils.fromWei(balance, "ether"), "ETH");
   
    
    // Estimate gas and get gas price
    const estimatedGas = await contract.methods.registerVoter(electionId, voterName)
      .estimateGas({from: userAccount.address});
    const gasPrice = await web3.eth.getGasPrice();
    
    // Calculate total cost
    
    
    // Prepare transaction data
    const txData = contract.methods.registerVoter(electionId, voterName).encodeABI();
    
    
    const tx = {
      from: userAccount.address,
      to: contract.options.address,
      gas: estimatedGas,
      gasPrice,
      data: txData,
    };
    
    // Sign and send transaction
    const signedTx = await web3.eth.accounts.signTransaction(tx, userAccount.privateKey);
    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    
    console.log(`Transaction successful! Gas used: ${receipt.gasUsed}`);
}


const registerVoter = async (req, res) => {  
    try {
      const  NewAccount = web3.eth.accounts.create()
      const { electionId, firstName, lastName , email, password, confirmPassword} = req.body;
      if (!electionId || !firstName ||!lastName  ||!email  ||!password ||!confirmPassword )  {
            return res.status(400).json({ error: "All fields are required" });
      }
      


      const voterName = `${firstName} ${lastName}`

       const duplicate = await Voter.findOne({email: email}).exec();
       if(duplicate) return res.status(409).json({error: "Email address already in use"})
        const photoPath = req.file ? req.file.filename : null
        const walletAddress = NewAccount.address
         const walletPrivateKey = NewAccount.privateKey
  

         await sendSepoliaETH(walletAddress)

      
        if(password  !== confirmPassword){
          return res.status(400).json({error: "Passwords do not match"})
        }
     

        
    
       const txData = contract.methods.registerVoter(electionId, voterName).encodeABI()
       const gas = await contract.methods.registerVoter(electionId, voterName).estimateGas({from: walletAddress});
       const gasPrice = await web3.eth.getGasPrice()
  
      const tx = {
        from: walletAddress,
        to: contract.options.address,
        gas,
        gasPrice,
        data: txData,
        value: '0'
      }
  
      const signedTx = await web3.eth.accounts.signTransaction(tx, walletPrivateKey)
      const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

      
        
      const newVoter = new Voter({ electionId, voterName, email, password, walletAddress, walletPrivateKey, photo: photoPath});
      await newVoter.save();
        res.status(201).json({
  
            success: true,
  
            message: "Voter registered successfully",
  
            voter: newVoter,



        
  
        });
       

       
  
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

const loginVoter = async (req, res) =>{
   try{ 
       const { email, password} = req.body

       if(!email || !password){
         return res.status(400).json({ error: " All fields required"})
       }
       

       const voter = await Voter.findOne({email, password})

       if(!voter){
          return res.status(404).json({error: "Invalid email address or password"})
       }



       const election = await Election.findOne({ electionId: String(voter.electionId)})
       

       if(!election){
          return res.status(404).json({ error: "Election not found"})
       }

       res.status(200).json({message: "Login successfull", voter, election: {
        electionId: election.electionId,
        electionName: election.electionName,
        duration: election.duration,
        candidates: election.candidate
       }})
   }
   catch(error){

   }
}

const vote = async (req, res) =>{
    try{
        const {voterId, electionId, candidateId} = req.body

        if(!voterId || !electionId ||!candidateId){
            return res.status(404).json({error: "All fields required"})
        }

        const voter = await Voter.findById(voterId)
        if(!voter){
           return res.status(404).json({error: "Voter not found"})
        }
        const walletAddress = voter.walletAddress
        const walletPrivateKey = voter.walletPrivateKey
        
        const txData = contract.methods.vote(electionId, candidateId).encodeABI();
        const gas =  await contract.methods.vote(electionId, candidateId).estimateGas({from: walletAddress})
        const gasPrice = await web3.eth.getGasPrice()

        const tx  = {
          from: walletAddress,
          to: contract.options.address,
          gas,
          gasPrice,
          data: txData,
  
        };

      
       const signedTx = await web3.eth.accounts.signTransaction(tx, walletPrivateKey)
       const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

       res.status(200).json({message: "you have voted"})
       
    }
    catch(error){
        res.status(500).json({ sucess: false, error: error.message})
    }
}

const getResults = async (req, res) =>{
    try{
        const {electionId} = req.params;
        const results = await contract.methods.getResults(electionId).call()
        res.json({success: true, results});
    }
    catch(error){
        res.status(500).json({ sucess: false, error: error.message})
    }
}


const joinNewElection = async (req,res) =>{
  try{
    const {electionId, voterId} = req.body
    if( !electionId ||!voterId ){
      return res.status(404).json({error: "All fields required"})
    }

    if(!mongoose.Types.ObjectId.isValid(voterId)){
      return res.status(400).json({error: "Invalid  VoterId format"})
  }



      const voter = await Voter.findById(voterId)
      if(!voter){
         return res.status(404).json({error: "Voter not found"})
      }



      const election = await Election.findOne({electionId: electionId})
      if(!election){
        return res.status(404).json({error: "election not found"})
      }

      
      const alreadyJoined = voter.joinedElections.find(
        (e) => e.electionId === electionId
      )

      if(alreadyJoined){
         res.status(400).json({error : "Already joined this election"})
      }

      const electionData = {
        electionId: election.electionId,
        electionName: election.electionName,
        duration: election.duration,
        candidate: election.candidate
      }
      const walletAddress = voter.walletAddress
      const walletPrivateKey = voter.walletPrivateKey
 
      const txData = contract.methods.registerVoter( electionId, voter.voterName).encodeABI()
      const gas = await contract.methods.registerVoter( electionId, voter.voterName).estimateGas({from: walletAddress});
      const gasPrice = await web3.eth.getGasPrice()

      const tx = {
        from: walletAddress,
        to: contract.options.address,
        gas,
        gasPrice,
        data: txData,
      }
    
      const signedTx = await web3.eth.accounts.signTransaction(tx, walletPrivateKey)
      
      const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

   
       voter.joinedElections.push(electionData)

       await voter.save()

      return res.status(200).json({
        success: true,
        message: "Voter registered for new election",
        joinedElections: electionData
      })


    
     
  }
  catch(error){
    return res.status(500).json({
      success: false,
      error: error.message
    })
  }
}


module.exports = {registerVoter, loginVoter , vote, getResults, joinNewElection}

