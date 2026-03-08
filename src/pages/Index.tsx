import { useState, useEffect } from "react";
import AnimatedBackground from "@/components/AnimatedBackground";
import LoadingSequence from "@/components/LoadingSequence";
import HealthCore from "@/components/HealthCore";
import FloatingSymptomPanel from "@/components/FloatingSymptomPanel";
import FloatingUploadPanel from "@/components/FloatingUploadPanel";
import RiskVisualization from "@/components/RiskVisualization";
import AIReasoningOverlay from "@/components/AIReasoningOverlay";
import CyberFooter from "@/components/CyberFooter";

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setTimeout(() => setShowContent(true), 100);
    }
  }, [isLoading]);

  if (isLoading) {
    return <LoadingSequence onComplete={() => setIsLoading(false)} />;
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <AnimatedBackground />
      
      {/* Header */}
      <header className={`relative z-10 text-center pt-8 pb-4 px-4 transition-all duration-1000 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
        <h1 className="font-display text-2xl md:text-3xl text-primary neon-text tracking-widest">
          AI HEALTH MONITOR
        </h1>
        <p className="text-sm text-muted-foreground mt-2 tracking-wide">
          Post-consultation health monitoring system
        </p>
      </header>

      <main className="relative z-10 px-4 pb-32">
        {/* Top section: Side panels + Health Core */}
        <div className={`max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 items-start mb-12 transition-all duration-1000 delay-300 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {/* Left Panel - Symptoms */}
          <div className="order-2 lg:order-1">
            <FloatingSymptomPanel />
          </div>

          {/* Center - Health Core */}
          <div className="order-1 lg:order-2 flex justify-center py-8 lg:py-0">
            <HealthCore score={58} />
          </div>

          {/* Right Panel - Upload */}
          <div className="order-3">
            <FloatingUploadPanel />
          </div>
        </div>

        {/* Risk Visualization */}
        <div className={`max-w-4xl mx-auto mb-12 transition-all duration-1000 delay-500 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <RiskVisualization />
        </div>

        {/* AI Reasoning */}
        <div className={`max-w-2xl mx-auto transition-all duration-1000 delay-700 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <AIReasoningOverlay />
        </div>
      </main>

      <CyberFooter />
    </div>
  );
};

export default Index;
