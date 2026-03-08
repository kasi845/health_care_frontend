import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Send, Activity, Pill } from "lucide-react";
import { analyzeSymptoms, voiceToText } from "@/lib/api";
import { startWavRecording, type WavRecorder } from "@/lib/voiceRecorder";
import { useToast } from "@/hooks/use-toast";

interface FloatingSymptomPanelProps {
  onHealthScoreUpdate?: (score: number) => void;
  baselineScore?: number;
}

// Prefer these symptom words when engine returns similar-sounding alternatives (e.g. "cold" over "called")
const PREFERRED_SYMPTOM_WORDS = new Set([
  "cold", "cough", "fever", "headache", "pain", "sore", "throat", "stomach",
]);

function pickSymptomTranscript(result: SpeechRecognitionResult): string {
  const getTranscript = (i: number) => {
    const item = result[i] ?? result.item?.(i);
    return (item?.transcript ?? "").trim();
  };
  const hasSymptomWord = (t: string) =>
    t.split(/\s+/).some((w) => PREFERRED_SYMPTOM_WORDS.has(w.toLowerCase().replace(/\.$/, "")));
  for (let i = 0; i < result.length; i++) {
    const t = getTranscript(i);
    if (t && hasSymptomWord(t)) return t;
  }
  return getTranscript(0) || "";
}

