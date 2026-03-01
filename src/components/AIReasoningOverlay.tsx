import { Brain, AlertTriangle, TrendingUp, Scale, X } from "lucide-react";
import { useState } from "react";

const defaultReasoningPoints = [
  { icon: AlertTriangle, text: "Your glucose level is above normal range", severity: "high" },
  { icon: TrendingUp, text: "Blood pressure reading indicates monitoring is required", severity: "medium" },
  { icon: Scale, text: "BMI value suggests lifestyle adjustments may help", severity: "medium" },
];

const iconMap: Record<string, any> = {
  AlertTriangle,
  TrendingUp,
  Scale,
};

interface AIReasoningOverlayProps {
  healthData?: any;
}

const AIReasoningOverlay = ({ healthData }: AIReasoningOverlayProps) => {
  const reasoningPoints = healthData?.interpretations?.map((i: any) => ({
    icon: iconMap[i.icon] || AlertTriangle,
    text: i.text,
    severity: i.severity,
  })) || [];
  
  // Don't show default data - only show if healthData exists
  if (!healthData || !healthData.interpretations || healthData.interpretations.length === 0) {
    return null;
  }
  const [isExpanded, setIsExpanded] = useState(true);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high": return "text-destructive border-destructive/30 bg-destructive/10";
      case "medium": return "text-warning border-warning/30 bg-warning/10";
      default: return "text-success border-success/30 bg-success/10";
    }
  };

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="glass-panel p-4 flex items-center gap-3 hover:glow-primary transition-all"
      >
        <Brain className="w-5 h-5 text-primary" />
        <span className="font-display text-sm text-primary tracking-wider">VIEW REPORT INTERPRETATION</span>
      </button>
    );
  }

  return (
    <div className="glass-panel p-5 border border-primary/30 relative overflow-hidden animate-scale-in">
      {/* Background effect */}
      <div className="absolute inset-0 holo-shimmer opacity-30" />
      
      {/* Scan lines */}
      <div className="absolute inset-0 scan-lines opacity-20" />

      {/* Close button */}
      <button
        onClick={() => setIsExpanded(false)}
        className="absolute top-4 right-4 p-2 rounded-lg hover:bg-muted/30 transition-colors z-10"
      >
        <X className="w-4 h-4 text-muted-foreground" />
      </button>

      {/* Header */}
      <div className="relative z-10 flex items-center gap-3 mb-5">
        <div className="p-2 rounded-lg bg-primary/10 border border-primary/30 glow-primary">
          <Brain className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-display text-base text-primary tracking-wider neon-text">REPORT INTERPRETATION</h3>
          <p className="text-xs text-muted-foreground">Based on your uploaded reports</p>
        </div>
      </div>

      {/* Reasoning points */}
      <div className="relative z-10 space-y-3">
        {reasoningPoints.map((point, index) => (
          <div
            key={index}
            className={`flex items-center gap-3 p-3 rounded-xl border ${getSeverityColor(point.severity)}`}
            style={{ 
              animationDelay: `${index * 100}ms`,
              animation: 'fade-in 0.4s ease-out forwards',
            }}
          >
            <point.icon className="w-4 h-4 shrink-0" />
            <span className="text-sm">{point.text}</span>
          </div>
        ))}
      </div>

      {/* Footer note */}
      <p className="relative z-10 text-xs text-muted-foreground mt-5 p-3 rounded-lg bg-muted/20 border border-muted/30">
        <span className="text-primary">◆</span> Interpretation based on uploaded medical reports and clinical references
      </p>
    </div>
  );
};

export default AIReasoningOverlay;
