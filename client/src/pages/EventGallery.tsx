import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import PhotoGallery from "@/components/PhotoGallery";
import { Event, Photo } from "@shared/schema";
import { Download, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function EventGallery() {
  const { id } = useParams();
  const eventId = parseInt(id || "0");

  // Fetch event details
  const { data: events = [] } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  const event = events.find(e => e.id === eventId);

  // Fetch event photos
  const { data: photos = [], isLoading } = useQuery<Photo[]>({
    queryKey: [`/api/events/${eventId}/photos`],
    enabled: !!eventId,
  });

  const downloadAllPhotos = () => {
    // Create a zip file or download individual photos
    photos.forEach((photo, index) => {
      setTimeout(() => {
        const link = document.createElement('a');
        link.href = photo.url;
        link.download = photo.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }, index * 100); // Stagger downloads
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Event Not Found</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                The event you're looking for doesn't exist or has been removed.
              </p>
              <Link href="/">
                <Button>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Go Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <Link href="/">
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                </Link>
                <h1 className="text-3xl font-bold">{event.name}</h1>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Event Code: <span className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{event.code}</span> • 
                <span className="ml-2">{photos.length} photos</span>
              </p>
              {event.description && (
                <p className="text-gray-600 dark:text-gray-400 mt-2">{event.description}</p>
              )}
            </div>
            
            {photos.length > 0 && (
              <Button onClick={downloadAllPhotos} className="hidden sm:flex">
                <Download className="h-4 w-4 mr-2" />
                Download All
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Download Button */}
        {photos.length > 0 && (
          <div className="sm:hidden mb-6">
            <Button onClick={downloadAllPhotos} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Download All Photos
            </Button>
          </div>
        )}

        {/* Photo Gallery */}
        <div className="bg-white dark:bg-gray-900">
          <PhotoGallery photos={photos} columns={4} />
        </div>

        {photos.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">No photos yet</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Photos will appear here once they are uploaded by the event organizer.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
