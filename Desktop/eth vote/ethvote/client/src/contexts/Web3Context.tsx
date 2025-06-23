import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ethers } from 'ethers';
import type { Candidate, VotingSession } from '../../../shared/schema';

interface Web3ContextType {
  // Wallet state
  account: string | null;
  isConnected: boolean;
  provider: ethers.providers.Web3Provider | null;
  signer: ethers.Signer | null;
  chainId: number | null;
  
  // Contract state
  electionContract: ethers.Contract | null;
  contractAddress: string | null;
  
  // Election data
  candidates: Candidate[];
  currentSession: VotingSession | null;
  userHasVoted: boolean;
  totalVotes: number;
  
  // Actions
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  refreshElectionData: () => Promise<void>;
  castVote: (candidateId: string) => Promise<string>;
  
  // Admin actions
  addCandidate: (name: string, info?: string) => Promise<string>;
  removeCandidate: (candidateId: string) => Promise<string>;
  startSession: (title: string, durationInMinutes: number) => Promise<string>;
  endSession: () => Promise<string>;
  
  // Loading states
  loading: boolean;
  error: string | null;
}

const Web3Context = createContext<Web3ContextType | null>(null);

// Contract ABI (same as backend)
const ELECTION_ABI = [
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
  
  "event CandidateAdded(uint256 indexed id, string name, string info)",
  "event CandidateRemoved(uint256 indexed id)",
  "event VoteCast(address indexed voter, uint256 indexed candidateId)",
  "event SessionStarted(uint256 indexed sessionId, string title, uint256 startTime, uint256 endTime)",
  "event SessionEnded(uint256 indexed sessionId)"
];

