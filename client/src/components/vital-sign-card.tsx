import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LucideIcon, Wifi } from "lucide-react";

interface VitalSignCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  unit: string;
  color: "cyan" | "green" | "yellow" | "red";
  trend?: "up" | "down" | "stable";
  available?: boolean; // Whether this data is available from ESP32
}

export function VitalSignCard({ icon: Icon, label, value, unit, color, trend, available }: VitalSignCardProps) {
  const colorClasses = {
    cyan: "text-vital-cyan border-vital-cyan/20",
    green: "text-vital-green border-vital-green/20",
    yellow: "text-vital-yellow border-vital-yellow/20",
    red: "text-vital-red border-vital-red/20",
  };

  const isUnavailable = value === "N/A" || value === "N/A/N/A";

  return (
    <Card className={`p-6 border-2 ${colorClasses[color]} bg-card/50 backdrop-blur-sm ${isUnavailable ? 'opacity-60' : ''}`} data-testid={`card-vital-${label.toLowerCase()}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </span>
          {available && (
            <Badge variant="outline" className="h-4 px-1.5 text-[10px] border-vital-cyan/50 text-vital-cyan">
              <Wifi className="h-2.5 w-2.5 mr-0.5" />
              ESP32
            </Badge>
          )}
          {!available && !isUnavailable && (
            <Badge variant="outline" className="h-4 px-1.5 text-[10px] text-muted-foreground border-muted">
              Manual
            </Badge>
          )}
        </div>
        <Icon className={`h-5 w-5 ${colorClasses[color]} ${isUnavailable ? 'opacity-40' : ''}`} />
      </div>
      <div className="flex items-baseline gap-2 flex-wrap">
        <span className={`text-5xl font-bold font-mono ${colorClasses[color]} leading-tight ${isUnavailable ? 'opacity-50' : ''}`} data-testid={`text-value-${label.toLowerCase()}`}>
          {value}
        </span>
        {!isUnavailable && (
          <span className={`text-xl font-semibold ${colorClasses[color]} opacity-80`}>
            {unit}
          </span>
        )}
      </div>
      {isUnavailable && (
        <div className="mt-3 text-xs text-muted-foreground italic">
          Not available from ESP32
        </div>
      )}
      {trend && !isUnavailable && (
        <div className="mt-3 text-xs text-muted-foreground">
          {trend === "up" && "↑ Increasing"}
          {trend === "down" && "↓ Decreasing"}
          {trend === "stable" && "→ Stable"}
        </div>
      )}
    </Card>
  );
}
