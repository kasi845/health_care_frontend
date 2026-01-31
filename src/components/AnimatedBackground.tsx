const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Cyber grid */}
      <div className="absolute inset-0 cyber-grid opacity-50" />
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
      
      {/* Radial glow from center */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-[100px]" />
      
      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-primary/10 blur-[80px] rounded-full" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-accent/10 blur-[80px] rounded-full" />
      
      {/* Heartbeat SVG */}
      <svg 
        className="absolute bottom-20 left-0 right-0 w-full h-24 opacity-20"
        viewBox="0 0 1200 100"
        preserveAspectRatio="none"
      >
        <path
          d="M0,50 L200,50 L230,50 L250,20 L270,80 L290,30 L310,70 L330,50 L360,50 L600,50 L630,50 L650,20 L670,80 L690,30 L710,70 L730,50 L760,50 L1000,50 L1030,50 L1050,20 L1070,80 L1090,30 L1110,70 L1130,50 L1160,50 L1200,50"
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          className="heartbeat-line"
        />
      </svg>

      {/* Scan lines overlay */}
      <div className="absolute inset-0 scan-lines opacity-30" />
      
      {/* Moving scan bar */}
      <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent animate-scan-line opacity-30" 
           style={{ animation: 'scan-line 4s ease-in-out infinite' }} 
      />
    </div>
  );
};

export default AnimatedBackground;
