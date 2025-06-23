import { ethers } from "ethers";
import fs from "fs";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

async function deployContract() {
  console.log("Starting contract deployment...");

  // Configuration - you'll need to provide these values
  const RPC_URL = process.env.RPC_URL || "http://127.0.0.1:7545";
  const PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY;
  
  if (!PRIVATE_KEY) {
    console.error("Please set ADMIN_PRIVATE_KEY environment variable");
    process.exit(1);
  }

  try {
    // Connect to Ganache
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    
    console.log("Connected to network:", RPC_URL);
    console.log("Deployer address:", wallet.address);
    
    // Check balance
    const balance = await wallet.getBalance();
    console.log("Deployer balance:", ethers.utils.formatEther(balance), "ETH");
    
    // Read contract bytecode and ABI (you'll need to compile first)
    const Election = require("./artifacts/contracts/Election.sol/Election.json");
    
    // Deploy contract
    const contractFactory = new ethers.ContractFactory(
      Election.abi,
      Election.bytecode,
      wallet
    );
    
    console.log("Deploying Election contract...");
    const contract = await contractFactory.deploy();
    await contract.deployed();
    
    console.log("Contract deployed to:", contract.address);
    console.log("Transaction hash:", contract.deployTransaction.hash);
    
    // Save deployment info
    const deploymentInfo = {
      contractAddress: contract.address,
      deployerAddress: wallet.address,
      transactionHash: contract.deployTransaction.hash,
      network: RPC_URL,
      timestamp: new Date().toISOString()
    };
    
    fs.writeFileSync("deployment-info.json", JSON.stringify(deploymentInfo, null, 2));
    console.log("Deployment info saved to deployment-info.json");
    
    return deploymentInfo;
  } catch (error) {
    console.error("Deployment failed:", error.message);
    process.exit(1);
  }
}

// Run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  deployContract();
}

export { deployContract };