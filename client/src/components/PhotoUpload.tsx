import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface PhotoUploadProps {
  eventId: number;
  onUploadComplete?: () => void;
}

interface UploadFile extends File {
  id: string;
  progress: number;
  status: "pending" | "uploading" | "complete" | "error";
}

export default function PhotoUpload({ eventId, onUploadComplete }: PhotoUploadProps) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const { firebaseUser } = useAuth();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      ...file,
      id: Math.random().toString(36).substr(2, 9),
      progress: 0,
      status: "pending" as const,
    }));
    
    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFileSize: 10 * 1024 * 1024, // 10MB
    multiple: true,
  });

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const uploadFiles = async () => {
    if (!firebaseUser || files.length === 0) return;
    
    setUploading(true);
    
    try {
      const token = await firebaseUser.getIdToken();
      const formData = new FormData();
      
      files.forEach(file => {
        formData.append('photos', file);
      });

      // Update all files to uploading status
      setFiles(prev => prev.map(f => ({ ...f, status: "uploading" as const })));

      const response = await fetch(`/api/admin/events/${eventId}/photos`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        
        // Update all files to complete status
        setFiles(prev => prev.map(f => ({ 
          ...f, 
          status: "complete" as const, 
          progress: 100 
        })));

        toast({
          title: "Upload Successful",
          description: result.message,
        });

        // Clear files after successful upload
        setTimeout(() => {
          setFiles([]);
          onUploadComplete?.();
        }, 2000);
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      
      // Update all files to error status
      setFiles(prev => prev.map(f => ({ ...f, status: "error" as const })));

      toast({
        title: "Upload Failed",
        description: "Failed to upload photos. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
            : "border-gray-300 dark:border-gray-600 hover:border-blue-500"
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h4 className="text-lg font-semibold mb-2">
          {isDragActive ? "Drop photos here" : "Drop photos here or click to browse"}
        </h4>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Supports JPG, PNG files up to 10MB each
        </p>
        <Button variant="outline" disabled={uploading}>
          Select Photos
        </Button>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="font-semibold">Selected Photos ({files.length})</h4>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFiles([])}
                disabled={uploading}
              >
                Clear All
              </Button>
              <Button
                onClick={uploadFiles}
                disabled={uploading || files.length === 0}
                size="sm"
              >
                {uploading ? "Uploading..." : "Upload Photos"}
              </Button>
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-2">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>

                {file.status === "uploading" && (
                  <div className="w-24">
                    <Progress value={file.progress} className="h-2" />
                  </div>
                )}

                {file.status === "complete" && (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                )}

                {file.status === "error" && (
                  <X className="h-5 w-5 text-red-600" />
                )}

                {file.status === "pending" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(file.id)}
                    disabled={uploading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
