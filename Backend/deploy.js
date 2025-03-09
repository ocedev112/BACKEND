const hre = require("hardhat");

async function main(){
    await hre.run("compile");
    const Voting = await hre.ethers.getContractFactory("Voting");

    
    const voting = await Voting.deploy();

    await voting.deployed();

    console.log("Voting contract deployed to:", voting.address)
}

main().then(()=> process.exit(0).catch((error) =>{
    console.error(error);
    process.exit(1);
}))
