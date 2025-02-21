const {web3,  contract, account} = require("../web3/web3")
const express = require("express")
app = express()




const createElection = async (req,res) =>{
    try{
      const{name, duration} = req.body;
      const txData = contract.methods.createElection(name, duration).encodeABI();
      const gasEstimate = await contract.methods.createElection(name, duration).estimateGas({ from: account.address })
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

      res.json({success: true,  receipt})
    }
    catch(error){
         res.status(500).json({ sucess: false, error: error.message})
       
    }
}


const addCandidate = async(req,res) =>{
  try{
    const {electionId, post, name} = req.body

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
    const receipt = await web3.eth.sendSignedTransaction(signedTx, rawTransaction)


    res.json({success: true, candidateId: receipt.events.candidateAdded.returnValues.candidateId, receipt})
  }
  catch(error){
    res.status(500).json({ sucess: false, error: error.message})
  }
}

const getElection = async (req, res) =>{
  try{
    const {electionId} = req.params;
    const election = await contract.methods.election(electionId).call();
    res.json({success: true, election})

  }
  catch(error){
    res.status(500).json({ sucess: false, error: error.message})
  }
}

module.exports = {createElection, addCandidate, getElection}