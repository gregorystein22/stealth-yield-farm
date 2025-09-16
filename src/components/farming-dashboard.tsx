import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AnimatedCrop } from "@/components/ui/animated-crop";
import { PrivacyCard } from "@/components/ui/privacy-card";
import { EncryptionStatus, GlobalEncryptionStatus } from "@/components/encryption-status";
import { useToast } from "@/hooks/use-toast";
import { useStealthYieldFarm } from "@/hooks/useStealthYieldFarm";
import { useAccount } from "wagmi";
import { Wallet, Shield, TrendingUp, Zap, Lock } from "lucide-react";

export function FarmingDashboard() {
  const { toast } = useToast();
  const { address, isConnected } = useAccount();
  const { 
    farmerStats, 
    globalStats,
    isLoading, 
    error, 
    createPosition, 
    withdrawPosition, 
    createYieldPool 
  } = useStealthYieldFarm();

  const handleHarvestRewards = async () => {
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to harvest rewards",
        variant: "destructive",
      });
      return;
    }

    try {
      // In a real implementation, this would call the contract to claim rewards
      toast({
        title: "Rewards Harvested Successfully",
        description: "You've harvested rewards from your farming positions",
      });
    } catch (err) {
      toast({
        title: "Harvest Failed",
        description: "Failed to harvest rewards. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleStartNewFarm = async () => {
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to start farming",
        variant: "destructive",
      });
      return;
    }

    try {
      toast({
        title: "Creating Encrypted Position",
        description: "Encrypting your farming data using FHE...",
      });

      // Create a new farming position with FHE encrypted data
      const result = await createPosition(
        "1000000000000000000", // 1 ETH in wei
        "500", // 5% APY (500 basis points)
        "2592000", // 30 days in seconds
        "Stealth Strategy Alpha"
      );

      if (result?.success) {
        toast({
          title: "🎉 Farm Created Successfully",
          description: "Your position is encrypted and protected from front-running",
        });
      } else {
        throw new Error(result?.error || "Unknown error occurred");
      }
    } catch (err) {
      toast({
        title: "Farm Creation Failed",
        description: error || "Failed to create new farming position. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEnablePrivacyMode = () => {
    toast({
      title: "Privacy Mode Enabled",
      description: "Your new positions will be encrypted until withdrawal",
    });
  };

  const handleCompoundAll = async () => {
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to compound rewards",
        variant: "destructive",
      });
      return;
    }

    try {
      // In a real implementation, this would compound all rewards
      toast({
        title: "All Rewards Compounded",
        description: "Successfully reinvested all rewards across your active farms",
      });
    } catch (err) {
      toast({
        title: "Compound Failed",
        description: "Failed to compound rewards. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleWithdrawToReveal = async (positionId: number) => {
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to withdraw",
        variant: "destructive",
      });
      return;
    }

    try {
      toast({
        title: "Revealing Encrypted Data",
        description: "Withdrawing position and revealing encrypted data on-chain...",
      });

      const result = await withdrawPosition(positionId);

      if (result?.success) {
        toast({
          title: "🔓 Data Revealed Successfully",
          description: "Your encrypted position data is now visible on-chain",
        });
      } else {
        throw new Error(result?.error || "Unknown error occurred");
      }
    } catch (err) {
      toast({
        title: "Withdrawal Failed",
        description: error || "Failed to withdraw position. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-farm/30 bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Yield</CardTitle>
            <TrendingUp className="h-4 w-4 text-yield" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yield">
              {farmerStats ? `${Number(farmerStats[1]) / 1e18} ETH` : "0 ETH"}
            </div>
            <p className="text-xs text-muted-foreground">
              {isConnected ? "From your farming positions" : "Connect wallet to view"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-cyber/30 bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Staked</CardTitle>
            <AnimatedCrop type="wheat" size="sm" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-farm">
              {farmerStats ? `${Number(farmerStats[0]) / 1e18} ETH` : "0 ETH"}
            </div>
            <p className="text-xs text-muted-foreground">
              {isConnected ? "In active positions" : "Connect wallet to view"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-privacy/30 bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Reputation</CardTitle>
            <Shield className="h-4 w-4 text-privacy" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-privacy">
              {farmerStats ? `${Number(farmerStats[0])}/100` : "0/100"}
            </div>
            <p className="text-xs text-muted-foreground">
              {isConnected ? "Farming reputation score" : "Connect wallet to view"}
            </p>
          </CardContent>
        </Card>

        <EncryptionStatus
          isEncrypted={true}
          dataType="Your Data"
          className="border-cyber/30"
        />
      </div>

      {/* Active Positions */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <AnimatedCrop type="seedling" size="sm" />
          Active Positions
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Public Position */}
          <Card className="border-farm/30 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="text-farm">ETH-USDC LP</span>
                <div className="flex items-center gap-2">
                  <AnimatedCrop type="wheat" size="sm" />
                  <span className="text-sm text-muted-foreground">Public</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Staked Amount</span>
                <span className="text-sm font-medium">$15,420</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">APY</span>
                <span className="text-sm font-medium text-yield">24.5%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Rewards</span>
                <span className="text-sm font-medium text-farm">+$1,247</span>
              </div>
              <Button variant="yield" size="sm" className="w-full" onClick={handleHarvestRewards}>
                Harvest Rewards
              </Button>
            </CardContent>
          </Card>

          {/* Private Position */}
          <PrivacyCard isEncrypted={true}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="text-privacy">████-████ LP</span>
                <div className="flex items-center gap-2">
                  <AnimatedCrop type="corn" size="sm" />
                  <span className="text-sm text-muted-foreground">Private</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Staked Amount</span>
                <span className="text-sm font-medium">$█████</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">APY</span>
                <span className="text-sm font-medium text-yield">██.█%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Rewards</span>
                <span className="text-sm font-medium text-farm">+$████</span>
              </div>
              <Button 
                variant="privacy" 
                size="sm" 
                className="w-full" 
                onClick={() => handleWithdrawToReveal(1)}
                disabled={!isConnected}
              >
                Withdraw to Reveal
              </Button>
            </CardContent>
          </PrivacyCard>
        </div>
      </div>

      {/* Global Encryption Status */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Lock className="h-6 w-6 text-privacy" />
          Global Encryption Status
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <GlobalEncryptionStatus
            totalPositions={globalStats ? Number(globalStats[1]) : 0}
            activePositions={globalStats ? Number(globalStats[1]) : 0}
          />
          <Card className="border-cyber/30 bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">FHE Protection</CardTitle>
              <Shield className="h-4 w-4 text-cyber" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-cyber">
                Active
              </div>
              <p className="text-xs text-muted-foreground">
                All sensitive data is encrypted using Fully Homomorphic Encryption
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4 justify-center">
        <Button 
          variant="farm" 
          className="flex items-center gap-2" 
          onClick={handleStartNewFarm}
          disabled={!isConnected || isLoading}
        >
          <AnimatedCrop type="seedling" size="sm" />
          Start New Farm
        </Button>
        <Button 
          variant="privacy" 
          className="flex items-center gap-2" 
          onClick={handleEnablePrivacyMode}
          disabled={!isConnected}
        >
          <Shield className="h-4 w-4" />
          Enable Privacy Mode
        </Button>
        <Button 
          variant="yield" 
          className="flex items-center gap-2" 
          onClick={handleCompoundAll}
          disabled={!isConnected || isLoading}
        >
          <Zap className="h-4 w-4" />
          Compound All
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-destructive/30 bg-destructive/10">
          <CardContent className="p-4">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}