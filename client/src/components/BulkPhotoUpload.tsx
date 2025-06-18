import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, CheckCircle, AlertCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface BulkPhotoUploadProps {
  eventId: number;
  onUploadComplete?: () => void;
}

interface UploadFile {
  file: File;
  id: string;
  progress: number;
  status: "pending" | "uploading" | "complete" | "error";
  error?: string;
}

export default function BulkPhotoUpload({ eventId, onUploadComplete }: BulkPhotoUploadProps) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadFile[] = acceptedFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      progress: 0,
      status: "pending"
    }));
    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    multiple: true
  });

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    
    for (const uploadFile of files) {
      if (uploadFile.status !== "pending") continue;
      
      try {
        // Update status to uploading
        setFiles(prev => prev.map(f => 
          f.id === uploadFile.id ? { ...f, status: "uploading" } : f
        ));

        const formData = new FormData();
        formData.append('photos', uploadFile.file);
        formData.append('eventId', eventId.toString());

        // Simulate progress updates
        const progressInterval = setInterval(() => {
          setFiles(prev => prev.map(f => 
            f.id === uploadFile.id 
              ? { ...f, progress: Math.min(f.progress + 10, 90) }
              : f
          ));
        }, 200);

        const response = await fetch('/api/admin/photos/upload', {
          method: 'POST',
          body: formData,
          headers: await getAuthHeaders(),
        });

        clearInterval(progressInterval);

        if (!response.ok) {
          throw new Error('Upload failed');
        }

        // Mark as complete
        setFiles(prev => prev.map(f => 
          f.id === uploadFile.id 
            ? { ...f, status: "complete", progress: 100 }
            : f
        ));

      } catch (error) {
        setFiles(prev => prev.map(f => 
          f.id === uploadFile.id 
            ? { 
                ...f, 
                status: "error", 
                progress: 0,
                error: error instanceof Error ? error.message : 'Upload failed'
              }
            : f
        ));
      }
    }

    setIsUploading(false);
    
    const completedCount = files.filter(f => f.status === "complete").length;
    if (completedCount > 0) {
      toast({
        title: "Upload Complete",
        description: `Successfully uploaded ${completedCount} photos`
      });
      onUploadComplete?.();
    }
  };

  const getAuthHeaders = async () => {
    const headers: Record<string, string> = {};
    const { auth } = await import("@/lib/firebase");
    
    if (auth.currentUser) {
      try {
        const token = await auth.currentUser.getIdToken();
        headers['Authorization'] = `Bearer ${token}`;
      } catch (error) {
        console.error('Failed to get auth token:', error);
      }
    }
    
    return headers;
  };

  const getStatusIcon = (status: UploadFile['status']) => {
    switch (status) {
      case "complete":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case "uploading":
        return <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      default:
        return <Upload className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Bulk Photo Upload</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive 
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          {isDragActive ? (
            <p>Drop the photos here...</p>
          ) : (
            <div>
              <p className="text-lg mb-2">Drag & drop photos here, or click to select</p>
              <p className="text-sm text-gray-500">Supports JPEG, PNG, GIF, WebP formats</p>
            </div>
          )}
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {files.map((uploadFile) => (
              <div key={uploadFile.id} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                {getStatusIcon(uploadFile.status)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{uploadFile.file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(uploadFile.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  {uploadFile.status === "uploading" && (
                    <Progress value={uploadFile.progress} className="mt-1" />
                  )}
                  {uploadFile.error && (
                    <p className="text-xs text-red-500 mt-1">{uploadFile.error}</p>
                  )}
                </div>
                {uploadFile.status === "pending" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(uploadFile.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Upload Button */}
        {files.length > 0 && (
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              {files.length} file{files.length !== 1 ? 's' : ''} selected
            </p>
            <div className="space-x-2">
              <Button
                variant="outline"
                onClick={() => setFiles([])}
                disabled={isUploading}
              >
                Clear All
              </Button>
              <Button
                onClick={uploadFiles}
                disabled={isUploading || files.every(f => f.status !== "pending")}
              >
                {isUploading ? "Uploading..." : "Upload Photos"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}