
import React from 'react';
import { Link } from 'wouter';
import { WalletConnection } from '@/components/WalletConnection';
import { VotingInterface } from '@/components/VotingInterface';
import { Vote } from 'lucide-react';
import { useWeb3 } from '../contexts/Web3Context';

const Index = () => {
  const { isConnected, account, currentSession, candidates } = useWeb3();

  return (
    <div className="min-h-screen bg-gradient-main">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 glass-card">
              <Vote className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-white">EthVote</h1>
          </div>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Secure, transparent, and decentralized voting powered by Ethereum blockchain
          </p>
          {currentSession && currentSession.isActive && (
            <div className="mt-4 glass-card inline-block px-4 py-2">
              <p className="text-white font-medium">Active Session: {currentSession.title}</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-center mb-8">
          <Link 
            to="/admin" 
            className="glass-button px-6 py-3 text-white font-medium hover:text-white/90 transition-colors"
          >
            Admin Panel
          </Link>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto grid gap-8 md:grid-cols-1 lg:grid-cols-2">
          {/* Wallet Connection Card */}
          <div className="glass-card p-8 animate-scale-in">
            <WalletConnection />
          </div>

          {/* Voting Interface Card */}
          <div className="glass-card p-8 animate-scale-in" style={{ animationDelay: '0.1s' }}>
            <VotingInterface />
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          <div className="glass-card p-6 text-center animate-fade-in hover:bg-white/20 transition-all duration-300 cursor-pointer" style={{ animationDelay: '0.2s' }}>
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🔒</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 hover:text-white mb-2 transition-colors duration-300">Secure</h3>
            <p className="text-gray-800 hover:text-white/90 transition-colors duration-300">Blockchain-powered security ensures your vote is protected and tamper-proof</p>
          </div>
          
          <div className="glass-card p-6 text-center animate-fade-in hover:bg-white/20 transition-all duration-300 cursor-pointer" style={{ animationDelay: '0.3s' }}>
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">👁️</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 hover:text-white mb-2 transition-colors duration-300">Transparent</h3>
            <p className="text-gray-800 hover:text-white/90 transition-colors duration-300">All votes are recorded on the blockchain for complete transparency</p>
          </div>
          
          <div className="glass-card p-6 text-center animate-fade-in hover:bg-white/20 transition-all duration-300 cursor-pointer" style={{ animationDelay: '0.4s' }}>
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚡</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 hover:text-white mb-2 transition-colors duration-300">Decentralized</h3>
            <p className="text-gray-800 hover:text-white/90 transition-colors duration-300">No central authority controls the voting process</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
