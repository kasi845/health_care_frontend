interface RiskGaugeProps {
  value: number; // 0-100
  size?: number;
}

const RiskGauge = ({ value, size = 160 }: RiskGaugeProps) => {
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  const getColor = () => {
    if (value <= 30) return "hsl(var(--success))";
    if (value <= 60) return "hsl(var(--warning))";
    return "hsl(var(--destructive))";
  };

  const getRiskLevel = () => {
    if (value <= 30) return { label: "Low Risk", description: "Keep it up!" };
    if (value <= 60) return { label: "Moderate", description: "Monitor health" };
    return { label: "High Risk", description: "Consult doctor" };
  };

  const risk = getRiskLevel();

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Background circle */}
        <svg className="transform -rotate-90" width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--secondary))"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={getColor()}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-4xl font-bold transition-colors duration-500"
            style={{ color: getColor() }}
          >
            {value}%
          </span>
          <span className="text-sm text-muted-foreground mt-1">
            Overall Risk
          </span>
        </div>
      </div>

      {/* Risk label */}
      <div className="mt-4 text-center">
        <span
          className="inline-block px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-500"
          style={{
            backgroundColor: `${getColor()}20`,
            color: getColor(),
          }}
        >
          {risk.label}
        </span>
        <p className="text-sm text-muted-foreground mt-2">{risk.description}</p>
      </div>
    </div>
  );
};

export default RiskGauge;
