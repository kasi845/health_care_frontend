import Header from "@/components/Header";
import SymptomInputCard from "@/components/SymptomInputCard";
import UploadReportsCard from "@/components/UploadReportsCard";
import RiskDashboard from "@/components/RiskDashboard";
import ExplainableAIPanel from "@/components/ExplainableAIPanel";
import RecommendationsCard from "@/components/RecommendationsCard";
import ChatbotButton from "@/components/ChatbotButton";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-4 pb-24">
        <SymptomInputCard />
        <UploadReportsCard />
        <RiskDashboard />
        <ExplainableAIPanel />
        <RecommendationsCard />
      </main>

      <Footer />
      <ChatbotButton />
    </div>
  );
};

export default Index;
