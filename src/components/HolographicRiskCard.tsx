import { LucideIcon } from "lucide-react";

interface HolographicRiskCardProps {
  name: string;
  risk: number;
  icon: LucideIcon;
  status: "Low" | "Monitor" | "Urgent";
  delay?: number;
}

const HolographicRiskCard = ({ name, risk, icon: Icon, status, delay = 0 }: HolographicRiskCardProps) => {
  const getStatusStyles = () => {
    switch (status) {
      case "Low":
        return {
          border: "border-success/40",
          bg: "bg-success/10",
          text: "text-success",
          glow: "glow-success",
          gradient: "from-success/20 to-transparent",
        };
      case "Monitor":
        return {
          border: "border-warning/40",
          bg: "bg-warning/10",
          text: "text-warning",
          glow: "glow-warning",
          gradient: "from-warning/20 to-transparent",
        };
      case "Urgent":
        return {
          border: "border-destructive/40",
          bg: "bg-destructive/10",
          text: "text-destructive",
          glow: "glow-destructive",
          gradient: "from-destructive/20 to-transparent",
        };
    }
  };

  const styles = getStatusStyles();

  return (
    <div 
      className={`relative glass-panel p-5 border ${styles.border} overflow-hidden transition-all duration-300 hover:scale-105`}
      style={{ 
        animationDelay: `${delay}ms`,
        animation: 'fade-in-up 0.6s ease-out forwards',
        opacity: 0,
      }}
    >
      {/* Holographic shimmer overlay */}
      <div className="absolute inset-0 holo-shimmer opacity-50" />
      
      {/* Gradient accent */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${styles.gradient}`} />

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className={`p-2 rounded-lg ${styles.bg} ${styles.glow}`}>
            <Icon className={`w-5 h-5 ${styles.text}`} />
          </div>
          <span className={`font-display text-xs px-3 py-1 rounded-full ${styles.bg} ${styles.text} tracking-wider`}>
            {status.toUpperCase()}
          </span>
        </div>

        {/* Risk value */}
        <div className="flex items-end gap-2 mb-2">
          <span className={`font-display text-4xl font-bold ${styles.text} neon-text`}>
            {risk}
          </span>
          <span className="text-muted-foreground text-lg mb-1">%</span>
        </div>

        {/* Name */}
        <p className="font-display text-sm text-foreground/80 tracking-wide">{name}</p>

        {/* Progress bar */}
        <div className="mt-4 h-1 bg-muted/30 rounded-full overflow-hidden">
          <div 
            className={`h-full ${styles.bg} ${styles.glow} transition-all duration-1000 ease-out`}
            style={{ width: `${risk}%` }}
          />
        </div>
      </div>

      {/* Corner decoration */}
      <div className={`absolute bottom-0 right-0 w-16 h-16 ${styles.bg} blur-xl`} />
    </div>
  );
};

export default HolographicRiskCard;
