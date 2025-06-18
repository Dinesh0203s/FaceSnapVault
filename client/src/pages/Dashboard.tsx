import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import PhotoGallery from "@/components/PhotoGallery";
import { Upload, Search, Camera } from "lucide-react";
import { Event } from "@shared/schema";

export default function Dashboard() {
  const { user, firebaseUser } = useAuth();
  const { toast } = useToast();
  const [selectedEvent, setSelectedEvent] = useState<string>("");
  const [uploading, setUploading] = useState(false);

  // Fetch events
  const { data: events = [] } = useQuery<Event[]>({
    queryKey: ["/api/events"],
    enabled: !!user,
  });

  // Fetch user matches
  const { data: matches = [], refetch: refetchMatches } = useQuery({
    queryKey: ["/api/user/matches"],
    enabled: !!user,
  });

  const handleSelfieUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedEvent || !firebaseUser) return;

    setUploading(true);

    try {
      const token = await firebaseUser.getIdToken();
      const formData = new FormData();
      formData.append('selfie', file);
      formData.append('eventId', selectedEvent);

      const response = await fetch('/api/match-faces', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Search Complete!",
          description: result.message,
        });
        refetchMatches();
      } else {
        const error = await response.json();
        throw new Error(error.message);
      }
    } catch (error: any) {
      toast({
        title: "Search Failed",
        description: error.message || "Failed to search for photos",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Sign In Required</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Please sign in to access your dashboard.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Welcome back, {user.name}!</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Find your photos by uploading a selfie
          </p>
        </div>

        {/* Upload Selfie Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Find Your Photos</CardTitle>
            <CardDescription>
              Upload a clear selfie to find photos of yourself from events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Selfie Upload */}
              <div>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center hover:border-blue-500 transition-colors">
                  <Camera className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <h4 className="font-semibold mb-2">Upload Selfie</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Take a photo or upload from gallery
                  </p>
                  <Button asChild disabled={!selectedEvent || uploading}>
                    <label>
                      <Upload className="h-4 w-4 mr-2" />
                      {uploading ? "Processing..." : "Add Photo"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleSelfieUpload}
                        disabled={!selectedEvent || uploading}
                      />
                    </label>
                  </Button>
                </div>
              </div>
              
              {/* Event Selection */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Select Event</label>
                  <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an event to search" />
                    </SelectTrigger>
                    <SelectContent>
                      {events.map((event) => (
                        <SelectItem key={event.id} value={event.id.toString()}>
                          {event.name} ({event.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedEvent && (
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Selected event: {events.find(e => e.id.toString() === selectedEvent)?.name}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Photo History */}
        <Card>
          <CardHeader>
            <CardTitle>Your Photo History</CardTitle>
            <CardDescription>
              Photos matched to your previous searches
            </CardDescription>
          </CardHeader>
          <CardContent>
            {matches.length > 0 ? (
              <PhotoGallery 
                photos={matches.map(match => match.photo)} 
                columns={4}
              />
            ) : (
              <div className="text-center py-12">
                <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No photos found yet</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Upload a selfie above to start finding your photos
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
