import { Droplets, Heart, Activity } from "lucide-react";
import RiskGauge from "./RiskGauge";
import DiseasePanel from "./DiseasePanel";

const diseases = [
  {
    name: "Diabetes Risk",
    risk: 65,
    icon: Droplets,
    status: "Elevated glucose levels",
  },
  {
    name: "Heart Disease",
    risk: 42,
    icon: Heart,
    status: "Monitor blood pressure",
  },
  {
    name: "Kidney Risk",
    risk: 18,
    icon: Activity,
    status: "Within normal range",
  },
];

const RiskDashboard = () => {
  // Calculate overall risk as weighted average
  const overallRisk = Math.round(
    diseases.reduce((acc, d) => acc + d.risk, 0) / diseases.length
  );

  return (
    <div className="health-card animate-fade-in" style={{ animationDelay: "0.2s" }}>
      <h2 className="text-lg font-semibold text-foreground mb-6">
        Risk Assessment
      </h2>

      {/* Central Risk Gauge */}
      <div className="flex justify-center mb-8">
        <RiskGauge value={overallRisk} />
      </div>

      {/* Disease Panels */}
      <div className="grid gap-3">
        {diseases.map((disease) => (
          <DiseasePanel
            key={disease.name}
            name={disease.name}
            risk={disease.risk}
            icon={disease.icon}
            status={disease.status}
          />
        ))}
      </div>
    </div>
  );
};

export default RiskDashboard;
