import { AlertCircle } from "lucide-react";

const Footer = () => {
  return (
    <footer className="px-4 py-6 mt-8 border-t border-border/50 bg-secondary/30">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-start gap-3 p-4 bg-card rounded-xl border border-border/50">
          <AlertCircle className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Important Disclaimer:</strong>{" "}
              This is an early risk screening tool designed to provide general
              health insights. It is <strong>not</strong> a medical diagnosis.
              Always consult with qualified healthcare professionals for medical
              advice, diagnosis, or treatment.
            </p>
          </div>
        </div>
        
        <p className="text-xs text-muted-foreground text-center mt-4">
          © 2024 AI Health Risk Assistant. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
