import { ReactNode } from "react";
import { Card } from "./card";
import { cn } from "@/lib/utils";

interface PrivacyCardProps {
  children: ReactNode;
  className?: string;
  isEncrypted?: boolean;
}

export function PrivacyCard({ children, className, isEncrypted = false }: PrivacyCardProps) {
  return (
    <Card className={cn(
      "relative overflow-hidden border-cyber/30 bg-card/50 backdrop-blur-sm",
      isEncrypted && "privacy-shimmer",
      className
    )}>
      {isEncrypted && (
        <div className="absolute top-2 right-2 text-privacy text-xs font-mono">
          🔒 ENCRYPTED
        </div>
      )}
      <div className={cn(isEncrypted && "blur-sm")}>
        {children}
      </div>
    </Card>
  );
}