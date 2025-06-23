# 🗳️ EthVote - Decentralized Voting System

A secure, transparent, and decentralized voting platform powered by Ethereum blockchain technology. Built with React, Node.js, and Solidity smart contracts.

![EthVote Demo](https://img.shields.io/badge/Status-Production%20Ready-green)
![Ethereum](https://img.shields.io/badge/Ethereum-Smart%20Contracts-blue)
![React](https://img.shields.io/badge/React-18+-61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6)

## 🌟 Features

- **🔐 Secure Voting**: Blockchain-powered security ensures tamper-proof voting
- **👁️ Transparent**: All votes recorded on-chain for complete transparency  
- **⚡ Decentralized**: No central authority controls the voting process
- **📱 Modern UI**: Beautiful glassmorphic design with responsive layout
- **🔗 MetaMask Integration**: Seamless wallet connection and transaction signing
- **👨‍💼 Admin Panel**: Complete session and candidate management
- **📊 Real-time Results**: Live vote tracking with visual progress bars
- **🔄 Session Management**: Isolated voting sessions with fresh vote counts

## 🛠️ Tech Stack

**Frontend:**
- React 18 + TypeScript + Vite
- TailwindCSS + Shadcn/ui components  
- ethers.js v5 for Web3 integration
- Lucide React icons

**Backend:**
- Node.js + TypeScript + Express
- ethers.js v5 for blockchain interaction
- CORS enabled for cross-origin requests

**Blockchain:**
- Solidity ^0.8.19 smart contracts
- Hardhat development environment
- Ganache local blockchain network

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **MetaMask** browser extension - [Install here](https://metamask.io/)
- **Ganache** (for local blockchain) - [Download here](https://trufflesuite.com/ganache/)

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/eth-vote-genesis.git
cd eth-vote-genesis
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..

# Install server dependencies  
cd server
npm install
cd ..
```

### 3. Setup Ganache Local Blockchain

1. **Open Ganache** application
2. **Create a new workspace** or use Quickstart
3. **Configure Network Settings:**
   - **Port**: 7545 (default)
   - **Chain ID**: 1337
   - **Accounts**: Generate at least 5 accounts
4. **Note the first account details** (this will be your admin account):
   - **Address**: `0x...` (use your Ganache account address)
   - **Private Key**: `0x...` (use your Ganache account private key)

### 4. Deploy Smart Contract

```bash
# Compile the contract
npx hardhat compile

# Deploy to Ganache using the admin account
ADMIN_PRIVATE_KEY=your_private_key_here node deploy-contract.js
```

**Expected Output:**
```
Starting contract deployment...
Connected to network: http://127.0.0.1:7545
Deployer address: 0x... (your admin address)
Deployer balance: 99.666572898713052572 ETH
Contract deployed to: 0x2500eFCCfB8e10718DEB2F54De55109d4D408c42
Transaction hash: 0x77c897699b8a42a7a286ee93091dca057c55858448d6bea17f42322ded1c3e83
```

### 5. Configure MetaMask

1. **Open MetaMask** and click on the network dropdown
2. **Add a new network** with these details:
   ```
   Network Name: Ganache Local
   RPC URL: http://127.0.0.1:7545
   Chain ID: 1337
   Currency Symbol: ETH
   ```
3. **Import your admin account:**
   - Click "Import Account"
   - Paste your private key from Ganache
   - This account will have admin privileges

4. **Import additional test accounts** (optional):
   - Use other private keys from Ganache for testing voting

### 6. Start the Application

**This is a full-stack application that serves both frontend and backend from one server.**

**Step 1: Get Required Information from Ganache**

1. **CONTRACT_ADDRESS**: Found in your `deployment-info.json` file
   - Look for the `"contractAddress"` field
   - Example: `"0x2500eFCCfB8e10718DEB2F54De55109d4D408c42"`

2. **ADMIN_PRIVATE_KEY**: From your Ganache admin account
   - Open Ganache application
   - Find the account that deployed the contract (the `"deployerAddress"` from `deployment-info.json`)
   - Click the **key icon** 🔑 next to that account
   - Copy the private key (starts with `0x` and has 64 characters)

**Step 2: Start the Server**

Open **one terminal** and run:

```bash
ADMIN_PRIVATE_KEY=your_ganache_private_key_here CONTRACT_ADDRESS=your_contract_address_here npm run dev
```

**Real example (replace with your actual values):**
```bash
ADMIN_PRIVATE_KEY=0x44a07921aa3b211c7d94875b19778d52804840e095e9dc76682f303efca5de1e CONTRACT_ADDRESS=0x2500eFCCfB8e10718DEB2F54De55109d4D408c42 npm run dev
```

**Step 3: Keep Ganache Running**
- Ensure Ganache application stays open on port 7545

### 7. Access the Application

Open your browser and navigate to:
```
http://localhost:3001
```

**⚠️ Important Notes:**
- **No separate frontend server needed** - everything runs on port 3001
- **You need BOTH values** - CONTRACT_ADDRESS alone won't work for admin functions
- **Don't share your private key** - it's only for local development

## 📖 Usage Guide

### For Admin (You)

1. **Connect Admin Wallet:**
   - Click "Connect MetaMask Wallet"
   - Select your admin account
   - Ensure you're on Ganache network (Chain ID: 1337)

2. **Access Admin Panel:**
   - Click "Admin Panel" button
   - Only available for admin address

3. **Add Candidates:**
   - Go to "Candidate Management" tab
   - Fill in candidate name and party
   - Click "Add Candidate" (MetaMask will popup for confirmation)
   - Pay gas fee to add candidate to blockchain

4. **Start Voting Session:**
   - Go to "Session Management" tab  
   - Enter session name (e.g., "Presidential Election 2024")
   - Set duration in minutes
   - Click "Start New Session" (MetaMask confirmation required)

5. **Monitor Votes:**
   - Go to "Vote Tracking" tab
   - See real-time vote counts and percentages
   - Watch live updates as people vote

6. **End Session:**
   - Click "End Current Session" when voting period is over
   - Clear candidates if needed for next session

### For Voters (Test Users)

1. **Setup:**
   - Install MetaMask
   - Add Ganache network (settings provided above)
   - Import a test account from Ganache (not the admin one)

2. **Vote:**
   - Visit the application URL
   - Connect MetaMask wallet
   - Select desired candidate from dropdown
   - Click "Submit Vote" 
   - Confirm transaction in MetaMask
   - Pay gas fee (using test ETH from Ganache)

3. **Confirmation:**
   - See vote confirmation message
   - Note: Each wallet can only vote once per session

## 🔧 Configuration

### Environment Variables

The system uses these environment variables:

```bash
# Server
CONTRACT_ADDRESS=0x2500eFCCfB8e10718DEB2F54De55109d4D408c42
ADMIN_ADDRESS=your_admin_address_here  
RPC_URL=http://127.0.0.1:7545

# Client (automatically configured)
VITE_API_URL=http://localhost:3001
```

### Port Configuration

- **Frontend**: http://localhost:5173 (Vite default)
- **Backend**: http://localhost:3001 (changed from 5000 due to macOS ControlCenter conflict)
- **Ganache**: http://127.0.0.1:7545 (default)

## 🎯 Key Features Explained

### Session-Based Voting
- Each voting session is isolated on the blockchain
- Users can vote in multiple sessions (one vote per session)
- Vote counts reset for each new session
- Session data stored permanently on-chain

### Admin Controls
- Only the deployer address has admin privileges
- Admin can add/remove candidates (when session inactive)
- Admin can start/end voting sessions
- All admin actions require MetaMask confirmation and gas fees

### Smart Contract Security
- Prevents double voting within same session
- Validates candidate existence before voting
- Enforces session timing constraints
- Transparent vote counting on blockchain

## 🐛 Troubleshooting

### Common Issues

**1. "Cannot connect to Ganache"**
- Ensure Ganache is running on port 7545
- Check RPC URL in MetaMask matches Ganache
- Verify Chain ID is 1337

**2. "Transaction failed / Insufficient funds"**
- Ensure your account has ETH in Ganache
- Check you're using the correct network in MetaMask
- Try refreshing MetaMask

**3. "Admin functions not working"**
- Verify you're connected with the admin account
- Check the contract was deployed with your address
- Ensure CONTRACT_ADDRESS environment variable is correct

**4. "MetaMask not connecting"**
- Refresh the webpage
- Reset MetaMask connection in browser settings
- Clear browser cache

**5. "Backend API errors"**
- Check server terminal for errors
- Verify CONTRACT_ADDRESS matches deployed contract
- Ensure Ganache is running and accessible

### Reset Everything

If you encounter major issues:

```bash
# 1. Stop the server (Ctrl+C in terminal)
# 2. Kill any processes using port 3001
kill -9 $(lsof -ti:3001)
# 3. Reset Ganache (restart application)
# 4. Redeploy contract (if needed)
ADMIN_PRIVATE_KEY=your_ganache_private_key node deploy-contract.js
# 5. Restart server with both environment variables
ADMIN_PRIVATE_KEY=your_private_key CONTRACT_ADDRESS=your_contract_address npm run dev
```

## 📁 Project Structure

```
eth-vote-genesis/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── contexts/      # Web3 context
│   │   ├── pages/         # Main pages
│   │   └── utils/         # Helper functions
├── server/                # Node.js backend  
│   ├── routes.ts         # API endpoints
│   ├── index.ts          # Server entry
│   └── web3/             # Blockchain integration
├── contracts/            # Solidity smart contracts
│   └── Election.sol      # Main voting contract
├── scripts/              # Deployment scripts
├── deploy-contract.js    # Contract deployment
└── hardhat.config.cjs    # Hardhat configuration
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Ethereum Foundation** for blockchain technology
- **MetaMask** for wallet integration
- **Hardhat** for development framework
- **React** and **TailwindCSS** for UI components

## 📞 Support

If you encounter any issues or have questions:

1. Check the troubleshooting section above
2. Review Ganache and MetaMask configurations  
3. Open an issue on GitHub with:
   - Error messages
   - Console logs
   - Steps to reproduce

---

**Happy Voting! 🗳️✨**

*Built with ❤️ for transparent democracy* 