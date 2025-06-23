
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useWeb3 } from '../contexts/Web3Context';

interface SessionManagementProps {
  // Remove props since we'll get data from Web3Context
}

export const SessionManagement: React.FC<SessionManagementProps> = () => {
  const [sessionName, setSessionName] = useState('');
  const [duration, setDuration] = useState('60'); // Default 60 minutes
  const [status, setStatus] = useState<string>('');

  // Get Web3 context with blockchain functions
  const { 
    currentSession, 
    startSession, 
    endSession, 
    loading, 
    error, 
    isConnected 
  } = useWeb3();

  const handleStartSession = async () => {
    if (!sessionName.trim()) {
      setStatus('❌ Please enter a name for the voting session');
      return;
    }

    if (!isConnected) {
      setStatus('❌ Please connect your MetaMask wallet first');
      return;
    }

    try {
      const durationMinutes = parseInt(duration);
      if (isNaN(durationMinutes) || durationMinutes < 1) {
        setStatus('❌ Please enter a valid duration in minutes');
        return;
      }

      setStatus('🔄 Opening MetaMask...');
      console.log('Starting session:', sessionName, 'Duration:', durationMinutes); // Debug log

      // This will trigger MetaMask transaction popup
      const txHash = await startSession(sessionName, durationMinutes);
      
      console.log('Session started, TX:', txHash); // Debug log
      setSessionName('');
      setDuration('60');
      
      setStatus(`✅ Session "${sessionName}" started on blockchain! TX: ${txHash.slice(0, 10)}...`);
      
      // Clear status after 5 seconds
      setTimeout(() => setStatus(''), 5000);
      
    } catch (error: any) {
      console.error('Start session error:', error); // Debug log
      setStatus(`❌ Failed: ${error.message || 'Failed to start session on blockchain'}`);
    }
  };

  const handleEndSession = async () => {
    if (!isConnected) {
      setStatus('❌ Please connect your MetaMask wallet first');
      return;
    }

    try {
      setStatus('🔄 Opening MetaMask...');
      console.log('Ending session'); // Debug log

      // This will trigger MetaMask transaction popup
      const txHash = await endSession();
      
      console.log('Session ended, TX:', txHash); // Debug log
      setStatus(`✅ Session ended on blockchain! TX: ${txHash.slice(0, 10)}...`);
      
      // Clear status after 5 seconds
      setTimeout(() => setStatus(''), 5000);
      
    } catch (error: any) {
      console.error('End session error:', error); // Debug log
      setStatus(`❌ Failed: ${error.message || 'Failed to end session on blockchain'}`);
    }
  };

  const handleClearCandidates = async () => {
    if (!isConnected) {
      setStatus('❌ Please connect your MetaMask wallet first');
      return;
    }

    const confirmed = window.confirm('Are you sure you want to clear ALL candidates? This action cannot be undone and will require multiple MetaMask transactions.');
    if (!confirmed) {
      return;
    }

    try {
      setStatus('🔄 Clearing all candidates...');
      console.log('Clearing candidates'); // Debug log

      // Call the API to clear all candidates
      const response = await fetch('/api/candidates/clear', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to clear candidates');
      }

      const result = await response.json();
      console.log('Candidates cleared:', result); // Debug log
      
      setStatus(`✅ ${result.clearedCandidates} candidates cleared from blockchain!`);
      
      // Clear status after 5 seconds
      setTimeout(() => setStatus(''), 5000);
      
    } catch (error: any) {
      console.error('Clear candidates error:', error); // Debug log
      setStatus(`❌ Failed: ${error.message || 'Failed to clear candidates'}`);
      setTimeout(() => setStatus(''), 5000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Session Management</h2>
        <p className="text-white/70">Create and manage voting sessions</p>
      </div>

      {currentSession ? (
        <div className="space-y-4">
          <div className="glass-card p-4">
            <div className="text-center">
              <div className="text-sm text-white/70 mb-1">Active Session</div>
              <div className="text-white font-semibold text-lg">{currentSession.title}</div>
              <div className="mt-2 inline-flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-white/80">Live on Blockchain</span>
              </div>
            </div>
          </div>
          
          <Button 
            onClick={handleEndSession}
            variant="destructive"
            className="w-full"
            disabled={loading || !isConnected}
          >
            {loading ? 'Ending Session on Blockchain...' : 'End Current Session'}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-white font-medium">Session Name</label>
            <Input
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              placeholder="e.g., Presidential Election 2024"
              className="glass-button text-gray-900 placeholder:text-gray-600 border-white/30 focus:text-gray-900"
            />
          </div>

          <div className="space-y-2">
            <label className="text-white font-medium">Duration (minutes)</label>
            <Input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="60"
              min="1"
              className="glass-button text-gray-900 placeholder:text-gray-600 border-white/30 focus:text-gray-900"
            />
          </div>
          
          <div className="space-y-3">
            <Button 
              onClick={handleStartSession}
              disabled={loading || !isConnected}
              className="w-full gradient-button py-6"
            >
              {loading ? 'Creating Session on Blockchain...' : 'Start New Session'}
            </Button>

            <div className="flex gap-2">
              <Button 
                onClick={handleClearCandidates}
                disabled={loading || !isConnected}
                variant="outline"
                className="flex-1 glass-button text-gray-900 hover:text-white border-white/30 hover:bg-red-500/20 transition-colors duration-300"
              >
                Clear All Candidates
              </Button>
            </div>
          </div>

          {/* Status Display */}
          {status && (
            <div className="glass-card p-4 text-center mt-4">
              <p className="text-white font-medium">{status}</p>
            </div>
          )}
        </div>
      )}

      <div className="text-center">
        <p className="text-xs text-white/60">
          Sessions are deployed as smart contracts on the Ethereum blockchain
        </p>
      </div>
    </div>
  );
};