interface Web3ProviderProps {
  children: ReactNode;
}

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  // Wallet state
  const [account, setAccount] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  
  // Contract state
  const [electionContract, setElectionContract] = useState<ethers.Contract | null>(null);
  const [contractAddress, setContractAddress] = useState<string | null>(null);
  
  // Election data
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [currentSession, setCurrentSession] = useState<VotingSession | null>(null);
  const [userHasVoted, setUserHasVoted] = useState(false);
  const [totalVotes, setTotalVotes] = useState(0);
  
  // Loading states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load Web3 configuration from backend
  const loadWeb3Config = async () => {
    try {
      const response = await fetch('/api/web3/config');
      const config = await response.json();
      setContractAddress(config.contractAddress);
      return config;
    } catch (error) {
      console.error('Failed to load Web3 config:', error);
      throw error;
    }
  };

  // Connect to MetaMask wallet
  const connectWallet = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!window.ethereum) {
        throw new Error('MetaMask is not installed. Please install MetaMask to use this application.');
      }

      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
      const web3Signer = web3Provider.getSigner();
      const userAccount = await web3Signer.getAddress();
      const network = await web3Provider.getNetwork();

      // Load contract configuration
      const config = await loadWeb3Config();
      
      if (!config.contractAddress) {
        throw new Error('Contract not deployed. Please deploy the Election contract first.');
      }

      // Check if we're on the right network
      if (network.chainId !== config.networkId) {
        throw new Error(`Please switch to the correct network (Chain ID: ${config.networkId})`);
      }

      // Initialize contract
      const contract = new ethers.Contract(config.contractAddress, ELECTION_ABI, web3Signer);

      setProvider(web3Provider);
      setSigner(web3Signer);
      setAccount(userAccount);
      setChainId(network.chainId);
      setElectionContract(contract);
      setIsConnected(true);

      // Load initial election data
      await refreshElectionData();

    } catch (error: any) {
      setError(error.message);
      console.error('Wallet connection failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setAccount(null);
    setIsConnected(false);
    setProvider(null);
    setSigner(null);
    setChainId(null);
    setElectionContract(null);
    setCandidates([]);
    setCurrentSession(null);
    setUserHasVoted(false);
    setTotalVotes(0);
    setError(null);
  };

  // Refresh election data from blockchain
  const refreshElectionData = async () => {
    if (!electionContract || !account) return;

    try {
      setLoading(true);

      // Fetch candidates
      const candidatesData = await electionContract.getAllCandidates();
      const formattedCandidates = candidatesData.map((candidate: any) => ({
        id: candidate.id.toString(),
        name: candidate.name,
        info: candidate.info || '',
        votes: candidate.voteCount.toNumber(),
      }));

      // Fetch session status
      const sessionData = await electionContract.getSessionStatus();
      const sessionFormatted = sessionData.isActive ? {
        id: sessionData.id.toString(),
        title: sessionData.title,
        startTime: sessionData.startTime.toNumber(),
        endTime: sessionData.endTime.toNumber(),
        isActive: sessionData.isActive,
      } : null;

      // Check if user has voted in current session
      let hasVoted = false;
      if (sessionFormatted && sessionFormatted.isActive) {
        // Only check if user voted if there's an active session
        hasVoted = await electionContract.userHasVoted(account);
      }
      
      // Get total votes
      const total = await electionContract.getTotalVotes();

      setCandidates(formattedCandidates);
      setCurrentSession(sessionFormatted);
      setUserHasVoted(hasVoted);
      setTotalVotes(total.toNumber());

    } catch (error: any) {
      setError(`Failed to refresh election data: ${error.message}`);
      console.error('Failed to refresh election data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cast vote
  const castVote = async (candidateId: string): Promise<string> => {
    console.log('=== CAST VOTE DEBUG START ==='); // Debug log
    console.log('candidateId:', candidateId); // Debug log
    console.log('electionContract:', !!electionContract); // Debug log
    console.log('account:', account); // Debug log
    console.log('provider:', !!provider); // Debug log
    console.log('signer:', !!signer); // Debug log
    
    if (!electionContract || !account) {
      throw new Error('Contract or account not initialized');
    }

    if (!signer) {
      throw new Error('Signer not available - MetaMask may not be connected');
    }

    try {
      setLoading(true);
      
      // Use the contract with signer to ensure MetaMask gets triggered
      const contractWithSigner = electionContract.connect(signer);
      console.log('Contract with signer created'); // Debug log
      
      console.log('Available functions:', Object.keys(contractWithSigner.functions || {})); // Debug log
      
      // Check if vote method exists
      if (!contractWithSigner.vote) {
        throw new Error('Vote method not found on contract');
      }
      
      console.log('Calling vote function...'); // Debug log
      const tx = await contractWithSigner.vote(candidateId);
      console.log('Transaction created:', tx.hash); // Debug log
      
      console.log('Waiting for transaction confirmation...'); // Debug log
      const receipt = await tx.wait();
      console.log('Transaction confirmed! Receipt:', receipt); // Debug log
      
      // Refresh data after voting
      await refreshElectionData();
      
      console.log('=== CAST VOTE DEBUG END ==='); // Debug log
      return tx.hash;
    } catch (error: any) {
      console.error('=== CAST VOTE ERROR ==='); // Debug log
      console.error('Full error object:', error); // Debug log
      console.error('Error message:', error?.message); // Debug log
      console.error('Error reason:', error?.reason); // Debug log
      console.error('Error code:', error?.code); // Debug log
      
      setError(`Failed to cast vote: ${error?.reason || error?.message || 'Unknown error'}`);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Admin function: Add candidate
  const addCandidate = async (name: string, info: string = ''): Promise<string> => {
    if (!electionContract) {
      throw new Error('Contract not initialized');
    }

    try {
      setLoading(true);
      const tx = await electionContract.addCandidate(name, info);
      await tx.wait();
      
      await refreshElectionData();
      return tx.hash;
    } catch (error: any) {
      setError(`Failed to add candidate: ${error.message}`);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Admin function: Remove candidate
  const removeCandidate = async (candidateId: string): Promise<string> => {
    if (!electionContract) {
      throw new Error('Contract not initialized');
    }

    try {
      setLoading(true);
      const tx = await electionContract.removeCandidate(candidateId);
      await tx.wait();
      
      await refreshElectionData();
      return tx.hash;
    } catch (error: any) {
      const errorMessage = error?.reason || error?.message || 'Failed to remove candidate';
      setError(`Failed to remove candidate: ${errorMessage}`);
      console.error('Remove candidate error details:', {
        message: error?.message,
        reason: error?.reason,
        code: error?.code,
        error
      });
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Admin function: Start session (clears all previous data)
  const startSession = async (title: string, durationInMinutes: number): Promise<string> => {
    if (!electionContract) {
      throw new Error('Contract not initialized');
    }

    try {
      setLoading(true);
      
      // First, clear all existing candidates and reset votes
      const tx = await electionContract.startSession(title, durationInMinutes);
      await tx.wait();
      
      // Clear local state immediately for better UX
      setCandidates([]);
      setTotalVotes(0);
      setUserHasVoted(false);
      
      await refreshElectionData();
      return tx.hash;
    } catch (error: any) {
      setError(`Failed to start session: ${error.message}`);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Admin function: End session
  const endSession = async (): Promise<string> => {
    if (!electionContract) {
      throw new Error('Contract not initialized');
    }

    try {
      setLoading(true);
      const tx = await electionContract.endSession();
      await tx.wait();
      
      await refreshElectionData();
      return tx.hash;
    } catch (error: any) {
      setError(`Failed to end session: ${error.message}`);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Handle account changes
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else if (accounts[0] !== account) {
          connectWallet();
        }
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, [account]);

  const value: Web3ContextType = {
    account,
    isConnected,
    provider,
    signer,
    chainId,
    electionContract,
    contractAddress,
    candidates,
    currentSession,
    userHasVoted,
    totalVotes,
    connectWallet,
    disconnectWallet,
    refreshElectionData,
    castVote,
    addCandidate,
    removeCandidate,
    startSession,
    endSession,
    loading,
    error,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};

export const useWeb3 = (): Web3ContextType => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

// Type declaration for window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}