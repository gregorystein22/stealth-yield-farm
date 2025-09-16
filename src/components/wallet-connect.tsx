import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Wallet, Shield, Zap } from "lucide-react";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useDisconnect } from 'wagmi';

export function WalletConnect() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  if (isConnected && address) {
    return (
      <Card className="border-cyber/30 bg-card/50 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 bg-farm rounded-full animate-pulse" />
              <div>
                <div className="text-sm font-medium text-cyber">Connected</div>
                <div className="text-xs text-muted-foreground font-mono">
                  {`${address.slice(0, 6)}...${address.slice(-4)}`}
                </div>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => disconnect()}
              className="text-muted-foreground hover:text-foreground"
            >
              Disconnect
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="border-cyber/30 bg-card/50 backdrop-blur-sm">
        <CardContent className="p-6 text-center space-y-4">
          <div className="flex justify-center">
            <Wallet className="h-12 w-12 text-cyber cyber-glow" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">Connect Your Wallet</h3>
            <p className="text-sm text-muted-foreground">
              Connect your wallet to start farming with privacy protection
            </p>
          </div>
          <ConnectButton.Custom>
            {({
              account,
              chain,
              openAccountModal,
              openChainModal,
              openConnectModal,
              authenticationStatus,
              mounted,
            }) => {
              const ready = mounted && authenticationStatus !== 'loading';
              const connected =
                ready &&
                account &&
                chain &&
                (!authenticationStatus ||
                  authenticationStatus === 'authenticated');

              return (
                <div
                  {...(!ready && {
                    'aria-hidden': true,
                    'style': {
                      opacity: 0,
                      pointerEvents: 'none',
                      userSelect: 'none',
                    },
                  })}
                >
                  {(() => {
                    if (!connected) {
                      return (
                        <Button 
                          variant="connect" 
                          onClick={openConnectModal}
                          className="w-full flex items-center gap-2"
                        >
                          <Wallet className="h-4 w-4" />
                          Connect Wallet
                        </Button>
                      );
                    }

                    if (chain.unsupported) {
                      return (
                        <Button 
                          variant="destructive" 
                          onClick={openChainModal}
                          className="w-full"
                        >
                          Wrong network
                        </Button>
                      );
                    }

                    return (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={openChainModal}
                          className="flex items-center gap-2"
                        >
                          {chain.hasIcon && (
                            <div
                              style={{
                                background: chain.iconBackground,
                                width: 12,
                                height: 12,
                                borderRadius: 999,
                                overflow: 'hidden',
                                marginRight: 4,
                              }}
                            >
                              {chain.iconUrl && (
                                <img
                                  alt={chain.name ?? 'Chain icon'}
                                  src={chain.iconUrl}
                                  style={{ width: 12, height: 12 }}
                                />
                              )}
                            </div>
                          )}
                          {chain.name}
                        </Button>

                        <Button
                          variant="outline"
                          onClick={openAccountModal}
                          className="flex items-center gap-2"
                        >
                          {account.displayName}
                          {account.displayBalance
                            ? ` (${account.displayBalance})`
                            : ''}
                        </Button>
                      </div>
                    );
                  })()}
                </div>
              );
            }}
          </ConnectButton.Custom>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-farm/20 bg-card/30 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <Shield className="h-6 w-6 text-farm mx-auto mb-2" />
            <div className="text-sm font-medium text-farm">Encrypted</div>
            <div className="text-xs text-muted-foreground">Positions</div>
          </CardContent>
        </Card>

        <Card className="border-privacy/20 bg-card/30 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <Zap className="h-6 w-6 text-privacy mx-auto mb-2" />
            <div className="text-sm font-medium text-privacy">MEV</div>
            <div className="text-xs text-muted-foreground">Protection</div>
          </CardContent>
        </Card>

        <Card className="border-yield/20 bg-card/30 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <Wallet className="h-6 w-6 text-yield mx-auto mb-2" />
            <div className="text-sm font-medium text-yield">Max</div>
            <div className="text-xs text-muted-foreground">Yields</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}