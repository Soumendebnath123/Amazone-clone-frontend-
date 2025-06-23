export interface VotingError {
  type: 'USER_REJECTED' | 'INSUFFICIENT_FUNDS' | 'ALREADY_VOTED' | 'SESSION_INACTIVE' | 'NETWORK_ERROR' | 'UNKNOWN';
  message: string;
  userFriendlyMessage: string;
}

export const parseVotingError = (error: any): VotingError => {
  const errorMessage = error?.message || error?.toString() || 'Unknown error';
  
  // User rejected transaction
  if (errorMessage.includes('user rejected') || 
      errorMessage.includes('User denied') || 
      errorMessage.includes('rejected by user') ||
      errorMessage.includes('User cancelled')) {
    return {
      type: 'USER_REJECTED',
      message: errorMessage,
      userFriendlyMessage: 'Transaction was cancelled by user'
    };
  }
  
  // Insufficient funds
  if (errorMessage.includes('insufficient funds') || 
      errorMessage.includes('not enough ETH')) {
    return {
      type: 'INSUFFICIENT_FUNDS',
      message: errorMessage,
      userFriendlyMessage: 'Insufficient ETH for gas fees. Please add ETH to your wallet.'
    };
  }
  
  // Already voted
  if (errorMessage.includes('already voted') || 
      errorMessage.includes('User has already voted')) {
    return {
      type: 'ALREADY_VOTED',
      message: errorMessage,
      userFriendlyMessage: 'You have already voted in this session'
    };
  }
  
  // Session not active
  if (errorMessage.includes('session not active') || 
      errorMessage.includes('Voting session is not active') ||
      errorMessage.includes('Session has ended')) {
    return {
      type: 'SESSION_INACTIVE',
      message: errorMessage,
      userFriendlyMessage: 'Voting session is not currently active'
    };
  }
  
  // Network errors
  if (errorMessage.includes('network') || 
      errorMessage.includes('connection') ||
      errorMessage.includes('timeout') ||
      errorMessage.includes('failed to fetch')) {
    return {
      type: 'NETWORK_ERROR',
      message: errorMessage,
      userFriendlyMessage: 'Network connection error. Please check your internet connection and try again.'
    };
  }
  
  // Unknown error
  return {
    type: 'UNKNOWN',
    message: errorMessage,
    userFriendlyMessage: `An unexpected error occurred: ${errorMessage}`
  };
};

export const getVotingErrorIcon = (errorType: VotingError['type']): string => {
  switch (errorType) {
    case 'USER_REJECTED':
      return '🚫';
    case 'INSUFFICIENT_FUNDS':
      return '💰';
    case 'ALREADY_VOTED':
      return '✅';
    case 'SESSION_INACTIVE':
      return '⏰';
    case 'NETWORK_ERROR':
      return '🌐';
    default:
      return '❌';
  }
}; 