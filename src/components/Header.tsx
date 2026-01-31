import { Shield } from "lucide-react";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border/50 px-4 py-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">
              AI Health Risk Assistant
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Early risk screening, not a medical diagnosis
            </p>
          </div>
          <div className="flex items-center gap-2 bg-success/10 text-success px-3 py-1.5 rounded-full">
            <Shield className="w-4 h-4" />
            <span className="text-xs font-medium">Private</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
