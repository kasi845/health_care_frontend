import { useState } from "react";
import AnimatedBackground from "@/components/AnimatedBackground";
import HealthCore from "@/components/HealthCore";
import FloatingSymptomPanel from "@/components/FloatingSymptomPanel";
import FloatingUploadPanel from "@/components/FloatingUploadPanel";
import RiskVisualization from "@/components/RiskVisualization";
import AIReasoningOverlay from "@/components/AIReasoningOverlay";
import RecommendationsSection from "@/components/RecommendationsSection";
import AIOrbChat from "@/components/AIOrbChat";

const Home = () => {
  const [healthScore] = useState(58);

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      {/* Animated background */}
      <AnimatedBackground />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center px-4 py-8 md:py-12">
        {/* Header */}
        <header className="text-center mb-10">
          <h1 
            className="font-display text-2xl md:text-3xl text-primary tracking-[0.2em] mb-2"
            style={{ textShadow: '0 0 20px hsl(var(--primary) / 0.5)' }}
          >
            AI HEALTH COMMAND CENTER
          </h1>
          <p className="text-muted-foreground text-sm tracking-wider">
            Advanced biometric analysis system
          </p>
        </header>

        {/* Main dashboard area */}
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          {/* Left panel - Symptoms */}
          <div className="lg:order-1 order-2">
            <FloatingSymptomPanel />
          </div>

          {/* Center - Health Core */}
          <div className="lg:order-2 order-1 flex items-center justify-center py-8 lg:py-0">
            <HealthCore score={healthScore} />
          </div>

          {/* Right panel - Upload */}
          <div className="lg:order-3 order-3">
            <FloatingUploadPanel />
          </div>
        </div>

        {/* Risk Analysis */}
        <div className="w-full max-w-4xl mb-10">
          <RiskVisualization />
        </div>

        {/* AI Reasoning */}
        <div className="w-full max-w-2xl mb-10">
          <AIReasoningOverlay />
        </div>

        {/* Recommendations */}
        <div className="w-full max-w-2xl mb-20">
          <RecommendationsSection />
        </div>
      </div>

      {/* AI Chat Orb */}
      <AIOrbChat />

      {/* Footer Disclaimer */}
      <footer className="fixed bottom-0 left-0 right-0 py-4 text-center bg-gradient-to-t from-background to-transparent z-20">
        <p 
          className="text-xs text-primary/40 tracking-wider font-display"
          style={{ textShadow: '0 0 5px hsl(var(--primary) / 0.2)' }}
        >
          This is an early risk screening tool, not a medical diagnosis.
        </p>
      </footer>
    </div>
  );
};

export default Home;
