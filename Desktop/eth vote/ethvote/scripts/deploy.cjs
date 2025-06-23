const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("Deploying Election contract...");

  // Get the ContractFactory
  const Election = await ethers.getContractFactory("Election");

  // Deploy the contract
  const election = await Election.deploy();

  await election.deployed();

  console.log("Election contract deployed to:", election.address);
  console.log("Transaction hash:", election.deployTransaction.hash);
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deployed by:", deployer.address);
  console.log("Deployer balance:", ethers.utils.formatEther(await deployer.getBalance()));

  // Save deployment info
  const deploymentInfo = {
    contractAddress: election.address,
    deployerAddress: deployer.address,
    transactionHash: election.deployTransaction.hash,
    blockNumber: election.deployTransaction.blockNumber,
    gasUsed: election.deployTransaction.gasLimit.toString(),
    timestamp: new Date().toISOString()
  };

  fs.writeFileSync(
    'deployment-info.json',
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("Deployment info saved to deployment-info.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });