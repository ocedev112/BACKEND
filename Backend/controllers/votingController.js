const {web3,  contract, account} = require("../web3/web3")



const registerVoter = async (req, res) =>{
    try{
    const {electionId,voterName} = req.body
    const txData = contract.methods.registerVoter(electionId, voterName).encodeABI()
    const gas = await contract.methoods.registerVoter(electionId, voterName).estimateGas({from: account.address})
    const gasPrice = await web3.eth.getGasPrice()

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


const vote = async (req, res) =>{
    try{
        const {electionId, candidateId} = req.body

        const txData = contract.methods.vote(electionId, candidateId).encodeABI();
        const gas = contract.methods.vote(electionId, candidateId).estimateGas({from: account.address})
        const gasPrice = await web3.eth.getGasPrice()

        const tx  = {
            from: account.address,
            to: contract.options.address,
            gas: gasEstimate,
            gasPrice,
            data: txData,
    
        };
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

module.exports = {registerVoter, vote, getResults}