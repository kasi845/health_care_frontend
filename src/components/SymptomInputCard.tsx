import { useState } from "react";
import { Mic, MicOff, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const SymptomInputCard = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [symptoms, setSymptoms] = useState("");

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  const handleSubmit = () => {
    if (symptoms.trim()) {
      console.log("Analyzing symptoms:", symptoms);
    }
  };

  return (
    <div className="health-card animate-fade-in">
      <h2 className="text-lg font-semibold text-foreground mb-4">
        Describe Your Symptoms
      </h2>
      
      <div className="flex flex-col items-center gap-4">
        {/* Microphone Button */}
        <button
          onClick={toggleRecording}
          className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
            isRecording
              ? "bg-destructive text-destructive-foreground"
              : "bg-primary text-primary-foreground"
          }`}
        >
          {isRecording && (
            <span className="absolute inset-0 rounded-full bg-destructive/30 animate-ping" />
          )}
          {isRecording ? (
            <MicOff className="w-8 h-8 relative z-10" />
          ) : (
            <Mic className="w-8 h-8 relative z-10" />
          )}
        </button>
        
        <p className="text-sm text-muted-foreground">
          {isRecording ? "Tap to stop recording" : "Tap to speak your symptoms"}
        </p>

        <div className="w-full flex items-center gap-2 my-2">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">or type below</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Text Input */}
        <Textarea
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          placeholder="Chest pain and fatigue for two days..."
          className="w-full min-h-[100px] bg-secondary/50 border-border/50 rounded-xl resize-none focus:ring-2 focus:ring-primary/20"
        />

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all"
          disabled={!symptoms.trim()}
        >
          <Send className="w-4 h-4 mr-2" />
          Analyze Symptoms
        </Button>
      </div>
    </div>
  );
};

export default SymptomInputCard;
