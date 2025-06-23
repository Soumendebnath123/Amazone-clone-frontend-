# EthVote - Local Deployment Guide

## Prerequisites
- Node.js and npm installed
- Ganache running on your local machine
- MetaMask browser extension

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create a `.env` file in the root directory:
```
CONTRACT_ADDRESS=
ADMIN_PRIVATE_KEY=your_ganache_first_account_private_key
RPC_URL=http://127.0.0.1:7545
NETWORK_ID=5777
```

### 3. Deploy Smart Contract
```bash
# Compile the contract
npx hardhat compile --config hardhat.config.cjs

# Deploy to your local Ganache
npx hardhat run scripts/deploy.cjs --network ganache --config hardhat.config.cjs
```

After deployment, you'll see output like:
```
Election contract deployed to: 0x...
Transaction hash: 0x...
Deployed by: 0x... (your admin address)
```

### 4. Update Environment with Contract Address
Copy the contract address from the deployment output and update your `.env` file:
```
CONTRACT_ADDRESS=0x... # Paste the deployed contract address here
ADMIN_PRIVATE_KEY=your_ganache_first_account_private_key
RPC_URL=http://127.0.0.1:7545
NETWORK_ID=5777
```

### 5. Configure MetaMask
1. Open MetaMask and add a new network:
   - Network Name: Ganache Local
   - New RPC URL: http://127.0.0.1:7545
   - Chain ID: 5777
   - Currency Symbol: ETH

2. Import your Ganache account:
   - Click "Import Account"
   - Paste your Ganache account private key

### 6. Start the Application
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Usage

### Admin Functions (using the imported Ganache account)
1. **Add Candidates**: Go to `/admin` and add candidates for the election
2. **Start Voting Session**: Create a new voting session with a title and duration
3. **Monitor Votes**: View real-time voting results
4. **End Session**: Stop the voting session when complete

### Voter Functions (using any MetaMask account)
1. **Connect Wallet**: Connect your MetaMask wallet to the application
2. **View Candidates**: See all available candidates
3. **Cast Vote**: Vote for your preferred candidate (one vote per address)
4. **View Results**: See current voting results

## Smart Contract Functions

The Election contract includes:
- `addCandidate(name, info)` - Add a new candidate (admin only)
- `startSession(title, durationInMinutes)` - Start voting session (admin only)
- `vote(candidateId)` - Cast a vote (voters)
- `endSession()` - End voting session (admin only)
- `getAllCandidates()` - Get all candidates
- `getSessionStatus()` - Get current session info
- `userHasVoted(address)` - Check if address has voted

## API Endpoints

- `GET /api/candidates` - Get all candidates
- `POST /api/candidates` - Add candidate (admin)
- `GET /api/session` - Get session status
- `POST /api/session/start` - Start session (admin)
- `POST /api/session/end` - End session (admin)
- `GET /api/vote/status/:address` - Check vote status
- `POST /api/vote` - Cast vote
- `GET /api/contract/info` - Get contract information

## Troubleshooting

### Connection Issues
- Ensure Ganache is running on port 7545
- Check that MetaMask is connected to the Ganache network
- Verify the contract address is correctly set in `.env`

### Transaction Failures
- Make sure you have sufficient ETH in your account
- Check that you're connected to the correct network (Chain ID: 5777)
- Ensure the voting session is active before trying to vote

### Admin Functions Not Working
- Verify you're using the admin account (first account from Ganache)
- Check that the private key is correctly set in the environment

## Security Notes
- The private key provided is for development only
- Never use this private key on mainnet or public networks
- Always use test networks for development and testing