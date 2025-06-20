import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import PhotoUpload from "@/components/PhotoUpload";
import PhotoGallery from "@/components/PhotoGallery";
import BulkPhotoUpload from "@/components/BulkPhotoUpload";
import EventEditDialog from "@/components/EventEditDialog";
import CreateEventForm from "@/components/CreateEventForm";
import { Event, Photo, insertEventSchema } from "@shared/schema";
import { Calendar, Users, Images, CheckCircle, Edit, Upload, Trash2, Settings, Eye, Download } from "lucide-react";
import { z } from "zod";

const eventFormSchema = insertEventSchema.extend({
  name: z.string().min(1, "Event name is required"),
  code: z.string().min(1, "Event code is required"),
});

type EventFormValues = z.infer<typeof eventFormSchema>;

export default function AdminDashboard() {
  const { user, firebaseUser } = useAuth();
  const { toast } = useToast();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showUploadPhotos, setShowUploadPhotos] = useState<Event | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [showBulkUpload, setShowBulkUpload] = useState<Event | null>(null);

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

  // Fetch admin stats
  const { data: stats } = useQuery<{
    totalEvents: number;
    totalPhotos: number;
    activeUsers: number;
    successfulMatches: number;
  }>({
    queryKey: ["/api/admin/stats"],
    enabled: user?.role === "admin",
  });

  // Fetch events
  const { data: events = [] } = useQuery<Event[]>({
    queryKey: ["/api/events"],
    enabled: user?.role === "admin",
  });

  // Fetch photos for selected event
  const { data: eventPhotos = [] } = useQuery<Photo[]>({
    queryKey: [`/api/events/${selectedEvent?.id}/photos`],
    enabled: !!selectedEvent,
  });

  // Create event mutation
  const createEventMutation = useMutation({
    mutationFn: async (values: EventFormValues) => {
      console.log('Making API request with values:', values);
      const response = await apiRequest("POST", "/api/admin/events", {
        ...values,
        createdBy: user!.id,
      });
      console.log('API response:', response);
      return response;
    },
    onSuccess: (data) => {
      console.log('Event created successfully:', data);
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({
        title: "Event created successfully",
        description: "Your new event is now active",
      });
      setShowCreateEvent(false);
      form.reset();
    },
    onError: (error: any) => {
      console.error('Event creation error:', error);
      toast({
        title: "Failed to create event",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    },
  });

  // Update event mutation
  const updateEventMutation = useMutation({
    mutationFn: async ({ eventId, values }: { eventId: number; values: EventFormValues }) => {
      return apiRequest("PUT", `/api/admin/events/${eventId}`, values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: "Event updated successfully",
        description: "Event details have been saved",
      });
      setSelectedEvent(null);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update event",
        description: error.message,
        variant: "destructive",
      });
    },
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

  // Delete photo mutation is now handled by PhotoGallery component

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      name: "",
      code: "",
      description: "",
    },
  });

  const onSubmit = (values: EventFormValues) => {
    console.log('Form submitted with values:', values);
    console.log('User:', user);
    console.log('Form errors:', form.formState.errors);
    console.log('Form is valid:', form.formState.isValid);
    
    if (!form.formState.isValid) {
      console.log('Form validation failed, not submitting');
      return;
    }
    
    createEventMutation.mutate(values);
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

        {/* Admin Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Events</p>
                  <p className="text-2xl font-bold">{stats?.totalEvents || 0}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Photos</p>
                  <p className="text-2xl font-bold">{stats?.totalPhotos || 0}</p>
                </div>
                <Images className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Active Users</p>
                  <p className="text-2xl font-bold">{stats?.activeUsers || 0}</p>
                </div>
                <Users className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Successful Matches</p>
                  <p className="text-2xl font-bold">{stats?.successfulMatches || 0}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Event Creation */}
        <div className="mb-8">
          <CreateEventForm onSuccess={() => {
            // Refresh data after successful creation
            queryClient.invalidateQueries({ queryKey: ["/api/events"] });
            queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
          }} />
        </div>

        {/* Event Management */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Event Management</CardTitle>
                <CardDescription>Manage your existing events</CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-4">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{event.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Code: <span className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{event.code}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingEvent(event)}
                      title="Edit Event"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedEvent(event)}
                      title="View Photos"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowBulkUpload(event)}
                      title="Bulk Upload"
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete "${event.name}"? This will also delete all photos in this event.`)) {
                          deleteEventMutation.mutate(event.id);
                        }
                      }}
                      className="text-red-600 hover:text-red-700"
                      title="Delete Event"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              
              {events.length === 0 && (
                <div className="text-center py-8">
                  <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No events yet</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Create your first event to get started
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Event Edit Dialog */}
        <EventEditDialog
          event={editingEvent}
          open={!!editingEvent}
          onOpenChange={(open) => !open && setEditingEvent(null)}
        />

        {/* Bulk Photo Upload Dialog */}
        <Dialog open={!!showBulkUpload} onOpenChange={() => setShowBulkUpload(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Bulk Upload Photos to {showBulkUpload?.name}</DialogTitle>
            </DialogHeader>
            {showBulkUpload && (
              <BulkPhotoUpload
                eventId={showBulkUpload.id}
                onUploadComplete={() => {
                  queryClient.invalidateQueries({ 
                    queryKey: [`/api/events/${showBulkUpload.id}/photos`] 
                  });
                  queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
                  setShowBulkUpload(null);
                }}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Event Photos */}
        {selectedEvent && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>{selectedEvent.name} - Photos</CardTitle>
                  <CardDescription>
                    Manage photos for this event ({eventPhotos.length} photos)
                  </CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowBulkUpload(selectedEvent)}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Add Photos
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      window.open(`/admin/events/${selectedEvent.id}/photos`, '_blank');
                    }}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Photos
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedEvent(null)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {eventPhotos.length > 0 ? (
                <div className="space-y-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {eventPhotos.length} photos uploaded - Click "View Photos" to open full gallery in new tab
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <div className="flex items-center justify-center space-x-4">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-2">
                          <Images className="h-8 w-8 text-blue-600" />
                        </div>
                        <p className="text-sm font-medium">{eventPhotos.length} Photos</p>
                        <p className="text-xs text-gray-500">Ready to view</p>
                      </div>
                      <div className="text-2xl text-gray-300">→</div>
                      <Button
                        onClick={() => {
                          window.open(`/admin/events/${selectedEvent.id}/photos`, '_blank');
                        }}
                        className="flex items-center gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        Open Gallery
                      </Button>
                    </div>
                    <div className="mt-4 text-xs text-gray-500 text-center">
                      Photo filenames: {eventPhotos.map(p => p.filename).join(', ')}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Images className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No photos yet</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Upload photos to this event to get started
                  </p>
                  <Button onClick={() => setShowBulkUpload(selectedEvent)}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Photos
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
