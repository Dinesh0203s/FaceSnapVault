import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Photo } from "@shared/schema";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/contexts/AuthContext";
import { Download, X, Trash2 } from "lucide-react";

interface PhotoGalleryProps {
  photos: Photo[];
  columns?: number;
  eventId?: number;
  showDeleteButton?: boolean;
}

export default function PhotoGallery({ photos, columns = 4, eventId, showDeleteButton = false }: PhotoGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Delete photo mutation
  const deletePhotoMutation = useMutation({
    mutationFn: async (photoId: number) => {
      return apiRequest("DELETE", `/api/admin/photos/${photoId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events", eventId, "photos"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      setSelectedPhoto(null);
      toast({
        title: "Photo deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete photo",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const downloadPhoto = (photo: Photo) => {
    const link = document.createElement('a');
    link.href = photo.url;
    link.download = photo.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const deletePhoto = (photo: Photo) => {
    if (confirm(`Are you sure you want to delete ${photo.filename}?`)) {
      deletePhotoMutation.mutate(photo.id);
    }
  };

  const getGridCols = () => {
    switch (columns) {
      case 2: return "grid-cols-1 sm:grid-cols-2";
      case 3: return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3";
      case 4: return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
      default: return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
    }
  };

  if (photos.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold mb-2">No photos found</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Photos will appear here once they are uploaded and processed.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className={`grid ${getGridCols()} gap-4`}>
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="group relative overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 aspect-square cursor-pointer"
            onClick={() => setSelectedPhoto(photo)}
          >
            <img
              src={photo.url}
              alt={photo.filename}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-end">
              <div className="p-3 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p className="text-sm font-medium truncate">{photo.filename}</p>
                <p className="text-xs">
                  {new Date(photo.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Photo Modal */}
      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-4xl p-0">
          {selectedPhoto && (
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-4 right-4 z-10 bg-black/50 text-white hover:bg-black/70"
                onClick={() => setSelectedPhoto(null)}
              >
                <X className="h-4 w-4" />
              </Button>
              
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.filename}
                className="w-full h-auto max-h-[80vh] object-contain"
              />
              
              <div className="absolute bottom-4 left-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg p-4">
                <div className="flex justify-between items-center text-white">
                  <div>
                    <p className="font-medium">{selectedPhoto.filename}</p>
                    <p className="text-sm opacity-75">
                      {new Date(selectedPhoto.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => downloadPhoto(selectedPhoto)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    {showDeleteButton && user?.role === 'admin' && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deletePhoto(selectedPhoto)}
                        disabled={deletePhotoMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {deletePhotoMutation.isPending ? "Deleting..." : "Delete"}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
