import { useNavigate } from "react-router-dom";
import { Shield, Play } from "lucide-react";

const SystemReady = () => {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 bg-[#05080d] flex flex-col items-center justify-center overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 cyber-grid opacity-10" />
      
      {/* Subtle ambient glow */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 50%, hsl(190 100% 50% / 0.05) 0%, transparent 50%)'
        }}
      />

      {/* Glass panel container */}
      <div 
        className="relative glass-panel px-12 py-16 md:px-20 md:py-20 text-center max-w-lg mx-4"
        style={{
          boxShadow: '0 0 60px hsl(190 100% 50% / 0.15), inset 0 1px 1px hsl(190 100% 50% / 0.1)'
        }}
      >
        {/* Status indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div 
            className="w-3 h-3 rounded-full bg-accent"
            style={{ boxShadow: '0 0 10px hsl(var(--accent)), 0 0 20px hsl(var(--accent) / 0.5)' }}
          />
          <span className="text-accent text-sm font-display tracking-[0.2em] uppercase">Online</span>
        </div>

        {/* Main title */}
        <h1 
          className="font-display text-3xl md:text-4xl text-primary tracking-[0.2em] mb-4"
          style={{ 
            textShadow: '0 0 20px hsl(var(--primary)), 0 0 40px hsl(var(--primary) / 0.5)'
          }}
        >
          SYSTEM READY
        </h1>

        {/* Subtitle */}
        <p 
          className="font-display text-sm md:text-base text-primary/60 tracking-[0.15em] mb-12"
          style={{ textShadow: '0 0 10px hsl(var(--primary) / 0.3)' }}
        >
          Awaiting user command
        </p>

        {/* Buttons */}
        <div className="flex flex-col gap-4">
          <button
            onClick={() => navigate("/auth")}
            className="group relative px-8 py-4 rounded-xl border border-primary/40 bg-primary/5 backdrop-blur-sm transition-all duration-300 hover:border-primary/80 hover:bg-primary/10"
            style={{
              boxShadow: '0 0 20px hsl(190 100% 50% / 0.1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 0 30px hsl(190 100% 50% / 0.3), inset 0 0 20px hsl(190 100% 50% / 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 0 20px hsl(190 100% 50% / 0.1)';
            }}
          >
            <div className="flex items-center justify-center gap-3">
              <Shield className="w-5 h-5 text-primary" />
              <span 
                className="font-display text-sm tracking-[0.2em] text-primary"
                style={{ textShadow: '0 0 10px hsl(var(--primary) / 0.5)' }}
              >
                SYSTEM ACCESS
              </span>
            </div>
          </button>

          <button
            onClick={() => navigate("/home")}
            className="group relative px-8 py-4 rounded-xl border border-accent/40 bg-accent/5 backdrop-blur-sm transition-all duration-300 hover:border-accent/80 hover:bg-accent/10"
            style={{
              boxShadow: '0 0 20px hsl(165 100% 50% / 0.1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 0 30px hsl(165 100% 50% / 0.3), inset 0 0 20px hsl(165 100% 50% / 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 0 20px hsl(165 100% 50% / 0.1)';
            }}
          >
            <div className="flex items-center justify-center gap-3">
              <Play className="w-5 h-5 text-accent" />
              <span 
                className="font-display text-sm tracking-[0.2em] text-accent"
                style={{ textShadow: '0 0 10px hsl(var(--accent) / 0.5)' }}
              >
                ENTER DEMO MODE
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Footer */}
      <p 
        className="absolute bottom-8 text-xs text-primary/30 tracking-wider font-display"
        style={{ textShadow: '0 0 5px hsl(var(--primary) / 0.2)' }}
      >
        AI HEALTH COMMAND CENTER v1.0
      </p>
    </div>
  );
};

export default SystemReady;
