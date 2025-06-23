import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { ElectionService } from "./web3/electionService";
import { Web3ConfigManager } from "./web3/config";

// Initialize Web3 configuration
const web3Config = new Web3ConfigManager({
  contractAddress: process.env.CONTRACT_ADDRESS || '',
  networkId: parseInt(process.env.NETWORK_ID || '1337'),
  rpcUrl: process.env.RPC_URL || 'http://127.0.0.1:7545'
});

const electionService = new ElectionService(web3Config, process.env.ADMIN_PRIVATE_KEY);

export async function registerRoutes(app: Express): Promise<Server> {
  // Web3 and Voting API Routes
  
  // Get all candidates
  app.get("/api/candidates", async (req, res) => {
    try {
      const candidates = await electionService.getCandidates();
      res.json(candidates);
    } catch (error) {
      console.error('Error fetching candidates:', error);
      res.status(500).json({ error: 'Failed to fetch candidates' });
    }
  });

  // Add candidate (admin only)
  app.post("/api/candidates", async (req, res) => {
    try {
      const { name, info } = req.body;
      if (!name) {
        return res.status(400).json({ error: 'Candidate name is required' });
      }

      const txHash = await electionService.addCandidate(name, info || '');
      res.json({ success: true, transactionHash: txHash });
    } catch (error) {
      console.error('Error adding candidate:', error);
      res.status(500).json({ error: 'Failed to add candidate' });
    }
  });

  // Remove candidate (admin only)
  app.delete("/api/candidates/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const txHash = await electionService.removeCandidate(id);
      res.json({ success: true, transactionHash: txHash });
    } catch (error) {
      console.error('Error removing candidate:', error);
      res.status(500).json({ error: 'Failed to remove candidate' });
    }
  });

  // Get voting session status
  app.get("/api/session", async (req, res) => {
    try {
      const session = await electionService.getSessionStatus();
      const isActive = await electionService.isSessionActive();
      const timeRemaining = await electionService.getTimeRemaining();
      
      res.json({
        session,
        isActive,
        timeRemaining
      });
    } catch (error) {
      console.error('Error fetching session status:', error);
      res.status(500).json({ error: 'Failed to fetch session status' });
    }
  });

  // Start voting session (admin only)
  app.post("/api/session/start", async (req, res) => {
    try {
      const { title, durationInMinutes } = req.body;
      if (!title || !durationInMinutes) {
        return res.status(400).json({ error: 'Title and duration are required' });
      }

      // Start the new session (this will reset vote counts but keep candidates)
      const txHash = await electionService.startSession(title, durationInMinutes);
      res.json({ success: true, transactionHash: txHash });
    } catch (error: any) {
      console.error('Error starting session:', error);
      res.status(500).json({ error: error.message || 'Failed to start voting session' });
    }
  });

  // Clear all candidates (admin only) - separate endpoint for better control
  app.post("/api/candidates/clear", async (req, res) => {
    try {
      const candidates = await electionService.getCandidates();
      const clearOperations = [];
      
      for (const candidate of candidates) {
        try {
          const clearTx = await electionService.removeCandidate(candidate.id);
          clearOperations.push(clearTx);
          console.log(`Cleared candidate ${candidate.id}: ${candidate.name}`);
        } catch (error) {
          console.log(`Failed to clear candidate ${candidate.id}, continuing...`);
        }
      }
      
      res.json({ 
        success: true, 
        clearedCandidates: clearOperations.length,
        message: `${clearOperations.length} candidates cleared`
      });
    } catch (error: any) {
      console.error('Error clearing candidates:', error);
      res.status(500).json({ error: error.message || 'Failed to clear candidates' });
    }
  });

  // End voting session (admin only)
  app.post("/api/session/end", async (req, res) => {
    try {
      const txHash = await electionService.endSession();
      res.json({ success: true, transactionHash: txHash });
    } catch (error) {
      console.error('Error ending session:', error);
      res.status(500).json({ error: 'Failed to end voting session' });
    }
  });

  // Check if user has voted
  app.get("/api/vote/status/:address", async (req, res) => {
    try {
      const { address } = req.params;
      const hasVoted = await electionService.hasUserVoted(address);
      res.json({ hasVoted });
    } catch (error) {
      console.error('Error checking vote status:', error);
      res.status(500).json({ error: 'Failed to check vote status' });
    }
  });

  // Cast vote (requires signed transaction from frontend)
  app.post("/api/vote", async (req, res) => {
    try {
      const { candidateId, voterPrivateKey } = req.body;
      if (!candidateId || !voterPrivateKey) {
        return res.status(400).json({ error: 'Candidate ID and voter private key are required' });
      }

      const voteTransaction = await electionService.castVote(candidateId, voterPrivateKey);
      res.json({ success: true, transaction: voteTransaction });
    } catch (error: any) {
      console.error('Error casting vote:', error);
      
      // Handle specific error cases
      let errorMessage = 'Failed to cast vote';
      if (error.message.includes('already voted')) {
        errorMessage = 'You have already voted in this session';
        return res.status(400).json({ error: errorMessage });
      } else if (error.message.includes('session not active')) {
        errorMessage = 'Voting session is not currently active';
        return res.status(400).json({ error: errorMessage });
      } else if (error.message.includes('invalid candidate')) {
        errorMessage = 'Invalid candidate selection';
        return res.status(400).json({ error: errorMessage });
      }
      
      res.status(500).json({ error: errorMessage });
    }
  });

  // Get total votes
  app.get("/api/votes/total", async (req, res) => {
    try {
      const totalVotes = await electionService.getTotalVotes();
      res.json({ totalVotes });
    } catch (error) {
      console.error('Error fetching total votes:', error);
      res.status(500).json({ error: 'Failed to fetch total votes' });
    }
  });

  // Get contract information
  app.get("/api/contract/info", async (req, res) => {
    try {
      const contractInfo = await electionService.getContractInfo();
      res.json(contractInfo);
    } catch (error) {
      console.error('Error fetching contract info:', error);
      res.status(500).json({ error: 'Failed to fetch contract information' });
    }
  });

  // Web3 configuration endpoint
  app.get("/api/web3/config", async (req, res) => {
    try {
      res.json({
        contractAddress: web3Config.contractAddress,
        networkId: web3Config.networkId,
        rpcUrl: web3Config.rpcUrl
      });
    } catch (error) {
      console.error('Error fetching web3 config:', error);
      res.status(500).json({ error: 'Failed to fetch web3 configuration' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
