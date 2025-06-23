import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useWeb3 } from '../contexts/Web3Context';
import { parseVotingError, getVotingErrorIcon } from '@/utils/errorHandler';

interface VotingInterfaceProps {
  walletConnected?: boolean;
  walletAddress?: string;
}

export const VotingInterface: React.FC<VotingInterfaceProps> = ({}) => {
  const [selectedCandidate, setSelectedCandidate] = useState<string>('');
  const [voteStatus, setVoteStatus] = useState<string>('');
  const [isVoting, setIsVoting] = useState<boolean>(false);
  
  const {
    isConnected,
    account,
    candidates,
    currentSession,
    userHasVoted,
    loading,
    castVote,
    refreshElectionData
  } = useWeb3();

  useEffect(() => {
    if (isConnected) {
      refreshElectionData();
    }
  }, [isConnected, refreshElectionData]);

  // Reset voting state when component mounts or when session changes
  useEffect(() => {
    setIsVoting(false);
    setVoteStatus('');
  }, [currentSession?.id]);

  // Get the selected candidate name for display
  const selectedCandidateName = selectedCandidate 
    ? candidates.find(c => c.id === selectedCandidate)?.name || 'Unknown'
    : null;

  const handleVote = async () => {
    console.log('Vote button clicked!'); // Debug log
    console.log('Selected candidate:', selectedCandidate); // Debug log
    console.log('Is connected:', isConnected); // Debug log
    console.log('Current session:', currentSession); // Debug log
    console.log('User has voted:', userHasVoted); // Debug log
    
    // Basic validation
    if (!selectedCandidate) {
      setVoteStatus('❌ Please select a candidate before voting');
      setTimeout(() => setVoteStatus(''), 3000);
      return;
    }

    if (!isConnected) {
      setVoteStatus('❌ Please connect your wallet to vote');
      setTimeout(() => setVoteStatus(''), 3000);
      return;
    }

    if (!currentSession || !currentSession.isActive) {
      setVoteStatus('❌ No active voting session');
      setTimeout(() => setVoteStatus(''), 3000);
      return;
    }

    if (userHasVoted) {
      setVoteStatus('❌ You have already voted in this session');
      setTimeout(() => setVoteStatus(''), 3000);
      return;
    }

    try {
      setIsVoting(true);
      setVoteStatus('🔄 Preparing transaction...');
      
      // Add a small delay to show the status message
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setVoteStatus(`🔄 Please confirm in MetaMask to vote for ${selectedCandidateName}...`);
      console.log('About to call castVote with candidateId:', selectedCandidate); // Debug log
      console.log('castVote function exists:', typeof castVote); // Debug log
      
      // This should trigger MetaMask popup
      const txHash = await castVote(selectedCandidate);
      
      console.log('Vote successful! TX Hash:', txHash); // Debug log
      setVoteStatus(`✅ Vote for ${selectedCandidateName} recorded! TX: ${txHash.substring(0, 10)}...`);
      
      // Clear selection after successful vote
      setSelectedCandidate('');
      
      // Clear status after 8 seconds
      setTimeout(() => {
        setVoteStatus('');
        setIsVoting(false);
      }, 8000);
      
    } catch (error: any) {
      console.error('Vote error details:', error); // Debug log
      
      let errorMessage = 'Failed to submit vote';
      
      if (error?.message) {
        if (error.message.includes('user rejected') || error.message.includes('User denied')) {
          errorMessage = 'Transaction was cancelled by user';
        } else if (error.message.includes('insufficient funds')) {
          errorMessage = 'Insufficient ETH for gas fees';
        } else if (error.message.includes('already voted')) {
          errorMessage = 'You have already voted in this session';
        } else {
          errorMessage = error.message;
        }
      }
      
      setVoteStatus(`❌ ${errorMessage}`);
      setTimeout(() => {
        setVoteStatus('');
        setIsVoting(false);
      }, 5000);
    }
  };

  if (!isConnected) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Cast Your Vote</h2>
          <p className="text-white/70">Connect your wallet to participate in voting</p>
        </div>
        
        <div className="glass-card p-8 text-center">
          <div className="text-white/60 text-lg">🔒</div>
          <p className="text-white/70 mt-2">Wallet connection required</p>
        </div>
      </div>
    );
  }

  if (!currentSession || !currentSession.isActive) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">No Active Session</h2>
          <p className="text-white/70">No voting session is currently active</p>
        </div>
        
        <div className="glass-card p-8 text-center">
          <div className="text-white/60 text-lg">⏰</div>
          <p className="text-white/70 mt-2">Please wait for an admin to start a voting session</p>
        </div>
      </div>
    );
  }

  if (userHasVoted) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Vote Submitted</h2>
          <p className="text-white/70">Thank you for participating!</p>
        </div>
        
        <div className="glass-card p-8 text-center">
          <div className="text-green-400 text-4xl mb-4">✓</div>
          <p className="text-white">Your vote has been recorded on the blockchain</p>
          <p className="text-white/70 text-sm mt-2">Session: {currentSession.title}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Cast Your Vote</h2>
        <p className="text-white/70">Select your preferred candidate</p>
        {currentSession && (
          <p className="text-white/60 text-sm mt-1">Session: {currentSession.title}</p>
        )}
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-white font-medium">Select Candidate</label>
          <Select 
            value={selectedCandidate} 
            onValueChange={setSelectedCandidate}
            disabled={!currentSession || !currentSession.isActive || candidates.length === 0}
          >
            <SelectTrigger className="glass-button text-white border-white/30 disabled:opacity-50 disabled:cursor-not-allowed">
              <SelectValue 
                placeholder={
                  !currentSession || !currentSession.isActive 
                    ? "No active voting session" 
                    : candidates.length === 0 
                      ? "No candidates available"
                      : "Choose a candidate"
                } 
              />
            </SelectTrigger>
            <SelectContent className="bg-white/90 backdrop-blur-md border-white/30">
              {candidates.length > 0 ? (
                candidates.map((candidate) => (
                  <SelectItem 
                    key={candidate.id} 
                    value={candidate.id} 
                    className="p-2 focus:bg-gray-100 [&>span[data-state=checked]]:hidden [&[data-state=checked]>span]:hidden"
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className="font-medium text-gray-900">{candidate.name}</span>
                      <span className="text-sm text-gray-600">{candidate.info || 'Independent'}</span>
                    </div>
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-candidates" disabled>
                  <span className="text-gray-500">No candidates available</span>
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          
          {/* Helper text for disabled state */}
          {(!currentSession || !currentSession.isActive) && (
            <p className="text-white/60 text-sm">
              ⏰ Voting session must be active to select candidates
            </p>
          )}
          
          {candidates.length === 0 && currentSession && currentSession.isActive && (
            <p className="text-white/60 text-sm">
              👥 No candidates have been added to this election yet
            </p>
          )}
        </div>

        <button 
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('=== BUTTON CLICK DEBUG ===');
            console.log('Button clicked!');
            console.log('selectedCandidate:', selectedCandidate);
            console.log('loading:', loading);
            console.log('isVoting:', isVoting);
            console.log('currentSession:', currentSession);
            console.log('userHasVoted:', userHasVoted);
            console.log('=== END DEBUG ===');
            handleVote();
          }}
          disabled={
            isVoting || 
            !selectedCandidate || 
            userHasVoted ||
            !currentSession?.isActive ||
            candidates.length === 0
          }
          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-medium py-6 text-lg rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {isVoting
            ? 'Submitting Vote...' 
            : userHasVoted
              ? 'Already Voted'
              : !currentSession || !currentSession.isActive
                ? 'No Active Session'
                : candidates.length === 0
                  ? 'No Candidates Available'
                  : !selectedCandidate
                    ? 'Select a Candidate'
                    : 'Submit Vote'
          }
        </button>

        {/* Vote Status Display */}
        {voteStatus && (
          <div className="glass-card p-4 text-center">
            <p className="text-white font-medium">{voteStatus}</p>
          </div>
        )}


      </div>

      <div className="text-center">
        <p className="text-xs text-white/60">
          Your vote will be permanently recorded on the Ethereum blockchain
        </p>
      </div>
    </div>
  );
};