import { AlertTriangle } from "lucide-react";

const CyberFooter = () => {
  return (
    <footer className="relative z-10 px-4 py-8 mt-12">
      <div className="max-w-4xl mx-auto">
        {/* Disclaimer */}
        <div className="glass-panel p-4 border border-warning/20 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">
            <span className="text-warning font-medium">SYSTEM NOTICE:</span>{" "}
            This system supports post-consultation monitoring and guidance. 
            It does <span className="text-foreground">not</span> replace a medical professional. 
            Always consult your doctor for medical advice.
          </p>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-center gap-4 mt-6">
          <div className="h-px flex-1 max-w-24 bg-gradient-to-r from-transparent to-primary/30" />
          <p className="font-display text-xs text-muted-foreground tracking-widest">
            AI HEALTH MONITOR v2.0
          </p>
          <div className="h-px flex-1 max-w-24 bg-gradient-to-l from-transparent to-primary/30" />
        </div>
      </div>
    </footer>
  );
};

export default CyberFooter;
