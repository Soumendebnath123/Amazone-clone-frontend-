
import React from 'react';
import { Link } from 'wouter';
import { SessionManagement } from '@/components/SessionManagement';
import { CandidateManagement } from '@/components/CandidateManagement';
import { VoteTracking } from '@/components/VoteTracking';
import { Vote, ChevronLeft } from 'lucide-react';
import { useWeb3 } from '../contexts/Web3Context';

const Admin = () => {
  // Get real blockchain data from Web3Context
  const { candidates, currentSession, totalVotes, isConnected } = useWeb3();

  return (
    <div className="min-h-screen bg-gradient-main">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-12 animate-fade-in">
          <div className="flex items-center gap-4">
            <div className="p-3 glass-card">
              <Vote className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Admin Panel</h1>
              <p className="text-white/80">Manage voting sessions and candidates</p>
            </div>
          </div>
          
          <Link 
            to="/" 
            className="glass-button px-6 py-3 text-white font-medium hover:text-white/90 transition-colors flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Voting
          </Link>
        </div>

        {/* Connection Status */}
        {!isConnected && (
          <div className="mb-8 glass-card p-4 text-center">
            <p className="text-yellow-300 font-medium">⚠️ Please connect your MetaMask wallet to use admin functions</p>
          </div>
        )}

        {/* Admin Grid */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Session Management */}
          <div className="glass-card p-8 animate-scale-in">
            <SessionManagement />
          </div>

          {/* Vote Tracking */}
          <div className="glass-card p-8 animate-scale-in" style={{ animationDelay: '0.1s' }}>
            <VoteTracking candidates={candidates} />
          </div>

          {/* Candidate Management - Full Width */}
          <div className="lg:col-span-2 glass-card p-8 animate-scale-in" style={{ animationDelay: '0.2s' }}>
            <CandidateManagement />
          </div>
        </div>

        {/* Quick Stats - Real Blockchain Data */}
        <div className="mt-12 grid gap-6 md:grid-cols-4">
          <div className="glass-card p-6 text-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="text-3xl font-bold text-white mb-2">{candidates.length}</div>
            <div className="text-white/70">Blockchain Candidates</div>
          </div>
          
          <div className="glass-card p-6 text-center animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="text-3xl font-bold text-white mb-2">{totalVotes}</div>
            <div className="text-white/70">Blockchain Votes</div>
          </div>
          
          <div className="glass-card p-6 text-center animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <div className="text-3xl font-bold text-white mb-2">
              {currentSession && currentSession.isActive ? '1' : '0'}
            </div>
            <div className="text-white/70">Active Sessions</div>
          </div>
          
          <div className="glass-card p-6 text-center animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <div className="text-3xl font-bold text-white mb-2">🔗</div>
            <div className="text-white/70">Blockchain Powered</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
