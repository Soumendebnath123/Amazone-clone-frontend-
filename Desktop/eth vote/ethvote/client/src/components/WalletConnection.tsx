
import React from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useWeb3 } from '../contexts/Web3Context';

interface WalletConnectionProps {
  walletConnected?: boolean;
  walletAddress?: string;
  onConnect?: (connected: boolean) => void;
  onAddressChange?: (address: string) => void;
}

export const WalletConnection: React.FC<WalletConnectionProps> = ({}) => {
  const { toast } = useToast();
  const {
    account,
    isConnected,
    loading,
    error,
    chainId,
    connectWallet,
    disconnectWallet
  } = useWeb3();

  const handleConnect = async () => {
    try {
      await connectWallet();
      toast({
        title: "Wallet Connected",
        description: "Successfully connected to MetaMask",
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect to wallet",
        variant: "destructive",
      });
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    toast({
      title: "Wallet Disconnected",
      description: "Wallet has been disconnected",
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Wallet Connection</h2>
        <p className="text-white/70">Connect your Ethereum wallet to participate</p>
      </div>

      {error && (
        <div className="glass-card p-4 border-red-500/30 bg-red-500/10">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        {!isConnected ? (
          <Button 
            onClick={handleConnect}
            disabled={loading}
            className="w-full gradient-button py-6 text-lg"
          >
            {loading ? "Connecting..." : "Connect MetaMask Wallet"}
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="glass-card p-4 text-center">
              <div className="text-sm text-white/70 mb-1">Connected Account</div>
              <div className="text-white font-mono text-sm break-all">{account}</div>
              <div className="mt-2 inline-flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm text-white/80">Connected</span>
              </div>
              {chainId && (
                <div className="text-xs text-white/60 mt-1">Chain ID: {chainId}</div>
              )}
            </div>
            
            <Button 
              onClick={handleDisconnect}
              variant="outline"
              className="w-full glass-button text-gray-900 hover:text-white border-white/30 hover:bg-white/10 transition-colors duration-300"
            >
              Disconnect Wallet
            </Button>
          </div>
        )}
      </div>

      <div className="text-center">
        <p className="text-xs text-white/60">
          Make sure you have MetaMask installed and are connected to Ganache (Chain ID: 1337)
        </p>
      </div>
    </div>
  );
};
