import { Lightbulb, AlertCircle, TrendingUp, Scale } from "lucide-react";

const explanations = [
  {
    icon: AlertCircle,
    text: "High glucose detected (142 mg/dL)",
    severity: "high",
  },
  {
    icon: TrendingUp,
    text: "Elevated blood pressure (130/85 mmHg)",
    severity: "medium",
  },
  {
    icon: Scale,
    text: "BMI above normal range",
    severity: "medium",
  },
];

const ExplainableAIPanel = () => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "text-destructive bg-destructive/10";
      case "medium":
        return "text-warning bg-warning/10";
      default:
        return "text-success bg-success/10";
    }
  };

  return (
    <div className="health-card animate-fade-in" style={{ animationDelay: "0.3s" }}>
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-lg bg-accent/10">
          <Lightbulb className="w-5 h-5 text-accent" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">
          Why This Result?
        </h2>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        Our AI analyzed your symptoms and medical data to identify these key
        risk factors:
      </p>

      <ul className="space-y-3">
        {explanations.map((item, index) => (
          <li
            key={index}
            className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50"
          >
            <div className={`p-2 rounded-lg ${getSeverityColor(item.severity)}`}>
              <item.icon className="w-4 h-4" />
            </div>
            <span className="text-sm text-foreground">{item.text}</span>
          </li>
        ))}
      </ul>

      <p className="text-xs text-muted-foreground mt-4 p-3 bg-secondary/30 rounded-lg">
        💡 These factors are weighted based on established medical research and
        your personal health profile.
      </p>
    </div>
  );
};

export default ExplainableAIPanel;
