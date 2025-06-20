import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PhotoGallery from "@/components/PhotoGallery";
import { Photo, Event } from "@shared/schema";
import { Download, ArrowLeft } from "lucide-react";

export default function EventPhotosView() {
  const { eventId } = useParams();

  const { data: event, isLoading: eventLoading } = useQuery<Event>({
    queryKey: [`/api/events/${eventId}`],
    enabled: !!eventId,
  });

  const { data: photos = [], isLoading: photosLoading } = useQuery<Photo[]>({
    queryKey: [`/api/events/${eventId}/photos`],
    enabled: !!eventId,
  });

  const downloadAllPhotos = () => {
    (photos as Photo[]).forEach((photo, index) => {
      setTimeout(() => {
        const link = document.createElement('a');
        link.href = photo.url;
        link.download = photo.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }, index * 100);
    });
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
            <div className="flex items-center gap-4">
              {(photos as Photo[]).length > 0 && (
                <Button
                  onClick={downloadAllPhotos}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download All
                </Button>
              )}
              <Badge variant="outline" className="text-lg px-4 py-2">
                {(event as Event)?.code}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PhotoGallery 
          photos={photos as Photo[]} 
          columns={5} 
          eventId={parseInt(eventId || "0")}
          showDeleteButton={true}
        />
      </div>
    </div>
  );
}