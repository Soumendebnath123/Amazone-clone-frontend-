
import React from 'react';

interface Candidate {
  id: string;
  name: string;
  votes: number;
  info?: string;
}

interface VoteTrackingProps {
  candidates: Candidate[];
}

export const VoteTracking: React.FC<VoteTrackingProps> = ({ candidates }) => {
  const totalVotes = candidates.reduce((sum, candidate) => sum + candidate.votes, 0);
  const sortedCandidates = [...candidates].sort((a, b) => b.votes - a.votes);

  const getPercentage = (votes: number) => {
    return totalVotes > 0 ? (votes / totalVotes * 100).toFixed(1) : '0.0';
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Vote Tracking</h2>
        <p className="text-white/70">Real-time voting results</p>
      </div>

      <div className="glass-card p-4 text-center">
        <div className="text-3xl font-bold text-white">{totalVotes}</div>
        <div className="text-white/70">Total Votes Cast</div>
      </div>

      <div className="space-y-4">
        {sortedCandidates.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-white/70">No candidates available</p>
          </div>
        ) : (
          sortedCandidates.map((candidate, index) => (
            <div key={candidate.id} className="glass-card p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                    index === 0 ? 'bg-yellow-500' : 
                    index === 1 ? 'bg-gray-400' : 
                    index === 2 ? 'bg-amber-600' : 'bg-white/20'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <div className="text-white font-medium">{candidate.name}</div>
                    {candidate.info && (
                      <div className="text-white/70 text-xs">{candidate.info}</div>
                    )}
                    <div className="text-white/60 text-sm">{getPercentage(candidate.votes)}%</div>
                  </div>
                </div>
                <div className="text-white font-bold">{candidate.votes}</div>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-white/10 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-400 to-pink-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${getPercentage(candidate.votes)}%` }}
                ></div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="text-center">
        <p className="text-xs text-white/60">
          Results update in real-time as votes are cast on the blockchain
        </p>
      </div>
    </div>
  );
};
