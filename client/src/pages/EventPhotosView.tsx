import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Photo, Event } from "@shared/schema";
import { Trash2, Download, ArrowLeft, Eye } from "lucide-react";
import { useState } from "react";

export default function EventPhotosView() {
  const { eventId } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const { data: event, isLoading: eventLoading } = useQuery<Event>({
    queryKey: [`/api/events/${eventId}`],
    enabled: !!eventId,
  });

  const { data: photos = [], isLoading: photosLoading } = useQuery<Photo[]>({
    queryKey: [`/api/events/${eventId}/photos`],
    enabled: !!eventId,
  });

  const handleDeletePhoto = async (photoId: number) => {
    try {
      await apiRequest("DELETE", `/api/admin/photos/${photoId}`);
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}/photos`] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Photo deleted successfully" });
      setDeleteConfirm(null);
      if (selectedPhoto?.id === photoId) {
        setSelectedPhoto(null);
      }
    } catch (error: any) {
      toast({
        title: "Failed to delete photo",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const downloadPhoto = (photo: Photo) => {
    const link = document.createElement('a');
    link.href = photo.url;
    link.download = photo.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (eventLoading || photosLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading photos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => window.history.back()}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {(event as Event)?.name || 'Event Photos'}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {(photos as Photo[]).length} photos • Code: {(event as Event)?.code}
                </p>
              </div>
            </div>
            <Badge variant="outline" className="text-lg px-4 py-2">
              {(event as Event)?.code}
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {(photos as Photo[]).length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Eye className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No photos yet</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Photos will appear here once uploaded to this event
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {(photos as Photo[]).map((photo: Photo) => (
              <Card key={photo.id} className="group relative overflow-hidden hover:shadow-lg transition-all duration-300">
                <div className="aspect-square relative bg-gray-100 dark:bg-gray-800">
                  <img
                    src={photo.url}
                    alt={photo.filename}
                    className="w-full h-full object-cover cursor-pointer transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                    onClick={() => setSelectedPhoto(photo)}
                    onError={(e) => {
                      console.error('EventPhotosView: Image failed to load:', photo.url, photo.filename);
                      const target = e.currentTarget as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = `
                          <div class="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400 p-4 bg-red-50 dark:bg-red-900">
                            <div class="text-red-500 text-2xl mb-2">⚠</div>
                            <div class="text-xs text-center break-all font-mono">${photo.filename}</div>
                            <div class="text-xs mt-1">Image load failed</div>
                            <div class="text-xs mt-1 opacity-75">${photo.url}</div>
                          </div>
                        `;
                      }
                    }}
                    onLoad={() => {
                      console.log('EventPhotosView: Image loaded successfully:', photo.url, photo.filename);
                    }}
                  />
                  
                  {/* Overlay with actions */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadPhoto(photo);
                        }}
                        className="h-8 w-8 p-0"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirm(photo.id);
                        }}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Photo info */}
                <CardContent className="p-3">
                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate mb-1">
                    {photo.filename}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {new Date(photo.createdAt).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Full-size photo modal */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img
              src={selectedPhoto.url}
              alt={selectedPhoto.filename}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="absolute top-4 right-4 flex gap-2">
              <Button
                variant="secondary"
                onClick={() => downloadPhoto(selectedPhoto)}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button
                variant="destructive"
                onClick={() => setDeleteConfirm(selectedPhoto.id)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
              <Button
                variant="outline"
                onClick={() => setSelectedPhoto(null)}
              >
                Close
              </Button>
            </div>
            <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white p-3 rounded">
              <p className="font-medium">{selectedPhoto.filename}</p>
              <p className="text-sm opacity-75">
                Uploaded {new Date(selectedPhoto.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-red-600">Delete Photo</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Are you sure you want to delete this photo? This action cannot be undone.
              </p>
              <div className="flex gap-2 justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => setDeleteConfirm(null)}
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => handleDeletePhoto(deleteConfirm)}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}