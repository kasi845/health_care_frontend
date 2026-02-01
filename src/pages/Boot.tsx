import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const loadingSteps = [
  "Initializing AI Health Core...",
  "Scanning biometric databases...",
  "Calibrating risk algorithms...",
  "Loading medical knowledge base...",
  "System ready.",
];

const Boot = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

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

    const redirectTimeout = setTimeout(() => {
      navigate("/auth");
    }, 4000);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
      clearTimeout(redirectTimeout);
    };
  }, [navigate]);

  return (
    <div className="fixed inset-0 bg-[#05080d] flex flex-col items-center justify-center overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 cyber-grid opacity-20" />
      
      {/* Animated rings container */}
      <div className="relative w-56 h-56 md:w-72 md:h-72 mb-12">
        {/* Outer ring */}
        <div 
          className="absolute inset-0 rounded-full border-2 border-primary/40"
          style={{ 
            animation: 'ring-rotate 8s linear infinite',
            boxShadow: '0 0 20px hsl(var(--primary) / 0.3), inset 0 0 20px hsl(var(--primary) / 0.1)'
          }}
        />
        
        {/* Second ring */}
        <div 
          className="absolute inset-6 rounded-full border-2 border-accent/50"
          style={{ 
            animation: 'ring-rotate-reverse 6s linear infinite',
            boxShadow: '0 0 15px hsl(var(--accent) / 0.3)'
          }}
        />
        
        {/* Third ring */}
        <div 
          className="absolute inset-12 rounded-full border-2 border-primary/60"
          style={{ 
            animation: 'ring-rotate 4s linear infinite',
            boxShadow: '0 0 25px hsl(var(--primary) / 0.4)'
          }}
        />
        
        {/* Inner glowing core */}
        <div 
          className="absolute inset-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 backdrop-blur-sm flex items-center justify-center"
          style={{ boxShadow: '0 0 40px hsl(var(--primary) / 0.5), inset 0 0 30px hsl(var(--primary) / 0.3)' }}
        >
          {/* Center dot */}
          <div 
            className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-primary"
            style={{ 
              animation: 'glow-pulse 2s ease-in-out infinite',
              boxShadow: '0 0 30px hsl(var(--primary)), 0 0 60px hsl(var(--primary) / 0.5)'
            }}
          />
        </div>

        {/* Scanning line */}
        <div className="absolute inset-0 rounded-full overflow-hidden">
          <div 
            className="absolute inset-x-0 h-1 bg-gradient-to-b from-transparent via-primary to-transparent"
            style={{ animation: 'scan 2s ease-in-out infinite' }}
          />
        </div>

        {/* Tick marks */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-0.5 h-3 bg-primary/50"
            style={{
              top: '50%',
              left: '50%',
              transform: `translate(-50%, -50%) rotate(${i * 30}deg) translateY(-110px)`,
            }}
          />
        ))}
      </div>

      {/* Title */}
      <h1 
        className="font-display text-2xl md:text-4xl text-primary tracking-[0.3em] mb-4 text-center"
        style={{ 
          textShadow: '0 0 20px hsl(var(--primary)), 0 0 40px hsl(var(--primary) / 0.5), 0 0 60px hsl(var(--primary) / 0.3)'
        }}
      >
        AI HEALTH COMMAND CENTER
      </h1>

      {/* Status text */}
      <div className="h-8 mb-10">
        <p 
          className="font-display text-sm md:text-base text-primary/80 tracking-[0.2em] animate-fade-in"
          style={{ textShadow: '0 0 10px hsl(var(--primary) / 0.5)' }}
        >
          {loadingSteps[currentStep]}
        </p>
      </div>

      {/* Loading bar container */}
      <div className="w-72 md:w-96 relative">
        {/* Background track */}
        <div 
          className="h-1.5 rounded-full bg-muted/30 overflow-hidden"
          style={{ boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)' }}
        >
          {/* Progress fill */}
          <div 
            className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-100 ease-out"
            style={{ 
              width: `${progress}%`,
              boxShadow: '0 0 15px hsl(var(--primary)), 0 0 30px hsl(var(--primary) / 0.5)'
            }}
          />
        </div>
        
        {/* Progress percentage */}
        <p 
          className="font-display text-xs text-primary/60 mt-4 text-center tracking-[0.3em]"
          style={{ textShadow: '0 0 5px hsl(var(--primary) / 0.3)' }}
        >
          {progress}%
        </p>
      </div>
    </div>
  );
};

export default Boot;
