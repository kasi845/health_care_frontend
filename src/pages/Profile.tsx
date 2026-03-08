import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, ArrowLeft, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { getUserProfile, updateUserProfile, UserProfile } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loaded = getUserProfile();
    if (!loaded) {
      navigate("/auth");
      return;
    }
    setProfile(loaded);
  }, [navigate]);

  const handleChange =
    (field: keyof UserProfile) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (!profile) return;
      setProfile({ ...profile, [field]: e.target.value });
    };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    try {
      const updated = updateUserProfile({
        full_name: profile.full_name,
        age: profile.age,
        gender: profile.gender,
        previous_health_issues: profile.previous_health_issues,
      });
      setProfile(updated);
      toast({
        title: "Profile updated",
        description: "Your details have been saved successfully.",
      });
    } catch (e: any) {
      toast({
        title: "Unable to save profile",
        description: e?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#05080d] flex items-center justify-center text-muted-foreground">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05080d] flex flex-col items-center justify-center p-6 overflow-hidden relative">
      <div className="absolute inset-0 cyber-grid opacity-10" />
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-accent/5" />

      <div className="relative z-10 w-full max-w-2xl">
        <header className="flex items-center justify-between mb-8">
          <button
            type="button"
            onClick={() => navigate("/home")}
            className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="tracking-wider">BACK TO DASHBOARD</span>
          </button>

          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            <h1
              className="font-display text-lg md:text-xl text-primary tracking-[0.25em]"
              style={{ textShadow: "0 0 16px hsl(var(--primary) / 0.5)" }}
            >
              PROFILE
            </h1>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="glass-panel p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-xs font-medium text-muted-foreground tracking-wider">
                Full Name
              </label>
              <Input
                value={profile.full_name}
                onChange={handleChange("full_name")}
                disabled={saving}
                className="h-11 bg-muted/30 border-primary/20 focus:border-primary/50 rounded-xl font-display tracking-wider text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-medium text-muted-foreground tracking-wider">
                Email (read-only)
              </label>
              <Input
                value={profile.email}
                disabled
                className="h-11 bg-muted/20 border-primary/20 rounded-xl font-mono text-xs text-muted-foreground cursor-not-allowed"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-medium text-muted-foreground tracking-wider">
                Age
              </label>
              <Input
                value={profile.age ?? ""}
                onChange={handleChange("age")}
                disabled={saving}
                placeholder="e.g., 52"
                className="h-11 bg-muted/30 border-primary/20 focus:border-primary/50 rounded-xl text-sm text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-medium text-muted-foreground tracking-wider">
                Gender
              </label>
              <Input
                value={profile.gender ?? ""}
                onChange={handleChange("gender")}
                disabled={saving}
                placeholder="e.g., Male / Female / Other"
                className="h-11 bg-muted/30 border-primary/20 focus:border-primary/50 rounded-xl text-sm text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-medium text-muted-foreground tracking-wider">
              Previous health issues or chronic conditions
            </label>
            <Textarea
              value={profile.previous_health_issues ?? ""}
              onChange={handleChange("previous_health_issues")}
              disabled={saving}
              placeholder="This will include what you entered after signup, plus any updates you add here."
              className="min-h-[140px] bg-muted/30 border-primary/20 focus:border-primary/50 rounded-xl text-sm text-foreground placeholder:text-muted-foreground resize-y"
            />
          </div>

          <div className="flex items-center justify-end pt-4 border-t border-primary/10">
            <Button
              type="submit"
              disabled={saving}
              className="h-11 rounded-xl font-display tracking-wider text-xs md:text-sm bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity glow-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Profile
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;

