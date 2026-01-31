import { LucideIcon } from "lucide-react";

interface DiseasePanelProps {
  name: string;
  risk: number;
  icon: LucideIcon;
  status: string;
}

const DiseasePanel = ({ name, risk, icon: Icon, status }: DiseasePanelProps) => {
  const getColor = () => {
    if (risk <= 30) return "success";
    if (risk <= 60) return "warning";
    return "destructive";
  };

  const colorClass = getColor();

  const colorStyles = {
    success: {
      bg: "bg-success/10",
      text: "text-success",
      icon: "text-success",
    },
    warning: {
      bg: "bg-warning/10",
      text: "text-warning",
      icon: "text-warning",
    },
    destructive: {
      bg: "bg-destructive/10",
      text: "text-destructive",
      icon: "text-destructive",
    },
  };

  const styles = colorStyles[colorClass];

  return (
    <div className={`p-4 rounded-xl ${styles.bg} transition-all duration-300 hover:scale-[1.02]`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-lg bg-card ${styles.icon}`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className={`text-2xl font-bold ${styles.text}`}>{risk}%</span>
      </div>
      <h3 className="font-semibold text-foreground">{name}</h3>
      <p className={`text-sm mt-1 ${styles.text}`}>{status}</p>
    </div>
  );
};

export default DiseasePanel;
