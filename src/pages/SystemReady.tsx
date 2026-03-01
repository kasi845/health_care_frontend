import { useNavigate } from "react-router-dom";
import { Shield, UserPlus } from "lucide-react";

const SystemReady = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#05080d] to-[#030508] flex flex-col overflow-hidden">
      {/* Top Navigation */}
      <nav className="w-full px-6 py-4 flex items-center justify-between border-b border-primary/10">
        <span className="font-display text-lg text-primary tracking-wider">
          AI Health Monitor
        </span>
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate("/auth", { state: { mode: "login" } })}
            className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium tracking-wide"
          >
            LOGIN
          </button>
          <button
            onClick={() => navigate("/auth", { state: { mode: "signup" } })}
            className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium tracking-wide"
          >
            SIGN UP
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-6 lg:px-16">
        <div className="max-w-7xl w-full grid lg:grid-cols-2 gap-12 lg:gap-20 items-center py-12">
          
          {/* Left Content */}
          <div className="space-y-8">
            {/* Status Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-accent/30 bg-accent/5">
              <div 
                className="w-2 h-2 rounded-full bg-accent"
                style={{ boxShadow: '0 0 8px hsl(var(--accent))' }}
              />
              <span className="text-xs font-medium text-accent tracking-widest uppercase">
                Online — AI System Active
              </span>
            </div>

            {/* Main Headline */}
            <h1 
              className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight"
              style={{ textShadow: '0 0 40px hsl(var(--primary) / 0.2)' }}
            >
              AI Health{" "}
              <span className="text-primary">Monitor</span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-primary/80 font-medium">
              Your AI companion for post-consultation health monitoring.
            </p>

            {/* Description */}
            <p className="text-muted-foreground text-lg leading-relaxed max-w-xl">
              Upload doctor reports, understand your health condition, monitor symptoms over time, and receive explainable AI guidance — securely and responsibly.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 pt-4">
              <button
                onClick={() => navigate("/auth", { state: { mode: "login" } })}
                className="group flex items-center gap-3 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-display text-sm tracking-widest uppercase transition-all duration-300 hover:bg-primary/90"
                style={{ 
                  boxShadow: '0 0 20px hsl(var(--primary) / 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 30px hsl(190 100% 50% / 0.5), 0 0 60px hsl(190 100% 50% / 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 20px hsl(var(--primary) / 0.3)';
                }}
              >
                <Shield className="w-4 h-4" />
                Login
              </button>

              <button
                onClick={() => navigate("/auth", { state: { mode: "signup" } })}
                className="group flex items-center gap-3 px-8 py-4 rounded-xl border-2 border-primary/50 text-primary font-display text-sm tracking-widest uppercase transition-all duration-300 hover:border-primary hover:bg-primary/10"
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 20px hsl(190 100% 50% / 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <UserPlus className="w-4 h-4" />
                Sign Up
              </button>
            </div>
          </div>

          {/* Right Visual - AI Rings */}
          <div className="hidden lg:flex items-center justify-center relative">
            <div className="relative w-80 h-80 xl:w-96 xl:h-96">
              {/* Outer ring */}
              <div 
                className="absolute inset-0 rounded-full border border-primary/20"
                style={{
                  boxShadow: '0 0 40px hsl(var(--primary) / 0.1), inset 0 0 40px hsl(var(--primary) / 0.05)'
                }}
              />
              
              {/* Middle ring */}
              <div 
                className="absolute inset-8 rounded-full border border-primary/30"
                style={{
                  boxShadow: '0 0 30px hsl(var(--primary) / 0.15), inset 0 0 30px hsl(var(--primary) / 0.08)'
                }}
              />
              
              {/* Inner ring */}
              <div 
                className="absolute inset-16 rounded-full border border-accent/40"
                style={{
                  boxShadow: '0 0 25px hsl(var(--accent) / 0.2), inset 0 0 25px hsl(var(--accent) / 0.1)'
                }}
              />
              
              {/* Core ring */}
              <div 
                className="absolute inset-24 rounded-full border border-accent/50 bg-accent/5"
                style={{
                  boxShadow: '0 0 20px hsl(var(--accent) / 0.3), inset 0 0 20px hsl(var(--accent) / 0.15)'
                }}
              />
              
              {/* Center core with subtle pulse */}
              <div 
                className="absolute inset-[7.5rem] rounded-full bg-gradient-to-br from-primary/30 to-accent/30 animate-glow-pulse"
                style={{
                  boxShadow: '0 0 30px hsl(var(--primary) / 0.4), 0 0 60px hsl(var(--accent) / 0.2)'
                }}
              />

              {/* Decorative dots on rings */}
              <div 
                className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary"
                style={{ boxShadow: '0 0 10px hsl(var(--primary))' }}
              />
              <div 
                className="absolute bottom-8 right-8 w-1.5 h-1.5 rounded-full bg-accent"
                style={{ boxShadow: '0 0 8px hsl(var(--accent))' }}
              />
              <div 
                className="absolute top-16 left-8 w-1.5 h-1.5 rounded-full bg-primary/80"
                style={{ boxShadow: '0 0 6px hsl(var(--primary))' }}
              />
              
              {/* Radar lines */}
              <svg className="absolute inset-0 w-full h-full opacity-20">
                <line x1="50%" y1="0" x2="50%" y2="100%" stroke="hsl(190 100% 50%)" strokeWidth="1" />
                <line x1="0" y1="50%" x2="100%" y2="50%" stroke="hsl(190 100% 50%)" strokeWidth="1" />
                <line x1="15%" y1="15%" x2="85%" y2="85%" stroke="hsl(165 100% 50%)" strokeWidth="0.5" />
                <line x1="85%" y1="15%" x2="15%" y2="85%" stroke="hsl(165 100% 50%)" strokeWidth="0.5" />
              </svg>
            </div>

            {/* Ambient background glow */}
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'radial-gradient(circle at 50% 50%, hsl(190 100% 50% / 0.08) 0%, transparent 60%)'
              }}
            />
          </div>
        </div>
      </main>

      {/* Footer Disclaimer */}
      <footer className="w-full px-6 py-6 text-center border-t border-primary/10">
        <p className="text-sm text-muted-foreground/60">
          This system supports post-consultation monitoring and guidance. It does not replace a medical professional.
        </p>
      </footer>
    </div>
  );
};

export default SystemReady;
