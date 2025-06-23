import { ethers } from 'ethers';
import { Web3ConfigManager, ELECTION_ABI } from './config';
import type { Candidate, VotingSession, VoteTransaction } from '../../shared/schema';

export class ElectionService {
  private web3Config: Web3ConfigManager;
  private adminPrivateKey?: string;

  constructor(web3Config: Web3ConfigManager, adminPrivateKey?: string) {
    this.web3Config = web3Config;
    this.adminPrivateKey = adminPrivateKey;
  }

  // Read-only methods (no gas required)
  async getCandidates(): Promise<Candidate[]> {
    try {
      const contract = this.web3Config.getContract();
      const candidates = await contract.getAllCandidates();
      
      return candidates.map((candidate: any) => ({
        id: candidate.id.toString(),
        name: candidate.name,
        info: candidate.info || '',
        votes: candidate.voteCount.toNumber(),
      }));
    } catch (error) {
      console.error('Error fetching candidates:', error);
      throw new Error('Failed to fetch candidates from blockchain');
    }
  }

  async getSessionStatus(): Promise<VotingSession | null> {
    try {
      const contract = this.web3Config.getContract();
      const session = await contract.getSessionStatus();
      
      if (!session.isActive && session.id.toNumber() === 0) {
        return null;
      }

      return {
        id: session.id.toString(),
        title: session.title,
        startTime: session.startTime.toNumber(),
        endTime: session.endTime.toNumber(),
        isActive: session.isActive,
      };
    } catch (error) {
      console.error('Error fetching session status:', error);
      throw new Error('Failed to fetch session status from blockchain');
    }
  }

  async hasUserVoted(address: string): Promise<boolean> {
    try {
      const contract = this.web3Config.getContract();
      return await contract.userHasVoted(address);
    } catch (error) {
      console.error('Error checking vote status:', error);
      throw new Error('Failed to check user vote status');
    }
  }

  async getTotalVotes(): Promise<number> {
    try {
      const contract = this.web3Config.getContract();
      const total = await contract.getTotalVotes();
      return total.toNumber();
    } catch (error) {
      console.error('Error fetching total votes:', error);
      throw new Error('Failed to fetch total votes');
    }
  }

  async isSessionActive(): Promise<boolean> {
    try {
      const contract = this.web3Config.getContract();
      return await contract.isSessionActive();
    } catch (error) {
      console.error('Error checking session status:', error);
      throw new Error('Failed to check session status');
    }
  }

  async getTimeRemaining(): Promise<number> {
    try {
      const contract = this.web3Config.getContract();
      const remaining = await contract.getTimeRemaining();
      return remaining.toNumber();
    } catch (error) {
      console.error('Error fetching time remaining:', error);
      throw new Error('Failed to fetch remaining time');
    }
  }

  // Admin methods (require gas and admin privileges)
  async addCandidate(name: string, info: string = ''): Promise<string> {
    if (!this.adminPrivateKey) {
      throw new Error('Admin private key required for this operation');
    }

    try {
      const signer = await this.web3Config.getSigner(this.adminPrivateKey);
      const contract = this.web3Config.getContract(signer);
      
      const tx = await contract.addCandidate(name, info);
      await tx.wait();
      
      return tx.hash;
    } catch (error) {
      console.error('Error adding candidate:', error);
      throw new Error('Failed to add candidate to blockchain');
    }
  }

  async removeCandidate(candidateId: string): Promise<string> {
    if (!this.adminPrivateKey) {
      throw new Error('Admin private key required for this operation');
    }

    try {
      const signer = await this.web3Config.getSigner(this.adminPrivateKey);
      const contract = this.web3Config.getContract(signer);
      
      const tx = await contract.removeCandidate(candidateId);
      await tx.wait();
      
      return tx.hash;
    } catch (error) {
      console.error('Error removing candidate:', error);
      throw new Error('Failed to remove candidate from blockchain');
    }
  }

  async startSession(title: string, durationInMinutes: number): Promise<string> {
    if (!this.adminPrivateKey) {
      throw new Error('Admin private key required for this operation');
    }

    try {
      const signer = await this.web3Config.getSigner(this.adminPrivateKey);
      const contract = this.web3Config.getContract(signer);
      
      const tx = await contract.startSession(title, durationInMinutes);
      await tx.wait();
      
      return tx.hash;
    } catch (error) {
      console.error('Error starting session:', error);
      throw new Error('Failed to start voting session on blockchain');
    }
  }

  async endSession(): Promise<string> {
    if (!this.adminPrivateKey) {
      throw new Error('Admin private key required for this operation');
    }

    try {
      const signer = await this.web3Config.getSigner(this.adminPrivateKey);
      const contract = this.web3Config.getContract(signer);
      
      const tx = await contract.endSession();
      await tx.wait();
      
      return tx.hash;
    } catch (error) {
      console.error('Error ending session:', error);
      throw new Error('Failed to end voting session on blockchain');
    }
  }

  // Voting method (requires user's private key or signed transaction)
  async castVote(candidateId: string, voterPrivateKey: string): Promise<VoteTransaction> {
    try {
      const signer = await this.web3Config.getSigner(voterPrivateKey);
      const contract = this.web3Config.getContract(signer);
      
      const tx = await contract.vote(candidateId);
      const receipt = await tx.wait();
      
      return {
        transactionHash: tx.hash,
        voterAddress: signer.address,
        candidateId: candidateId,
        timestamp: Math.floor(Date.now() / 1000),
        blockNumber: receipt.blockNumber,
      };
    } catch (error) {
      console.error('Error casting vote:', error);
      throw new Error('Failed to cast vote on blockchain');
    }
  }

  // Event listeners
  async setupEventListeners(callbacks: {
    onCandidateAdded?: (candidateId: string, name: string, info: string) => void;
    onVoteCast?: (voter: string, candidateId: string) => void;
    onSessionStarted?: (sessionId: string, title: string) => void;
    onSessionEnded?: (sessionId: string) => void;
  }): Promise<void> {
    const contract = this.web3Config.getContract();

    if (callbacks.onCandidateAdded) {
      contract.on('CandidateAdded', (id, name, info) => {
        callbacks.onCandidateAdded!(id.toString(), name, info);
      });
    }

    if (callbacks.onVoteCast) {
      contract.on('VoteCast', (voter, candidateId) => {
        callbacks.onVoteCast!(voter, candidateId.toString());
      });
    }

    if (callbacks.onSessionStarted) {
      contract.on('SessionStarted', (sessionId, title) => {
        callbacks.onSessionStarted!(sessionId.toString(), title);
      });
    }

    if (callbacks.onSessionEnded) {
      contract.on('SessionEnded', (sessionId) => {
        callbacks.onSessionEnded!(sessionId.toString());
      });
    }
  }

  // Utility methods
  async getContractInfo(): Promise<{
    address: string;
    admin: string;
    candidatesCount: number;
    networkId: number;
  }> {
    try {
      const contract = this.web3Config.getContract();
      const admin = await contract.admin();
      const candidatesCount = await contract.candidatesCount();
      
      return {
        address: this.web3Config.contractAddress,
        admin,
        candidatesCount: candidatesCount.toNumber(),
        networkId: this.web3Config.networkId,
      };
    } catch (error) {
      console.error('Error fetching contract info:', error);
      throw new Error('Failed to fetch contract information');
    }
  }
}