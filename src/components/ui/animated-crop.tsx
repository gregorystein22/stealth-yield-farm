import { cn } from "@/lib/utils";

interface AnimatedCropProps {
  className?: string;
  type?: "seedling" | "wheat" | "corn" | "tree";
  size?: "sm" | "md" | "lg";
}

export function AnimatedCrop({ className, type = "seedling", size = "md" }: AnimatedCropProps) {
  const sizeClasses = {
    sm: "text-2xl",
    md: "text-4xl", 
    lg: "text-6xl"
  };

  const crops = {
    seedling: "🌱",
    wheat: "🌾",
    corn: "🌽", 
    tree: "🌳"
  };

  return (
    <div className={cn(
      "inline-block crop-grow",
      sizeClasses[size],
      className
    )}>
      {crops[type]}
    </div>
  );
}