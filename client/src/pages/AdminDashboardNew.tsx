import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import PhotoGallery from "@/components/PhotoGallery";
import BulkPhotoUpload from "@/components/BulkPhotoUpload";
import CreateEventForm from "@/components/CreateEventForm";
import { Event, Photo } from "@shared/schema";
import { Calendar, Users, Images, CheckCircle, Edit, Upload, Trash2, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showUploadPhotos, setShowUploadPhotos] = useState<Event | null>(null);
  const [showBulkUpload, setShowBulkUpload] = useState<Event | null>(null);
  const [editingEventName, setEditingEventName] = useState<{ id: number; name: string } | null>(null);

  // Redirect if not admin
  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
              <p className="text-gray-600 dark:text-gray-400">
                You need admin privileges to access this page.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fetch events
  const { data: events = [], isLoading: eventsLoading } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  // Fetch admin stats
  const { data: stats } = useQuery<{
    totalEvents: number;
    totalPhotos: number;
    activeUsers: number;
    successfulMatches: number;
  }>({
    queryKey: ["/api/admin/stats"],
  });

  // Fetch photos for selected event
  const { data: photos = [], isLoading: photosLoading } = useQuery<Photo[]>({
    queryKey: [`/api/events/${selectedEvent?.id}/photos`],
    enabled: !!selectedEvent,
  });

  // Delete event mutation
  const deleteEventMutation = useMutation({
    mutationFn: async (eventId: number) => {
      return apiRequest("DELETE", `/api/admin/events/${eventId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      setSelectedEvent(null);
      toast({
        title: "Event deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete event",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete photo mutation
  const deletePhotoMutation = useMutation({
    mutationFn: async (photoId: number) => {
      return apiRequest("DELETE", `/api/admin/photos/${photoId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/events/${selectedEvent?.id}/photos`] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
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

  // Add updateEventName mutation
  const updateEventNameMutation = useMutation({
    mutationFn: async ({ eventId, name }: { eventId: number; name: string }) => {
      const event = events.find(e => e.id === eventId);
      if (!event) throw new Error("Event not found");
      
      return apiRequest("PUT", `/api/admin/events/${eventId}`, {
        name,
        code: event.code,
        description: event.description || ""
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      setEditingEventName(null);
      toast({
        title: "Event name updated",
        description: "The event name has been successfully updated"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update event name",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleEventNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEventName) return;
    
    const trimmedName = editingEventName.name.trim();
    if (!trimmedName) {
      toast({
        title: "Invalid name",
        description: "Event name cannot be empty",
        variant: "destructive"
      });
      return;
    }

    updateEventNameMutation.mutate({
      eventId: editingEventName.id,
      name: trimmedName
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage events, upload photos, and monitor system performance
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Events</p>
                  <p className="text-2xl font-bold">{stats?.totalEvents || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Images className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Photos</p>
                  <p className="text-2xl font-bold">{stats?.totalPhotos || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Users</p>
                  <p className="text-2xl font-bold">{stats?.activeUsers || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-emerald-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Successful Matches</p>
                  <p className="text-2xl font-bold">{stats?.successfulMatches || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Event Creation */}
        <div className="mb-8">
          <CreateEventForm onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["/api/events"] });
            queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
          }} />
        </div>

        {/* Event Management */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Event Management</CardTitle>
            <CardDescription>Manage your existing events</CardDescription>
          </CardHeader>
          
          <CardContent>
            {eventsLoading ? (
              <div className="text-center py-8">Loading events...</div>
            ) : events.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No events yet</p>
                <p className="text-sm text-gray-400">Create your first event above to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <div className="flex-1">
                      {editingEventName?.id === event.id ? (
                        <form onSubmit={handleEventNameSubmit} className="flex items-center gap-2">
                          <Input
                            value={editingEventName.name}
                            onChange={(e) => setEditingEventName({ id: event.id, name: e.target.value })}
                            className="h-8 py-1 w-64"
                            autoFocus
                            onBlur={handleEventNameSubmit}
                            onKeyDown={(e) => {
                              if (e.key === 'Escape') {
                                setEditingEventName(null);
                              }
                            }}
                          />
                        </form>
                      ) : (
                        <div className="flex items-center gap-2">
                          <h3 
                            className="font-semibold cursor-pointer hover:text-blue-600"
                            onClick={() => setEditingEventName({ id: event.id, name: event.name })}
                          >
                            {event.name}
                          </h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingEventName({ id: event.id, name: event.name })}
                            className="p-0 h-auto hover:bg-transparent"
                            title="Edit Event Name"
                          >
                            <Edit className="h-4 w-4 text-gray-500 hover:text-gray-700" />
                          </Button>
                        </div>
                      )}
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Code: {event.code} • Created: {new Date(event.createdAt).toLocaleDateString()}
                      </p>
                      {event.description && (
                        <p className="text-sm text-gray-500 mt-1">{event.description}</p>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedEvent(event)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowBulkUpload(event)}
                      >
                        <Upload className="h-4 w-4 mr-1" />
                        Upload
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteEventMutation.mutate(event.id)}
                        disabled={deleteEventMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Selected Event Photos */}
        {selectedEvent && (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Photos for {selectedEvent.name}</CardTitle>
                  <CardDescription>
                    Event Code: {selectedEvent.code} • {photos.length} photos
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setSelectedEvent(null)}
                >
                  Close
                </Button>
              </div>
            </CardHeader>
            
            <CardContent>
              {photosLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p>Loading photos...</p>
                </div>
              ) : photos.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No photos uploaded yet</p>
                  <Button
                    className="mt-4"
                    onClick={() => setShowBulkUpload(selectedEvent)}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Photos
                  </Button>
                </div>
              ) : (
                <PhotoGallery 
                  photos={photos} 
                  columns={4}
                  eventId={selectedEvent.id}
                  showDeleteButton={true}
                />
              )}
            </CardContent>
          </Card>
        )}

        {/* Bulk Photo Upload Modal */}
        {showBulkUpload && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Upload Photos for {showBulkUpload.name}</h2>
                <Button
                  variant="outline"
                  onClick={() => setShowBulkUpload(null)}
                >
                  Close
                </Button>
              </div>
              
              <BulkPhotoUpload
                eventId={showBulkUpload.id}
                onUploadComplete={() => {
                  setShowBulkUpload(null);
                  queryClient.invalidateQueries({ queryKey: ["/api/events", selectedEvent?.id, "photos"] });
                  queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}