import { useState, useCallback, useRef, useEffect } from "react";
import { Upload, FileText, Check, Scan, X } from "lucide-react";
import { analyzeHealthReport } from "@/lib/api";

// Upload Doctor Reports (PDF, JPG, PNG) → POST /extract/ when not logged in, or POST /reports/upload-analyze when logged in

interface FloatingUploadPanelProps {
  onAnalysisComplete?: (data: any) => void;
}

const FloatingUploadPanel = ({ onAnalysisComplete }: FloatingUploadPanelProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parametersCount, setParametersCount] = useState(0);
  const [anomaliesCount, setAnomaliesCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Reset after successful upload (auto-reset after 5 seconds)
  useEffect(() => {
    if (isComplete && !isProcessing) {
      const timer = setTimeout(() => {
        handleReset();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isComplete, isProcessing]);
  
  const handleReset = () => {
    setIsComplete(false);
    setIsProcessing(false);
    setError(null);
    setParametersCount(0);
    setAnomaliesCount(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processFile = async (file: File) => {
    // Validate file type
    const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    const isValidType = validTypes.includes(file.type) || 
                       file.name.toLowerCase().endsWith('.pdf') ||
                       file.name.toLowerCase().endsWith('.jpg') ||
                       file.name.toLowerCase().endsWith('.jpeg') ||
                       file.name.toLowerCase().endsWith('.png');
    
    if (!isValidType) {
      setError('Please upload a PDF or image file (PDF, JPG, PNG)');
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setError('File size must be less than 10MB');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setIsComplete(false);

    try {
      // Analyze and save to database (analyzeHealthReport now saves automatically)
      const analysis = await analyzeHealthReport(file);
      
      // Calculate parameters and anomalies
      const params = analysis.risks.length + analysis.interpretations.length;
      const anomalies = analysis.interpretations.filter((i: any) => i.severity === 'high' || i.severity === 'medium').length;
      
      setParametersCount(params);
      setAnomaliesCount(anomalies);
      setIsComplete(true);
      
      // Notify parent component
      if (onAnalysisComplete) {
        onAnalysisComplete(analysis);
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err?.message || 'Failed to process file');
      setIsComplete(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  return (
    <div className="glass-panel-accent p-5 animate-float" style={{ animationDelay: '-3s' }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-accent/10 border border-accent/30">
          <FileText className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h3 className="font-display text-sm text-accent tracking-wider">UPLOAD DOCTOR REPORTS</h3>
          <p className="text-xs text-muted-foreground">Lab reports & prescriptions</p>
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
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
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
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleReset();
              }}
              className="mt-2 px-3 py-1 text-xs text-success/80 hover:text-success border border-success/30 rounded hover:bg-success/10 transition-colors"
            >
              Upload New File
            </button>
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

      {/* Error message */}
      {error && (
        <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
          <p className="text-xs text-destructive break-words whitespace-pre-wrap">{error}</p>
        </div>
      )}

      {/* Quick stats when complete */}
      {isComplete && (
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="p-3 rounded-lg bg-muted/20 border border-primary/20 text-center">
            <p className="font-display text-lg text-primary">{parametersCount}</p>
            <p className="text-xs text-muted-foreground">Parameters</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/20 border border-accent/20 text-center">
            <p className="font-display text-lg text-accent">{anomaliesCount}</p>
            <p className="text-xs text-muted-foreground">Anomalies</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FloatingUploadPanel;
