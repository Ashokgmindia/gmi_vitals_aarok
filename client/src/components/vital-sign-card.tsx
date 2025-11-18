import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface VitalSignCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  unit: string;
  color: "cyan" | "green" | "yellow" | "red";
  trend?: "up" | "down" | "stable";
}

export function VitalSignCard({ icon: Icon, label, value, unit, color, trend }: VitalSignCardProps) {
  const colorClasses = {
    cyan: "text-vital-cyan border-vital-cyan/20",
    green: "text-vital-green border-vital-green/20",
    yellow: "text-vital-yellow border-vital-yellow/20",
    red: "text-vital-red border-vital-red/20",
  };

  return (
    <Card className={`p-6 border-2 ${colorClasses[color]} bg-card/50 backdrop-blur-sm`} data-testid={`card-vital-${label.toLowerCase()}`}>
      <div className="flex items-start justify-between mb-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <Icon className={`h-5 w-5 ${colorClasses[color]}`} />
      </div>
      <div className="flex items-baseline gap-2 flex-wrap">
        <span className={`text-5xl font-bold font-mono ${colorClasses[color]} leading-tight`} data-testid={`text-value-${label.toLowerCase()}`}>
          {value}
        </span>
        <span className={`text-xl font-semibold ${colorClasses[color]} opacity-80`}>
          {unit}
        </span>
      </div>
      {trend && (
        <div className="mt-3 text-xs text-muted-foreground">
          {trend === "up" && "↑ Increasing"}
          {trend === "down" && "↓ Decreasing"}
          {trend === "stable" && "→ Stable"}
        </div>
      )}
    </Card>
  );
}
