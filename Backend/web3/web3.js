const {Web3} =  require("web3")
const  {abi, bytecode} = require('../contracts/Voting.json');
require("dotenv").config({path: "../config.env"})



const web3 = new Web3(process.env.INFURA_URL)

const privateKey = process.env.PRIVATE_KEY;
const account = web3.eth.accounts.privateKeyToAccount(privateKey);


const contractAddress = process.env.CONTRACT_ADDRESS;
const contract = new web3.eth.Contract(abi, contractAddress);

const userAccount = web3.eth.accounts.create()



console.log('Account Address:', account.address)
console.log('Private Key: ', account.privateKey)
console.log('New Account: ', userAccount.privateKey)


const name = "National Election"
const duration = 2000
//TO IMOH
//NOTE: DO NOT COPY THE CREATE ELECTION AND ADD CANDIDATE FUNCTION IT IS ALREADY IN THE CONTROLLER(REMOVE IT FROMM THE CODE, I AM USING IT FOR TESTING)
const createElection = async () =>{
    try{
   
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
        
        const ElectionId = await contract.methods.electionCount().call()
       
    
        console.log(ElectionId)
      }
      catch(error){
        console.log(error)
         
      }
}


const post = "President"


const addCandidate = async () =>{
  try{
    const name = "Josh"
    const electionId = Number(17n)
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
  }
  catch(error){
    console.log(error)
  }
}

createElection()
module.exports = {web3, account, contract}







/*async function vote(electionId, candidateId){
    const contract = new web3.eth.Contract(abi, contractAddress);

    const data = contract.methods.vote(electionId, candidateId).encodeABI();
    const gas =contract.methods.vote(electionId, candidateId).estimateGas({from: account.address});

    const tx ={
        from: account.address,
        to: contractAddress,
        gas,
        data,
    };

    const signedTx =web3.eth.accounts.signTransaction(tx, privateKey);

    const receipt =web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    console.log('Transaction receipt', receipt)
}

vote(1,2).catch(console.error)

module.exports = { web3, contract , account }
*/

//web3.eth.getBlockNumber().then(console.log)

/*console.log(web3.utils.randomBytes())

console.log(web3.utils.toWei("1","ether"));

console.log(web3.utils.soliditySha3({type: "string", value: "web3"}))

console.log(web3.eth.accounts.create())*/