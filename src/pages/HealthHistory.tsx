import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, ArrowRight, FileText } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { getUserProfile, updateUserProfile, saveHealthHistory } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const HealthHistory = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [initializing, setInitializing] = useState(true);
  const [previousHealthIssues, setPreviousHealthIssues] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const profile = getUserProfile();
      if (!profile) {
        navigate("/auth");
        return;
      }
      if (profile.previous_health_issues) {
        setPreviousHealthIssues(profile.previous_health_issues);
      }
    } catch (e) {
      setError("Unable to load your profile. Please log in again.");
    } finally {
      setInitializing(false);
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const cleaned = previousHealthIssues.trim();

      updateUserProfile({
        previous_health_issues: cleaned || undefined,
      });

      if (cleaned) {
        await saveHealthHistory(cleaned);
      }

      toast({
        title: "Health history saved",
        description: "You can review and edit this any time from your profile.",
      });
      navigate("/home");
    } catch (e: any) {
      setError(e?.message || "Could not save your health history. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = () => {
    navigate("/home");
  };

  if (initializing) {
    return (
      <div className="min-h-screen bg-[#05080d] flex items-center justify-center text-muted-foreground">
        Initializing...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05080d] flex flex-col items-center justify-center p-6 overflow-hidden relative">
      <div className="absolute inset-0 cyber-grid opacity-10" />
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-accent/5" />

      <div className="relative z-10 w-full max-w-2xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 border border-primary/30 mb-6 glow-primary">
            <FileText className="w-10 h-10 text-primary" />
          </div>
          <h1
            className="font-display text-2xl md:text-3xl text-primary tracking-[0.2em] mb-2"
            style={{ textShadow: "0 0 20px hsl(var(--primary) / 0.5)" }}
          >
            HEALTH HISTORY
          </h1>
          <p className="text-muted-foreground text-sm tracking-wider max-w-xl mx-auto">
            Before we take you to the command center, share any important past health conditions.
            This helps the AI personalize your risk interpretation.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="glass-panel p-8 space-y-6">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-medium text-muted-foreground tracking-wider">
              Previous health issues or chronic conditions
            </label>
            <Textarea
              value={previousHealthIssues}
              onChange={(e) => setPreviousHealthIssues(e.target.value)}
              placeholder="Example: Type 2 diabetes for 5 years, hypertension, previous cardiac surgery, asthma, kidney-related issues..."
              disabled={saving}
              className="min-h-[160px] bg-muted/30 border-primary/20 focus:border-primary/50 rounded-xl font-sans text-sm text-foreground placeholder:text-muted-foreground resize-y"
            />
            <p className="text-xs text-muted-foreground">
              You can update this later from your profile. Do not share personally identifiable information here.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-primary/10">
            <button
              type="button"
              onClick={handleSkip}
              className="text-xs text-muted-foreground hover:text-primary transition-colors tracking-wider"
            >
              Skip for now — continue to dashboard
            </button>

            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={saving}
                className="h-11 rounded-xl font-display tracking-wider text-xs md:text-sm bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity glow-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save &amp; Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HealthHistory;

