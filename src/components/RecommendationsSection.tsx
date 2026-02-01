import { useState } from "react";
import { Lightbulb, Leaf, Pill, ChevronDown, AlertTriangle } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const suggestions = [
  "Reduce sugar intake to manage glucose levels",
  "Daily 30-minute walking or light exercise",
  "Regular blood pressure monitoring",
  "Maintain consistent sleep schedule",
];

const homeRemedies = [
  "Warm water with lemon in the morning",
  "Balanced diet with leafy greens",
  "Adequate sleep (7-8 hours)",
  "Stress management through meditation",
];

const tablets = [
  { name: "Paracetamol", category: "Fever/Pain relief" },
  { name: "Antacid", category: "Digestive health" },
  { name: "Antihistamine", category: "Allergy management" },
];

interface PanelProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const RecommendationPanel = ({ title, icon, children, defaultOpen = false }: PanelProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="glass-panel border border-primary/20 overflow-hidden">
        <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-muted/20 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 glow-primary">
              {icon}
            </div>
            <span className="font-display text-sm tracking-wider text-primary">{title}</span>
          </div>
          <ChevronDown 
            className={`w-5 h-5 text-primary/60 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
          />
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="px-4 pb-4 pt-2 border-t border-primary/10">
            {children}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

const RecommendationsSection = () => {
  return (
    <div className="w-full space-y-4">
      {/* Section header */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <div className="h-px flex-1 max-w-20 bg-gradient-to-r from-transparent to-primary/50" />
        <h2 className="font-display text-lg text-primary tracking-widest neon-text">
          RECOMMENDATIONS
        </h2>
        <div className="h-px flex-1 max-w-20 bg-gradient-to-l from-transparent to-primary/50" />
      </div>

      {/* Panels */}
      <div className="grid gap-4">
        <RecommendationPanel 
          title="SUGGESTIONS" 
          icon={<Lightbulb className="w-5 h-5 text-primary" />}
          defaultOpen={true}
        >
          <ul className="space-y-2">
            {suggestions.map((item, index) => (
              <li 
                key={index}
                className="flex items-start gap-3 text-sm text-foreground/80"
              >
                <span className="text-primary mt-0.5">◆</span>
                {item}
              </li>
            ))}
          </ul>
        </RecommendationPanel>

        <RecommendationPanel 
          title="HOME REMEDIES" 
          icon={<Leaf className="w-5 h-5 text-accent" />}
        >
          <ul className="space-y-2">
            {homeRemedies.map((item, index) => (
              <li 
                key={index}
                className="flex items-start gap-3 text-sm text-foreground/80"
              >
                <span className="text-accent mt-0.5">◆</span>
                {item}
              </li>
            ))}
          </ul>
        </RecommendationPanel>

        <RecommendationPanel 
          title="PRIMARY TABLETS (ADVISORY)" 
          icon={<Pill className="w-5 h-5 text-primary" />}
        >
          <div className="space-y-3">
            {tablets.map((item, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-primary/10"
              >
                <span className="text-sm text-foreground">{item.name}</span>
                <span className="text-xs text-muted-foreground">{item.category}</span>
              </div>
            ))}
            
            {/* Warning */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-warning/10 border border-warning/20 mt-4">
              <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
              <p className="text-xs text-warning/80">
                Consult a doctor before taking any medication. These are general categories for advisory purposes only.
              </p>
            </div>
          </div>
        </RecommendationPanel>
      </div>
    </div>
  );
};

export default RecommendationsSection;
