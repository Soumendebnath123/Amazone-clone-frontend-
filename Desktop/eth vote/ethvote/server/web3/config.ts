import { ethers } from 'ethers';
import type { Web3Config } from '../../shared/schema';

// Contract ABI - This will be generated when we compile the contract
export const ELECTION_ABI = [
  "constructor()",
  "function admin() view returns (address)",
  "function candidatesCount() view returns (uint256)",
  "function currentSession() view returns (tuple(uint256 id, string title, uint256 startTime, uint256 endTime, bool isActive))",
  "function candidates(uint256) view returns (tuple(uint256 id, string name, string info, uint256 voteCount))",
  "function hasVoted(address) view returns (bool)",
  "function voterChoice(address) view returns (uint256)",
  
  "function addCandidate(string name, string info)",
  "function removeCandidate(uint256 candidateId)",
  "function startSession(string title, uint256 durationInMinutes)",
  "function endSession()",
  "function vote(uint256 candidateId)",
  "function getAllCandidates() view returns (tuple(uint256 id, string name, string info, uint256 voteCount)[])",
  "function getTotalVotes() view returns (uint256)",
  "function getSessionStatus() view returns (tuple(uint256 id, string title, uint256 startTime, uint256 endTime, bool isActive))",
  "function userHasVoted(address voter) view returns (bool)",
  "function getUserVote(address voter) view returns (uint256)",
  "function isSessionActive() view returns (bool)",
  "function getTimeRemaining() view returns (uint256)",
  "function transferAdmin(address newAdmin)",
  
  "event CandidateAdded(uint256 indexed id, string name, string info)",
  "event CandidateRemoved(uint256 indexed id)",
  "event VoteCast(address indexed voter, uint256 indexed candidateId)",
  "event SessionStarted(uint256 indexed sessionId, string title, uint256 startTime, uint256 endTime)",
  "event SessionEnded(uint256 indexed sessionId)"
];

export class Web3ConfigManager {
  public provider: ethers.providers.JsonRpcProvider;
  public contractAddress: string;
  public networkId: number;
  public rpcUrl: string;

  constructor(config: {
    contractAddress: string;
    networkId: number;
    rpcUrl: string;
  }) {
    this.contractAddress = config.contractAddress;
    this.networkId = config.networkId;
    this.rpcUrl = config.rpcUrl;
    this.provider = new ethers.providers.JsonRpcProvider(config.rpcUrl, {
      name: 'ganache',
      chainId: config.networkId
    });
  }

  getContract(signerOrProvider?: ethers.Signer | ethers.providers.Provider) {
    return new ethers.Contract(
      this.contractAddress,
      ELECTION_ABI,
      signerOrProvider || this.provider
    );
  }

  async getSigner(privateKey?: string): Promise<ethers.Wallet> {
    if (privateKey) {
      return new ethers.Wallet(privateKey, this.provider);
    }
    throw new Error('Private key required for signing transactions');
  }
}

// Default configuration - will be overridden with actual values
export const defaultWeb3Config = new Web3ConfigManager({
  contractAddress: process.env.CONTRACT_ADDRESS || '',
  networkId: parseInt(process.env.NETWORK_ID || '5777'),
  rpcUrl: process.env.RPC_URL || 'http://127.0.0.1:7545'
});