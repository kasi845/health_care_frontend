import { useState, useEffect } from "react";

interface HealthCoreProps {
  score: number;
}

const HealthCore = ({ score }: HealthCoreProps) => {
  const [displayScore, setDisplayScore] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(false);
    }, 1000);

    const scoreInterval = setInterval(() => {
      setDisplayScore((prev) => {
        if (prev < score) {
          return Math.min(prev + 1, score);
        }
        return prev;
      });
    }, 30);

    return () => {
      clearTimeout(timer);
      clearInterval(scoreInterval);
    };
  }, [score]);

  const getScoreColor = () => {
    if (score >= 70) return { color: "text-success", glow: "glow-success", gradient: "from-success to-accent" };
    if (score >= 40) return { color: "text-warning", glow: "glow-warning", gradient: "from-warning to-primary" };
    return { color: "text-destructive", glow: "glow-destructive", gradient: "from-destructive to-warning" };
  };

  const { color, glow, gradient } = getScoreColor();
  const circumference = 2 * Math.PI * 120;
  const strokeDashoffset = circumference - (displayScore / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      {/* Outer decorative ring */}
      <div className="absolute w-80 h-80 md:w-96 md:h-96 rounded-full border border-primary/10 animate-ring-rotate">
        {/* Tick marks */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-4 bg-primary/30"
            style={{
              top: '50%',
              left: '50%',
              transform: `translate(-50%, -50%) rotate(${i * 30}deg) translateY(-150px)`,
            }}
          />
        ))}
      </div>

      {/* Second decorative ring */}
      <div className="absolute w-72 h-72 md:w-80 md:h-80 rounded-full border border-accent/20 animate-ring-rotate-reverse" />

      {/* Main SVG ring */}
      <svg className="w-64 h-64 md:w-72 md:h-72 transform -rotate-90" viewBox="0 0 256 256">
        {/* Background ring */}
        <circle
          cx="128"
          cy="128"
          r="120"
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth="8"
          opacity="0.3"
        />
        
        {/* Progress ring */}
        <circle
          cx="128"
          cy="128"
          r="120"
          fill="none"
          stroke="url(#scoreGradient)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-300 ease-out"
          style={{ filter: 'drop-shadow(0 0 10px hsl(var(--primary)))' }}
        />

        {/* Gradient definition */}
        <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(var(--accent))" />
          </linearGradient>
        </defs>
      </svg>

      {/* Inner glass panel */}
      <div className="absolute w-48 h-48 md:w-56 md:h-56 rounded-full glass-panel flex flex-col items-center justify-center">
        {/* Scanning effect */}
        {isAnimating && (
          <div className="absolute inset-0 rounded-full overflow-hidden">
            <div 
              className="absolute inset-x-0 h-1/2 bg-gradient-to-b from-primary/30 to-transparent"
              style={{ animation: 'scan 1.5s ease-in-out infinite' }}
            />
          </div>
        )}

        {/* Score display */}
        <span className={`font-display text-5xl md:text-6xl font-bold ${color} neon-text transition-colors duration-500`}>
          {displayScore}
        </span>
        <span className="text-muted-foreground text-sm tracking-widest mt-1">HEALTH SCORE</span>
        
        {/* Status indicator */}
        <div className={`mt-4 px-4 py-1.5 rounded-full bg-card/50 border border-primary/30 ${glow}`}>
          <span className={`font-display text-xs tracking-wider ${color}`}>
            {score >= 70 ? "OPTIMAL" : score >= 40 ? "MONITORING" : "ALERT"}
          </span>
        </div>
      </div>

      {/* Pulsing core */}
      <div className="absolute w-4 h-4 rounded-full bg-primary animate-glow-pulse glow-primary" />
    </div>
  );
};

export default HealthCore;
