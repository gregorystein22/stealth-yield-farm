import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Lock, Eye, EyeOff } from "lucide-react";

interface EncryptionStatusProps {
  isEncrypted: boolean;
  dataType: string;
  className?: string;
}

export function EncryptionStatus({ isEncrypted, dataType, className }: EncryptionStatusProps) {
  return (
    <Card className={`border-privacy/30 bg-card/50 backdrop-blur-sm ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {dataType} Status
        </CardTitle>
        {isEncrypted ? (
          <Lock className="h-4 w-4 text-privacy" />
        ) : (
          <Eye className="h-4 w-4 text-green-500" />
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2">
          <Badge 
            variant={isEncrypted ? "default" : "secondary"}
            className={isEncrypted ? "bg-privacy/20 text-privacy border-privacy/30" : "bg-green-500/20 text-green-600 border-green-500/30"}
          >
            {isEncrypted ? (
              <>
                <Shield className="h-3 w-3 mr-1" />
                Encrypted
              </>
            ) : (
              <>
                <EyeOff className="h-3 w-3 mr-1" />
                Revealed
              </>
            )}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {isEncrypted 
            ? "Data is encrypted using FHE and protected from front-running"
            : "Data has been revealed and is visible on-chain"
          }
        </p>
      </CardContent>
    </Card>
  );
}

interface PositionEncryptionStatusProps {
  positionId: number;
  isActive: boolean;
  isWithdrawn: boolean;
  className?: string;
}

export function PositionEncryptionStatus({ 
  positionId, 
  isActive, 
  isWithdrawn, 
  className 
}: PositionEncryptionStatusProps) {
  const isEncrypted = isActive && !isWithdrawn;
  
  return (
    <EncryptionStatus
      isEncrypted={isEncrypted}
      dataType={`Position #${positionId}`}
      className={className}
    />
  );
}

interface GlobalEncryptionStatusProps {
  totalPositions: number;
  activePositions: number;
  className?: string;
}

export function GlobalEncryptionStatus({ 
  totalPositions, 
  activePositions, 
  className 
}: GlobalEncryptionStatusProps) {
  const encryptedPositions = activePositions;
  const revealedPositions = totalPositions - activePositions;
  
  return (
    <Card className={`border-privacy/30 bg-card/50 backdrop-blur-sm ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Global Encryption Status
        </CardTitle>
        <Shield className="h-4 w-4 text-privacy" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Lock className="h-3 w-3 text-privacy" />
              <span className="text-sm">Encrypted Positions</span>
            </div>
            <Badge variant="default" className="bg-privacy/20 text-privacy border-privacy/30">
              {encryptedPositions}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Eye className="h-3 w-3 text-green-500" />
              <span className="text-sm">Revealed Positions</span>
            </div>
            <Badge variant="secondary" className="bg-green-500/20 text-green-600 border-green-500/30">
              {revealedPositions}
            </Badge>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-privacy h-2 rounded-full transition-all duration-300"
              style={{ width: `${totalPositions > 0 ? (encryptedPositions / totalPositions) * 100 : 0}%` }}
            />
          </div>
          
          <p className="text-xs text-muted-foreground">
            {totalPositions > 0 
              ? `${Math.round((encryptedPositions / totalPositions) * 100)}% of positions are encrypted`
              : "No positions created yet"
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
