import { cn } from "@/lib/utils";

interface HealthMeterProps {
  score: number;
  label: string;
  size?: "sm" | "md" | "lg";
}

const HealthMeter = ({ score, label, size = "md" }: HealthMeterProps) => {
  const getColor = (score: number) => {
    if (score >= 80) return "success";
    if (score >= 60) return "warning";
    return "destructive";
  };

  const color = getColor(score);
  
  const sizeClasses = {
    sm: "h-2",
    md: "h-3",
    lg: "h-4"
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-medium">{label}</span>
        <span className={cn(
          "font-bold text-lg",
          color === "success" && "text-success",
          color === "warning" && "text-warning",
          color === "destructive" && "text-destructive"
        )}>
          {score}/100
        </span>
      </div>
      <div className="relative w-full bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            sizeClasses[size],
            "rounded-full transition-all duration-500 ease-out",
            color === "success" && "gradient-success",
            color === "warning" && "bg-warning",
            color === "destructive" && "bg-destructive"
          )}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
};

export default HealthMeter;
