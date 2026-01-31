import { useState, useCallback } from "react";
import { Upload, FileText, X, Check } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface UploadedFile {
  name: string;
  progress: number;
  status: "uploading" | "complete" | "error";
}

interface ExtractedValue {
  parameter: string;
  value: string;
  unit: string;
  status: "normal" | "high" | "low";
}

const mockExtractedValues: ExtractedValue[] = [
  { parameter: "Blood Glucose", value: "142", unit: "mg/dL", status: "high" },
  { parameter: "Blood Pressure", value: "130/85", unit: "mmHg", status: "high" },
  { parameter: "Cholesterol", value: "195", unit: "mg/dL", status: "normal" },
  { parameter: "Creatinine", value: "1.1", unit: "mg/dL", status: "normal" },
];

const UploadReportsCard = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [showExtracted, setShowExtracted] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const simulateUpload = (fileName: string) => {
    const newFile: UploadedFile = {
      name: fileName,
      progress: 0,
      status: "uploading",
    };
    setUploadedFiles((prev) => [...prev, newFile]);

    const interval = setInterval(() => {
      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.name === fileName
            ? {
                ...f,
                progress: Math.min(f.progress + 20, 100),
                status: f.progress >= 80 ? "complete" : "uploading",
              }
            : f
        )
      );
    }, 300);

    setTimeout(() => {
      clearInterval(interval);
      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.name === fileName ? { ...f, progress: 100, status: "complete" } : f
        )
      );
      setShowExtracted(true);
    }, 1500);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    files.forEach((file) => simulateUpload(file.name));
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => simulateUpload(file.name));
    }
  };

  const removeFile = (fileName: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.name !== fileName));
    if (uploadedFiles.length <= 1) {
      setShowExtracted(false);
    }
  };

  const getStatusColor = (status: ExtractedValue["status"]) => {
    switch (status) {
      case "high":
        return "text-destructive";
      case "low":
        return "text-warning";
      default:
        return "text-success";
    }
  };

  return (
    <div className="health-card animate-fade-in" style={{ animationDelay: "0.1s" }}>
      <h2 className="text-lg font-semibold text-foreground mb-4">
        Upload Medical Reports
      </h2>

      {/* Drag & Drop Area */}
      <label
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ${
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-secondary/30"
        }`}
      >
        <input
          type="file"
          className="hidden"
          accept=".pdf,.jpg,.jpeg,.png"
          multiple
          onChange={handleFileInput}
        />
        <Upload
          className={`w-8 h-8 mb-2 transition-colors ${
            isDragging ? "text-primary" : "text-muted-foreground"
          }`}
        />
        <p className="text-sm text-muted-foreground text-center">
          <span className="font-medium text-primary">Click to upload</span> or
          drag and drop
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          PDF, JPG, PNG (Lab reports or prescriptions)
        </p>
      </label>

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="mt-4 space-y-3">
          {uploadedFiles.map((file) => (
            <div
              key={file.name}
              className="flex items-center gap-3 p-3 bg-secondary/50 rounded-xl"
            >
              <FileText className="w-5 h-5 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {file.name}
                </p>
                {file.status === "uploading" && (
                  <Progress value={file.progress} className="h-1.5 mt-1.5" />
                )}
              </div>
              {file.status === "complete" ? (
                <Check className="w-5 h-5 text-success shrink-0" />
              ) : (
                <button
                  onClick={() => removeFile(file.name)}
                  className="p-1 hover:bg-secondary rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Extracted Values Preview */}
      {showExtracted && (
        <div className="mt-4 animate-fade-in">
          <h3 className="text-sm font-medium text-foreground mb-3">
            Extracted Values
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-muted-foreground font-medium">
                    Parameter
                  </th>
                  <th className="text-right py-2 text-muted-foreground font-medium">
                    Value
                  </th>
                  <th className="text-right py-2 text-muted-foreground font-medium">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {mockExtractedValues.map((item) => (
                  <tr key={item.parameter} className="border-b border-border/50">
                    <td className="py-2.5 text-foreground">{item.parameter}</td>
                    <td className="py-2.5 text-right text-foreground">
                      {item.value} <span className="text-muted-foreground">{item.unit}</span>
                    </td>
                    <td className={`py-2.5 text-right font-medium capitalize ${getStatusColor(item.status)}`}>
                      {item.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadReportsCard;