const FloatingSymptomPanel = ({ onHealthScoreUpdate, baselineScore = 70 }: FloatingSymptomPanelProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [symptoms, setSymptoms] = useState("");
  const [loading, setLoading] = useState(false);
  const [primaryMeds, setPrimaryMeds] = useState<string[]>([]);
  const [matchedConditions, setMatchedConditions] = useState<string[]>([]);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const sessionIdRef = useRef(0);
  const currentRecognitionRef = useRef<{ stop: () => void } | null>(null);
  const lastResultLengthRef = useRef(0);
  const restartTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wavRecorderRef = useRef<WavRecorder | null>(null);
  const voiceModeRef = useRef<"browser" | "server" | null>(null);
  const lastInterimRef = useRef("");
  const { toast } = useToast();

  // Commit any pending interim transcript to symptoms so it doesn't disappear
  const commitInterimToSymptoms = () => {
    const interim = (lastInterimRef.current || "").trim();
    lastInterimRef.current = "";
    if (interim) {
      setSymptoms((prev) => (prev.trim() ? `${prev.trim()} ${interim}` : interim));
      setInterimTranscript("");
    }
    // Only clear displayed interim when we actually merged it into symptoms;
    // otherwise we'd wipe the box when stopping with nothing new to commit
  };

  // Detect if browser supports speech recognition and secure context
  useEffect(() => {
    if (typeof window === "undefined") return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setSpeechSupported(!!SpeechRecognition);
    return () => {
      if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
    };
  }, []);

  const startVoiceInput = () => {
    if (!window.isSecureContext) {
      toast({
        title: "Voice input requires secure connection",
        description: "Use https:// or localhost. Voice input does not work on plain http from other devices.",
        variant: "destructive",
      });
      return;
    }

    // Use browser Web Speech API by default so voice works without backend
    startBrowserVoiceInput();
  };

  const startBrowserVoiceInput = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      // Fallback: try server voice (record WAV, send to backend)
      startWavRecording()
        .then((recorder) => {
          wavRecorderRef.current = recorder;
          voiceModeRef.current = "server";
          setIsRecording(true);
          setInterimTranscript("");
        })
        .catch((e) => {
          console.error("Voice start failed", e);
          toast({
            title: "Voice input not available",
            description: "Use Chrome or Edge, allow microphone access, and use https or localhost.",
            variant: "destructive",
          });
        });
      return;
    }

    const sessionId = ++sessionIdRef.current;
    lastResultLengthRef.current = 0;
    lastInterimRef.current = "";
    setInterimTranscript("");
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;  // show text as you speak
    recognition.lang = "en-US";
    recognition.maxAlternatives = 3;  // get alternatives so we can prefer "cold" over "called"/"code"

    recognition.onresult = (event: any) => {
      if (sessionId !== sessionIdRef.current) return;
      const results = event.results;
      const start = lastResultLengthRef.current;
      let finalText = "";
      let lastInterim = "";
      for (let i = start; i < results.length; i++) {
        const r = results[i];
        const transcript = r.length > 0
          ? (r.isFinal ? pickSymptomTranscript(r) : (r[0]?.transcript ?? "").trim())
          : "";
        if (r.isFinal && transcript) {
          finalText += (finalText ? " " : "") + transcript;
        } else if (transcript) {
          lastInterim = transcript;
        }
      }
      lastResultLengthRef.current = results.length;
      if (finalText) {
        setSymptoms((prev) => (prev.trim() ? `${prev.trim()} ${finalText}` : finalText));
      }
      lastInterimRef.current = lastInterim;
      // Only update displayed interim when we have new interim text, or we committed final text
      // (so showing "" is correct). Avoid clearing interim when browser sends empty final results.
      if (finalText || lastInterim) {
        setInterimTranscript(lastInterim);
      }
    };

    recognition.onerror = (event: any) => {
      const err = event?.error || "";
      if (err === "not-allowed" || err === "service-not-allowed") {
        toast({
          title: "Microphone access denied",
          description: "Allow microphone permission for this site, then try again.",
          variant: "destructive",
        });
      } else if (err !== "no-speech" && err !== "aborted") {
        toast({
          title: "Voice input error",
          description: "Could not hear you clearly. Try again or type your symptoms.",
          variant: "destructive",
        });
      }
      setIsRecording(false);
      commitInterimToSymptoms();
      currentRecognitionRef.current = null;
    };

    recognition.onend = () => {
      if (sessionId !== sessionIdRef.current) return;
      const rec = currentRecognitionRef.current;
      // If user didn't stop (ref still set), restart so continuous listening keeps working
      if (rec) {
        restartTimeoutRef.current = setTimeout(() => {
          restartTimeoutRef.current = null;
          try {
            recognition.start();
          } catch (_) {
            setIsRecording(false);
            commitInterimToSymptoms();
            currentRecognitionRef.current = null;
          }
        }, 100);
      } else {
        // Recognition ended (e.g. user stopped or timeout): commit any interim text so it doesn't disappear
        commitInterimToSymptoms();
        setIsRecording(false);
      }
    };

    try {
      recognition.start();
      voiceModeRef.current = "browser";
      setIsRecording(true);
      currentRecognitionRef.current = {
        stop: () => {
          currentRecognitionRef.current = null;
          if (restartTimeoutRef.current) {
            clearTimeout(restartTimeoutRef.current);
            restartTimeoutRef.current = null;
          }
          try {
            recognition.stop();
          } catch (_) {}
        },
      };
    } catch (e) {
      console.error("Speech start error", e);
      toast({
        title: "Could not start microphone",
        description: "Check browser permissions or try again.",
        variant: "destructive",
      });
      setIsRecording(false);
      commitInterimToSymptoms();
    }
  };

  const stopVoiceInput = () => {
    if (voiceModeRef.current === "server" && wavRecorderRef.current) {
      const recorder = wavRecorderRef.current;
      wavRecorderRef.current = null;
      voiceModeRef.current = null;
      setIsRecording(false);
      setInterimTranscript("");
      recorder
        .stop()
        .then((blob) => voiceToText(blob))
        .then((text) => {
          const trimmed = (text || "").trim();
          if (trimmed) {
            setSymptoms((prev) => {
              const next = prev.trim() ? `${prev.trim()} ${trimmed}` : trimmed;
              return next;
            });
            setInterimTranscript("");
          } else {
            toast({ title: "No speech detected", description: "Try speaking again or type your symptoms." });
          }
        })
        .catch((e: Error) => {
          toast({
            title: "Voice recognition failed",
            description: e?.message || "Ensure backend is running (pip install SpeechRecognition). Try again or type.",
            variant: "destructive",
          });
        });
      return;
    }
    const rec = currentRecognitionRef.current;
    if (rec) {
      commitInterimToSymptoms();
      currentRecognitionRef.current = null;
      rec.stop();
    }
    voiceModeRef.current = null;
    setIsRecording(false);
  };

  return (
    <div className="glass-panel p-5 animate-float" style={{ animationDelay: '0s' }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-primary/10 border border-primary/30">
          <Activity className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-display text-sm text-primary tracking-wider">SYMPTOM CHECK-IN</h3>
          <p className="text-xs text-muted-foreground">Log symptoms after consultation</p>
        </div>
      </div>

      {/* Voice button */}
      <button
        onClick={() => {
          if (isRecording) {
            stopVoiceInput();
          } else {
            setPrimaryMeds([]);
            setMatchedConditions([]);
            startVoiceInput();
          }
        }}
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

      {/* Text input: voice-to-text result and typed text both go here */}
      <div className="flex gap-2 items-end">
        <textarea
          value={symptoms + (interimTranscript ? (symptoms.trim() ? " " : "") + interimTranscript : "")}
          onChange={(e) => {
            setSymptoms(e.target.value);
            setInterimTranscript("");
          }}
          placeholder="Describe symptoms..."
          className="flex-1 min-w-0 h-24 bg-muted/30 border border-primary/20 rounded-xl p-3 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:border-primary/50 focus:glow-primary transition-all"
        />
        {/* Submit button - outside textarea so it never blocks voice-to-text */}
        <button
          disabled={!symptoms.trim() || loading}
          onClick={async () => {
            const text = symptoms.trim();
            if (!text) return;
            setLoading(true);
            try {
              const result = await analyzeSymptoms(text);
              setPrimaryMeds(result.primary_medicines);
              setMatchedConditions(result.matched_conditions);
              if (onHealthScoreUpdate) {
                // Simple heuristic: start from current/baseline score and
                // subtract based on matched conditions. Higher impact
                // conditions reduce more of the score.
                let score = baselineScore || 70;
                // Penalties: serious conditions = bigger drop; mild (cold, cough, headache) = small drop
                const highImpact = ["diabetes", "hypertension", "asthma"];
                const mediumImpact = ["fever", "stomach_pain", "allergy"];
                const lowImpact = ["common_cold", "cough", "headache"];

                for (const nameRaw of result.matched_conditions || []) {
                  const name = String(nameRaw || "").toLowerCase();
                  if (highImpact.includes(name)) {
                    score -= 16;
                  } else if (mediumImpact.includes(name)) {
                    score -= 10;
                  } else if (lowImpact.includes(name)) {
                    score -= 2;  // simple issues like cold: only a small dip
                  } else {
                    score -= 5;
                  }
                }

                // Clamp score between 10 and 95 so UI never shows
                // impossible extremes just from symptom text alone.
                const clamped = Math.max(10, Math.min(95, Math.round(score)));
                onHealthScoreUpdate(clamped);
              }
              if (result.primary_medicines.length === 0) {
                toast({
                  title: "No exact medicine match",
                  description: "Symptoms recorded. Please consult your doctor for appropriate medicines.",
                });
              }
            } catch (e: any) {
              toast({
                title: "Unable to analyze symptoms",
                description: e?.message || "Please try again.",
                variant: "destructive",
              });
            } finally {
              setLoading(false);
            }
          }}
          className="shrink-0 h-12 w-12 rounded-xl flex items-center justify-center bg-primary/20 border border-primary/30 text-primary hover:bg-primary/30 hover:glow-primary transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Send className={`w-5 h-5 ${loading ? "animate-pulse" : ""}`} />
        </button>
      </div>

      {primaryMeds.length > 0 && (
        <div className="mt-4 p-3 rounded-xl bg-primary/5 border border-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <Pill className="w-4 h-4 text-primary" />
            <p className="text-xs font-display tracking-[0.18em] text-primary">
              POSSIBLE PRIMARY MEDICINES
            </p>
          </div>
          <ul className="text-xs text-muted-foreground space-y-1">
            {primaryMeds.map((med) => (
              <li key={med} className="flex items-center gap-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary/60" />
                <span>{med}</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[0.65rem] text-muted-foreground/80">
            These are informational suggestions based on your symptoms and should not replace a doctor&apos;s prescription.
          </p>
          {matchedConditions.length > 0 && (
            <p className="mt-1 text-[0.65rem] text-muted-foreground/60">
              Matched conditions: {matchedConditions.join(", ")}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default FloatingSymptomPanel;
