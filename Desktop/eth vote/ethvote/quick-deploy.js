const { ethers } = require("ethers");
const fs = require("fs");

async function quickDeploy() {
  try {
    // Your Ganache configuration
      const RPC_URL = "http://127.0.0.1:7545";
      const PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY;
      const NETWORK_ID = 5777;

      if (!PRIVATE_KEY) {
        throw new Error("ADMIN_PRIVATE_KEY environment variable is required");
      }

    console.log("🚀 Deploying Election contract to Ganache...");
    console.log("RPC URL:", RPC_URL);
    console.log("Network ID:", NETWORK_ID);

    // Connect to Ganache
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    
    console.log("Deployer address:", wallet.address);
    
    const balance = await wallet.getBalance();
    console.log("Deployer balance:", ethers.utils.formatEther(balance), "ETH");

    // Contract bytecode and ABI
    const contractJson = JSON.parse(fs.readFileSync("./artifacts/contracts/Election.sol/Election.json", "utf8"));
    
    const contractFactory = new ethers.ContractFactory(
      contractJson.abi,
      contractJson.bytecode,
      wallet
    );
    
    console.log("Deploying contract...");
    const contract = await contractFactory.deploy();
    await contract.deployed();
    
    console.log("✅ Contract deployed successfully!");
    console.log("Contract address:", contract.address);
    console.log("Transaction hash:", contract.deployTransaction.hash);
    
    // Update .env file
    const envContent = `CONTRACT_ADDRESS=${contract.address}
ADMIN_PRIVATE_KEY=${PRIVATE_KEY}
RPC_URL=${RPC_URL}
NETWORK_ID=${NETWORK_ID}`;
    
    fs.writeFileSync(".env", envContent);
    console.log("✅ Updated .env file with contract address");
    
    // Save deployment info
    const deploymentInfo = {
      contractAddress: contract.address,
      deployerAddress: wallet.address,
      transactionHash: contract.deployTransaction.hash,
      networkId: NETWORK_ID,
      rpcUrl: RPC_URL,
      timestamp: new Date().toISOString()
    };
    
    fs.writeFileSync("deployment-info.json", JSON.stringify(deploymentInfo, null, 2));
    console.log("✅ Saved deployment info to deployment-info.json");
    
    console.log("\n🎉 Deployment complete!");
    console.log("Next steps:");
    console.log("1. Make sure MetaMask is connected to your Ganache network");
    console.log("2. Import your admin account to MetaMask using the private key");
    console.log("3. Start the application with: npm run dev");
    console.log("4. Visit http://localhost:5000 to use the voting application");
    
    return deploymentInfo;
  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
    if (error.code === 'NETWORK_ERROR') {
      console.log("\n💡 Make sure Ganache is running on http://127.0.0.1:7545");
    }
    process.exit(1);
  }
}

quickDeploy();