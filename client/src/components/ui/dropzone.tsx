import { useCallback } from "react";
import { useDropzone, DropzoneOptions } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DropzoneProps extends Omit<DropzoneOptions, 'onDrop'> {
  onDrop: (files: File[]) => void;
  className?: string;
  children?: React.ReactNode;
}

export function Dropzone({
  onDrop,
  className,
  children,
  ...options
}: DropzoneProps) {
  const handleDrop = useCallback(
    (acceptedFiles: File[]) => {
      onDrop(acceptedFiles);
    },
    [onDrop]
  );

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragReject,
    fileRejections,
  } = useDropzone({
    onDrop: handleDrop,
    ...options,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors",
        isDragActive && !isDragReject
          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
          : "border-gray-300 dark:border-gray-600 hover:border-blue-500",
        isDragReject && "border-red-500 bg-red-50 dark:bg-red-900/20",
        className
      )}
    >
      <input {...getInputProps()} />
      {children || (
        <>
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-semibold mb-2">
            {isDragActive
              ? "Drop files here"
              : "Drop files here or click to browse"}
          </h4>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Supports JPG, PNG files up to 10MB each
          </p>
          <Button variant="outline">Select Files</Button>
        </>
      )}
      {fileRejections.length > 0 && (
        <div className="mt-4 text-red-600 text-sm">
          {fileRejections.map(({ file, errors }) => (
            <div key={file.name} className="flex items-center gap-2">
              <X className="h-4 w-4" />
              <span>
                {file.name}: {errors.map((e) => e.message).join(", ")}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
