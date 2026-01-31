import { useState, useCallback } from "react";
import { Upload, FileText, Check, Scan } from "lucide-react";

const FloatingUploadPanel = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const simulateUpload = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsComplete(true);
    }, 2000);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    simulateUpload();
  }, []);

  const handleFileInput = () => {
    simulateUpload();
  };

  return (
    <div className="glass-panel-accent p-5 animate-float" style={{ animationDelay: '-3s' }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-accent/10 border border-accent/30">
          <FileText className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h3 className="font-display text-sm text-accent tracking-wider">UPLOAD REPORTS</h3>
          <p className="text-xs text-muted-foreground">Medical data extraction</p>
        </div>
      </div>

      {/* Drop zone */}
      <label
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 overflow-hidden ${
          isDragging
            ? "border-accent bg-accent/10 glow-accent"
            : isComplete
            ? "border-success bg-success/10"
            : "border-accent/30 hover:border-accent/50 hover:bg-accent/5"
        }`}
      >
        <input
          type="file"
          className="hidden"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFileInput}
        />

        {/* Processing animation */}
        {isProcessing && (
          <div className="absolute inset-0 bg-card/80 flex flex-col items-center justify-center">
            <Scan className="w-10 h-10 text-accent animate-glow-pulse" />
            <p className="font-display text-xs text-accent mt-3 tracking-widest">SCANNING...</p>
            <div className="w-24 h-1 bg-muted rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-accent animate-[shimmer_1s_ease-in-out_infinite]" 
                   style={{ width: '60%' }} />
            </div>
          </div>
        )}

        {/* Complete state */}
        {isComplete && !isProcessing && (
          <>
            <div className="p-3 rounded-full bg-success/20 border border-success/30 glow-success">
              <Check className="w-6 h-6 text-success" />
            </div>
            <p className="font-display text-xs text-success mt-3 tracking-widest">DATA EXTRACTED</p>
          </>
        )}

        {/* Default state */}
        {!isProcessing && !isComplete && (
          <>
            <Upload className={`w-8 h-8 mb-2 transition-colors ${isDragging ? 'text-accent' : 'text-muted-foreground'}`} />
            <p className="text-sm text-center">
              <span className="text-accent font-medium">Drop files</span>
              <span className="text-muted-foreground"> or click</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG</p>
          </>
        )}

        {/* Scan line effect when dragging */}
        {isDragging && (
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-x-0 h-1 bg-gradient-to-b from-accent/50 to-transparent animate-scan-line" />
          </div>
        )}
      </label>

      {/* Quick stats when complete */}
      {isComplete && (
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="p-3 rounded-lg bg-muted/20 border border-primary/20 text-center">
            <p className="font-display text-lg text-primary">3</p>
            <p className="text-xs text-muted-foreground">Parameters</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/20 border border-accent/20 text-center">
            <p className="font-display text-lg text-accent">2</p>
            <p className="text-xs text-muted-foreground">Anomalies</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FloatingUploadPanel;
