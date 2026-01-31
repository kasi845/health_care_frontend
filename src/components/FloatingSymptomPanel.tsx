import { useState } from "react";
import { Mic, MicOff, Send, Activity } from "lucide-react";

const FloatingSymptomPanel = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [symptoms, setSymptoms] = useState("");

  return (
    <div className="glass-panel p-5 animate-float" style={{ animationDelay: '0s' }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-primary/10 border border-primary/30">
          <Activity className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-display text-sm text-primary tracking-wider">SYMPTOM INPUT</h3>
          <p className="text-xs text-muted-foreground">Voice or text analysis</p>
        </div>
      </div>

      {/* Voice button */}
      <button
        onClick={() => setIsRecording(!isRecording)}
        className={`relative w-full h-20 rounded-xl flex items-center justify-center transition-all duration-300 border ${
          isRecording
            ? "bg-destructive/20 border-destructive glow-destructive"
            : "bg-primary/10 border-primary/30 hover:bg-primary/20 hover:glow-primary"
        }`}
      >
        {isRecording && (
          <>
            <span className="absolute inset-0 rounded-xl bg-destructive/20 animate-ping" />
            <span className="absolute inset-2 rounded-lg border border-destructive/50 animate-glow-pulse" />
          </>
        )}
        {isRecording ? (
          <MicOff className="w-8 h-8 text-destructive relative z-10" />
        ) : (
          <Mic className="w-8 h-8 text-primary relative z-10" />
        )}
      </button>
      
      <p className="text-xs text-center text-muted-foreground mt-2 mb-4">
        {isRecording ? "Recording... tap to stop" : "Tap to speak symptoms"}
      </p>

      {/* Divider */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        <span className="text-xs text-muted-foreground font-display">OR</span>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      </div>

      {/* Text input */}
      <div className="relative">
        <textarea
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          placeholder="Describe symptoms..."
          className="w-full h-24 bg-muted/30 border border-primary/20 rounded-xl p-3 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:border-primary/50 focus:glow-primary transition-all"
        />
        
        {/* Submit button */}
        <button
          disabled={!symptoms.trim()}
          className="absolute bottom-3 right-3 p-2 rounded-lg bg-primary/20 border border-primary/30 text-primary hover:bg-primary/30 hover:glow-primary transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default FloatingSymptomPanel;
