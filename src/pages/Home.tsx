import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, User } from "lucide-react";
import AnimatedBackground from "@/components/AnimatedBackground";
import SchedulePanel from "@/components/SchedulePanel";
import HealthCore from "@/components/HealthCore";
import FloatingSymptomPanel from "@/components/FloatingSymptomPanel";
import FloatingUploadPanel from "@/components/FloatingUploadPanel";
import RiskVisualization from "@/components/RiskVisualization";
import AIReasoningOverlay from "@/components/AIReasoningOverlay";
import RecommendationsSection from "@/components/RecommendationsSection";
import NearbyHospitals from "@/components/NearbyHospitals";
import { getHealthReport, logout as logoutUser } from "@/lib/api";

const Home = () => {
  const navigate = useNavigate();
  const [healthScore, setHealthScore] = useState<number | null>(null);
  const [healthData, setHealthData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user's health data on mount
  useEffect(() => {
    const loadHealthData = async () => {
      try {
        const report = await getHealthReport();
        if (report) {
          // Convert backend format to frontend format
          const formattedData = {
            health_score: report.health_score,
            risks: report.risks,
            interpretations: report.interpretations,
            suggestions: report.suggestions,
            home_remedies: report.home_remedies,
            medicine_categories: report.medicine_categories,
          };
          setHealthData(formattedData);
          setHealthScore(report.health_score);
        }
        // If no report, healthScore and healthData remain null (no default data)
      } catch (err) {
        console.error('Failed to load health data:', err);
        // On error, don't show default data
      } finally {
        setIsLoading(false);
      }
    };

    loadHealthData();
  }, []);

  const handleLogout = () => {
    logoutUser();
    navigate("/system-ready");
  };

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      {/* Animated background */}
      <AnimatedBackground />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center px-4 py-8 md:py-12">
        {/* Header */}
        <header className="w-full max-w-6xl mb-10">
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <h1 
                className="font-display text-2xl md:text-3xl text-primary tracking-[0.2em] mb-2"
                style={{ textShadow: '0 0 20px hsl(var(--primary) / 0.5)' }}
              >
                AI HEALTH COMMAND CENTER
              </h1>
            </div>
            
            {/* Right-side actions: Schedule (left), then Profile, Log out */}
            <div className="flex items-center gap-3 absolute right-4 top-8 md:relative md:right-auto md:top-auto">
              <SchedulePanel />
              <button
                onClick={() => navigate("/profile")}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-primary/30 bg-primary/5 backdrop-blur-sm transition-all duration-300 hover:border-primary/60 hover:bg-primary/10"
                style={{
                  boxShadow: '0 0 12px hsl(190 100% 50% / 0.12)',
                }}
              >
                <User className="w-4 h-4 text-primary" />
                <span
                  className="font-display text-[0.65rem] tracking-[0.18em] text-primary hidden md:inline"
                  style={{ textShadow: '0 0 6px hsl(var(--primary) / 0.4)' }}
                >
                  PROFILE
                </span>
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-primary/30 bg-primary/5 backdrop-blur-sm transition-all duration-300 hover:border-primary/60 hover:bg-primary/10"
                style={{
                  boxShadow: '0 0 15px hsl(190 100% 50% / 0.1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 25px hsl(190 100% 50% / 0.25)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 15px hsl(190 100% 50% / 0.1)';
                }}
              >
                <LogOut className="w-4 h-4 text-primary" />
                <span 
                  className="font-display text-xs tracking-[0.15em] text-primary hidden md:inline"
                  style={{ textShadow: '0 0 8px hsl(var(--primary) / 0.4)' }}
                >
                  LOG OUT
                </span>
              </button>
            </div>
          </div>
        </header>

        {/* Main dashboard area */}
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          {/* Left panel - Symptoms */}
          <div className="lg:order-1 order-2">
            <FloatingSymptomPanel
              baselineScore={healthScore ?? 70}
              onHealthScoreUpdate={(score) => {
                setHealthScore(score);
              }}
            />
          </div>

          {/* Center - Health Core */}
          <div className="lg:order-2 order-1 flex items-center justify-center py-8 lg:py-0">
            <HealthCore score={healthScore ?? undefined} />
          </div>

          {/* Right panel - Upload */}
          <div className="lg:order-3 order-3">
            <FloatingUploadPanel 
              onAnalysisComplete={(data) => {
                setHealthData(data);
                setHealthScore(data.health_score);
              }}
            />
          </div>
        </div>

        {/* Risk Analysis */}
        <div className="w-full max-w-4xl mb-10">
          <RiskVisualization healthData={healthData} />
        </div>

        {/* AI Reasoning */}
        <div className="w-full max-w-2xl mb-10">
          <AIReasoningOverlay healthData={healthData} />
        </div>

        {/* Recommendations */}
        <div className="w-full max-w-2xl mb-10">
          <RecommendationsSection healthData={healthData} />
        </div>

        {/* Nearby Hospitals - map and list below Care Guidance */}
        <div className="w-full max-w-2xl mb-20">
          <NearbyHospitals />
        </div>
      </div>

      {/* Footer area intentionally left minimal (disclaimer removed as requested) */}
    </div>
  );
};

export default Home;
