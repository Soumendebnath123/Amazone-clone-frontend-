import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useWeb3 } from '@/contexts/Web3Context';

interface Candidate {
  id: string;
  name: string;
  votes: number;
  info?: string;
}

interface CandidateManagementProps {
  // Remove props since we'll get data from Web3Context
}

export const CandidateManagement: React.FC<CandidateManagementProps> = () => {
  const [newCandidateName, setNewCandidateName] = useState('');
  const [newCandidateParty, setNewCandidateParty] = useState('');
  const [status, setStatus] = useState<string>('');

  // Get Web3 context with blockchain functions
  const { 
    candidates, 
    addCandidate, 
    removeCandidate,
    currentSession,
    refreshElectionData, 
    loading, 
    error, 
    isConnected 
  } = useWeb3();

  const handleAddCandidate = async () => {
    if (!newCandidateName.trim()) {
      setStatus('❌ Please enter a candidate name');
      return;
    }

    if (!newCandidateParty.trim()) {
      setStatus('❌ Please enter a party name');
      return;
    }

    if (!isConnected) {
      setStatus('❌ Please connect your MetaMask wallet first');
      return;
    }

    try {
      setStatus('🔄 Opening MetaMask...');
      console.log('Adding candidate:', newCandidateName); // Debug log
      
      // This will trigger MetaMask transaction popup
      const txHash = await addCandidate(newCandidateName, newCandidateParty);
      
      console.log('Candidate added, TX:', txHash); // Debug log
      setNewCandidateName('');
      setNewCandidateParty('');
      
      setStatus(`✅ ${newCandidateName} added to blockchain! TX: ${txHash.slice(0, 10)}...`);
      
      // Clear status after 5 seconds
      setTimeout(() => setStatus(''), 5000);
      
    } catch (error: any) {
      console.error('Add candidate error:', error); // Debug log
      setStatus(`❌ Failed: ${error.message || 'Failed to add candidate to blockchain'}`);
    }
  };

  const handleRemoveCandidate = async (candidateId: string, candidateName: string) => {
    if (!isConnected) {
      setStatus('❌ Please connect your MetaMask wallet first');
      return;
    }

    // Check if session is active
    if (currentSession && currentSession.isActive) {
      setStatus('❌ Cannot remove candidates during active session. End the session first.');
      setTimeout(() => setStatus(''), 5000);
      return;
    }

    // Show confirmation dialog
    const confirmed = window.confirm(`Are you sure you want to remove "${candidateName}" from the election? This action cannot be undone.`);
    if (!confirmed) {
      return;
    }

    try {
      setStatus('🔄 Opening MetaMask to remove candidate...');
      console.log('Removing candidate:', candidateId, candidateName); // Debug log
      
      // This will trigger MetaMask transaction popup
      const txHash = await removeCandidate(candidateId);
      
      console.log('Candidate removed, TX:', txHash); // Debug log
      setStatus(`✅ ${candidateName} removed from blockchain! TX: ${txHash.slice(0, 10)}...`);
      
      // Clear status after 5 seconds
      setTimeout(() => setStatus(''), 5000);
      
    } catch (error: any) {
      console.error('Remove candidate error:', error); // Debug log
      let errorMessage = 'Unknown error';
      
      if (error.message && error.message.includes('Cannot remove candidate during active session')) {
        errorMessage = 'Cannot remove candidates during active session. End the session first.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setStatus(`❌ Failed to remove candidate: ${errorMessage}`);
      setTimeout(() => setStatus(''), 5000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Candidate Management</h2>
        <p className="text-white/70">Add candidates to the blockchain election</p>
      </div>

      {/* Add New Candidate Form */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="text-lg font-semibold text-white">Add New Candidate</h3>
        
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-white font-medium">Name *</label>
            <Input
              value={newCandidateName}
              onChange={(e) => setNewCandidateName(e.target.value)}
              placeholder="Enter candidate name"
              className="glass-button text-gray-900 placeholder:text-gray-600 border-white/30 focus:text-gray-900"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-white font-medium">Party *</label>
            <Input
              value={newCandidateParty}
              onChange={(e) => setNewCandidateParty(e.target.value)}
              placeholder="Enter party name"
              className="glass-button text-gray-900 placeholder:text-gray-600 border-white/30 focus:text-gray-900"
            />
          </div>
        </div>
        
        <Button 
          onClick={handleAddCandidate}
          className="gradient-button"
          disabled={loading || !isConnected}
        >
          {loading ? 'Adding to Blockchain...' : 'Add Candidate'}
        </Button>

        {/* Status Display */}
        {status && (
          <div className="glass-card p-4 text-center mt-4">
            <p className="text-white font-medium">{status}</p>
          </div>
        )}
      </div>

      {/* Session Status Info */}
      {currentSession && currentSession.isActive && (
        <div className="glass-card p-4 bg-orange-500/20 border-orange-400/30">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
            <h4 className="text-orange-300 font-semibold">Active Session: {currentSession.title}</h4>
          </div>
          <p className="text-orange-200/80 text-sm">
            ⚠️ Individual candidate removal is disabled during active sessions. 
            To remove candidates, first end the current session.
          </p>
        </div>
      )}

      {/* Candidates List */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Current Candidates</h3>
        
        {loading && (
          <div className="text-center py-8">
            <p className="text-white/70">Loading candidates from blockchain...</p>
          </div>
        )}
        
        {!loading && candidates.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-white/70">No candidates added yet</p>
          </div>
        ) : !loading && (
          <div className="space-y-3">
            {candidates.map((candidate) => (
              <div key={candidate.id} className="glass-card p-4 flex items-center justify-between">
                <div className="flex-1">
                  <div className="text-white font-medium">{candidate.name}</div>
                  {candidate.info && (
                    <div className="text-white/70 text-sm">{candidate.info}</div>
                  )}
                  <div className="text-white/60 text-sm">{candidate.votes} votes</div>
                </div>
                
                <div className="flex gap-2">
                  <div className="text-white/60 text-sm px-2 py-1 glass-card">
                    ID: {candidate.id}
                  </div>
                  <Button
                    onClick={() => handleRemoveCandidate(candidate.id, candidate.name)}
                    size="sm"
                    variant="destructive"
                    className="text-xs"
                    disabled={currentSession?.isActive || loading}
                    title={currentSession?.isActive ? "Cannot remove candidates during active session" : "Remove candidate"}
                  >
                    {currentSession?.isActive ? 'Session Active' : 'Remove'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <p className="text-red-400">Error loading candidates: {error}</p>
          </div>
        )}
      </div>
    </div>
  );
};
