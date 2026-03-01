import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock, User, ArrowRight, Fingerprint, Phone, Loader2, AlertCircle } from "lucide-react";
import { signup, login } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Check if mode was passed from SystemReady page
  useEffect(() => {
    if (location.state?.mode === "signup") {
      setIsLogin(false);
    } else {
      setIsLogin(true);
    }
  }, [location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        // Login
        if (!email || !password) {
          setError("Please fill in all fields");
          setLoading(false);
          return;
        }
        await login({ email, password });
        toast({
          title: "Login successful",
          description: "Welcome back!",
        });
      } else {
        // Signup
        if (!email || !password || !name) {
          setError("Please fill in all required fields");
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setError("Password must be at least 6 characters");
          setLoading(false);
          return;
        }
        await signup({ 
          email, 
          password, 
          full_name: name,
          phone: phone || undefined 
        });
        toast({
          title: "Account created",
          description: "Welcome! Your account has been created successfully.",
        });
      }
      
      // Navigate to home after successful auth
      navigate("/home");
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.");
      toast({
        title: "Authentication failed",
        description: err.message || "Please check your credentials and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05080d] flex flex-col items-center justify-center p-6 overflow-hidden relative">
      {/* Background effects */}
      <div className="absolute inset-0 cyber-grid opacity-10" />
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-accent/5" />

      {/* Decorative rings */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full border border-primary/10 animate-ring-rotate opacity-30" />
      <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full border border-accent/10 animate-ring-rotate-reverse opacity-30" />

      {/* Main content */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo/Title */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 border border-primary/30 mb-6 glow-primary">
            <Fingerprint className="w-10 h-10 text-primary" />
          </div>
          <h1 
            className="font-display text-2xl md:text-3xl text-primary tracking-[0.2em] mb-2"
            style={{ textShadow: '0 0 20px hsl(var(--primary) / 0.5)' }}
          >
            SYSTEM ACCESS
          </h1>
          <p className="text-muted-foreground text-sm tracking-wider">
            Authenticate to continue
          </p>
        </div>

        {/* Auth form */}
        <form onSubmit={handleSubmit} className="glass-panel p-8 space-y-6">
          {/* Error message */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          {!isLogin && (
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/60" />
              <Input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={!isLogin}
                disabled={loading}
                className="pl-12 h-12 bg-muted/30 border-primary/20 focus:border-primary/50 rounded-xl font-display tracking-wider text-foreground placeholder:text-muted-foreground"
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/60" />
            <Input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="pl-12 h-12 bg-muted/30 border-primary/20 focus:border-primary/50 rounded-xl font-display tracking-wider text-foreground placeholder:text-muted-foreground"
            />
          </div>

          {!isLogin && (
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/60" />
              <Input
                type="tel"
                placeholder="Phone Number (Optional)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={loading}
                className="pl-12 h-12 bg-muted/30 border-primary/20 focus:border-primary/50 rounded-xl font-display tracking-wider text-foreground placeholder:text-muted-foreground"
              />
            </div>
          )}

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/60" />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              minLength={6}
              className="pl-12 h-12 bg-muted/30 border-primary/20 focus:border-primary/50 rounded-xl font-display tracking-wider text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl font-display tracking-wider text-base bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity glow-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                {isLogin ? "AUTHENTICATING..." : "CREATING..."}
              </>
            ) : (
              <>
                {isLogin ? "AUTHENTICATE" : "CREATE PROFILE"}
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>

          {/* Toggle */}
          <div className="text-center pt-4 border-t border-primary/10">
            <p className="text-muted-foreground text-sm">
              {isLogin ? "No profile yet?" : "Already registered?"}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="ml-2 text-primary hover:text-primary/80 transition-colors font-display tracking-wider"
              >
                {isLogin ? "SIGN UP" : "LOGIN"}
              </button>
            </p>
          </div>
        </form>

        {/* Footer */}
        <p className="text-center text-muted-foreground/50 text-xs mt-8 tracking-wider">
          Secure biometric authentication protocol
        </p>
      </div>
    </div>
  );
};

export default Auth;
