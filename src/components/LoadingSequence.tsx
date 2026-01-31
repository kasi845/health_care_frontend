import { useState, useEffect } from "react";

interface LoadingSequenceProps {
  onComplete: () => void;
}

const loadingSteps = [
  "Initializing AI Health Core...",
  "Scanning biometric databases...",
  "Calibrating risk algorithms...",
  "Loading medical knowledge base...",
  "System ready.",
];

const LoadingSequence = ({ onComplete }: LoadingSequenceProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < loadingSteps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 600);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 100) {
          return prev + 2;
        }
        return prev;
      });
    }, 50);

    const completeTimeout = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onComplete, 800);
    }, 3500);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
      clearTimeout(completeTimeout);
    };
  }, [onComplete]);

  return (
    <div 
      className={`fixed inset-0 z-50 bg-background flex flex-col items-center justify-center transition-opacity duration-700 ${
        isExiting ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Animated rings */}
      <div className="relative w-48 h-48 mb-12">
        {/* Outer ring */}
        <div className="absolute inset-0 border-2 border-primary/30 rounded-full animate-ring-rotate" />
        
        {/* Middle ring */}
        <div className="absolute inset-4 border-2 border-accent/40 rounded-full animate-ring-rotate-reverse" />
        
        {/* Inner ring with glow */}
        <div className="absolute inset-8 border-2 border-primary rounded-full animate-glow-pulse glow-primary" />
        
        {/* Center core */}
        <div className="absolute inset-16 bg-primary/20 rounded-full flex items-center justify-center backdrop-blur-sm">
          <div className="w-8 h-8 bg-primary rounded-full animate-glow-pulse glow-primary" />
        </div>

        {/* Scanning line */}
        <div 
          className="absolute inset-0 overflow-hidden rounded-full"
          style={{ clipPath: 'inset(0)' }}
        >
          <div 
            className="absolute inset-x-0 h-1 bg-gradient-to-b from-transparent via-primary to-transparent"
            style={{ animation: 'scan 2s ease-in-out infinite' }}
          />
        </div>
      </div>

      {/* Title */}
      <h1 className="font-display text-2xl md:text-3xl text-primary neon-text mb-8 tracking-wider">
        AI HEALTH COMMAND CENTER
      </h1>

      {/* Loading steps */}
      <div className="h-8 mb-6">
        <p className="font-display text-sm md:text-base text-primary/80 tracking-widest animate-fade-in">
          {loadingSteps[currentStep]}
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-64 md:w-80 h-1 bg-muted rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-100 ease-out glow-primary"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      <p className="font-display text-xs text-muted-foreground mt-4 tracking-widest">
        {progress}%
      </p>
    </div>
  );
};

export default LoadingSequence;
