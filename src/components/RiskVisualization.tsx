import { Droplets, Heart, Activity } from "lucide-react";
import HolographicRiskCard from "./HolographicRiskCard";

const risks = [
  { name: "Diabetes Risk", risk: 65, icon: Droplets, status: "Monitor" as const },
  { name: "Heart Disease", risk: 42, icon: Heart, status: "Monitor" as const },
  { name: "Kidney Risk", risk: 18, icon: Activity, status: "Low" as const },
];

const RiskVisualization = () => {
  return (
    <div className="w-full">
      {/* Section header */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <div className="h-px flex-1 max-w-20 bg-gradient-to-r from-transparent to-primary/50" />
        <h2 className="font-display text-lg text-primary tracking-widest neon-text">
          RISK ANALYSIS
        </h2>
        <div className="h-px flex-1 max-w-20 bg-gradient-to-l from-transparent to-primary/50" />
      </div>

      {/* Risk cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {risks.map((risk, index) => (
          <HolographicRiskCard
            key={risk.name}
            name={risk.name}
            risk={risk.risk}
            icon={risk.icon}
            status={risk.status}
            delay={index * 150}
          />
        ))}
      </div>
    </div>
  );
};

export default RiskVisualization;
