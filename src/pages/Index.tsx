import { WalletConnect } from "@/components/wallet-connect";
import { FarmingDashboard } from "@/components/farming-dashboard";
import { AnimatedCrop } from "@/components/ui/animated-crop";
import heroFarming from "@/assets/hero-farming.jpg";

const Index = () => {

  return (
    <div className="min-h-screen bg-gradient-to-b from-soil via-background to-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${heroFarming})` }}
        />
        <div className="relative z-10 container mx-auto px-4 py-16 text-center">
          <div className="flex justify-center items-center gap-4 mb-6">
            <AnimatedCrop type="seedling" size="lg" />
            <AnimatedCrop type="wheat" size="lg" />
            <AnimatedCrop type="corn" size="lg" />
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-farm via-cyber to-yield bg-clip-text text-transparent">
            Farm in Privacy, Reap in Public
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 text-muted-foreground max-w-3xl mx-auto">
            Your farming positions are encrypted so whales cannot copy profitable strategies until after withdrawal.
          </p>

          <div className="max-w-md mx-auto">
            <WalletConnect />
          </div>
        </div>
      </div>

      {/* Dashboard Section */}
      <div className="container mx-auto px-4 py-16">
        <FarmingDashboard />
      </div>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center items-center gap-2 mb-4">
            <AnimatedCrop type="tree" size="sm" />
            <span className="text-sm text-muted-foreground">
              Powered by Zero-Knowledge Farming Technology
            </span>
            <AnimatedCrop type="tree" size="sm" />
          </div>
          <p className="text-xs text-muted-foreground">
            Trade smart, farm private, harvest public.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
