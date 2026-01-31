import { useState } from "react";
import { Shield, Leaf, Pill, AlertTriangle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const precautions = [
  "Monitor blood sugar levels daily",
  "Maintain a balanced diet low in refined sugars",
  "Exercise for at least 30 minutes daily",
  "Get 7-8 hours of quality sleep",
  "Reduce sodium intake to manage blood pressure",
];

const homeRemedies = [
  "Drink fenugreek water on an empty stomach",
  "Include bitter gourd in your diet",
  "Consume cinnamon tea after meals",
  "Stay hydrated with 8-10 glasses of water daily",
  "Practice stress-reducing activities like yoga",
];

const medicineCategories = [
  { category: "Blood Sugar", examples: "Metformin, Glimepiride" },
  { category: "Blood Pressure", examples: "ACE inhibitors, Beta blockers" },
  { category: "Cholesterol", examples: "Statins, Fibrates" },
];

const RecommendationsCard = () => {
  const [activeTab, setActiveTab] = useState("precautions");

  return (
    <div className="health-card animate-fade-in" style={{ animationDelay: "0.4s" }}>
      <h2 className="text-lg font-semibold text-foreground mb-4">
        Recommendations
      </h2>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-secondary/50 p-1 rounded-xl h-auto">
          <TabsTrigger
            value="precautions"
            className="rounded-lg py-2.5 text-xs sm:text-sm data-[state=active]:bg-card data-[state=active]:shadow-sm"
          >
            <Shield className="w-4 h-4 mr-1.5 hidden sm:inline" />
            Precautions
          </TabsTrigger>
          <TabsTrigger
            value="remedies"
            className="rounded-lg py-2.5 text-xs sm:text-sm data-[state=active]:bg-card data-[state=active]:shadow-sm"
          >
            <Leaf className="w-4 h-4 mr-1.5 hidden sm:inline" />
            Home Remedies
          </TabsTrigger>
          <TabsTrigger
            value="medicine"
            className="rounded-lg py-2.5 text-xs sm:text-sm data-[state=active]:bg-card data-[state=active]:shadow-sm"
          >
            <Pill className="w-4 h-4 mr-1.5 hidden sm:inline" />
            Medicine
          </TabsTrigger>
        </TabsList>

        <TabsContent value="precautions" className="mt-4 space-y-2">
          {precautions.map((item, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 bg-secondary/30 rounded-xl"
            >
              <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium shrink-0">
                {index + 1}
              </div>
              <span className="text-sm text-foreground">{item}</span>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="remedies" className="mt-4 space-y-2">
          {homeRemedies.map((item, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 bg-secondary/30 rounded-xl"
            >
              <Leaf className="w-5 h-5 text-accent shrink-0 mt-0.5" />
              <span className="text-sm text-foreground">{item}</span>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="medicine" className="mt-4 space-y-3">
          {medicineCategories.map((item, index) => (
            <div
              key={index}
              className="p-4 bg-secondary/30 rounded-xl"
            >
              <h4 className="font-medium text-foreground">{item.category}</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Common medications: {item.examples}
              </p>
            </div>
          ))}
          
          {/* Warning */}
          <div className="flex items-start gap-3 p-4 bg-warning/10 rounded-xl border border-warning/20">
            <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-warning">Important Notice</p>
              <p className="text-xs text-muted-foreground mt-1">
                Always consult a qualified doctor before taking any medication.
                These are general categories for educational purposes only.
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RecommendationsCard;
