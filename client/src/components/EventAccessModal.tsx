import { useState } from "react";
import { useLocation } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Key } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/contexts/AuthContext";

interface EventAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EventAccessModal({ isOpen, onClose }: EventAccessModalProps) {
  const [eventCode, setEventCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { firebaseUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!eventCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter an event code",
        variant: "destructive",
      });
      return;
    }

    if (!firebaseUser) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to access events",
        variant: "destructive",
      });
      setLocation("/login");
      onClose();
      return;
    }

    setLoading(true);
    
    try {
      const token = await firebaseUser.getIdToken();
      const response = await apiRequest("POST", "/api/events/access", {
        code: eventCode.toUpperCase(),
      });
      
      if (response.ok) {
        const event = await response.json();
        toast({
          title: "Success!",
          description: `Access granted to ${event.name}`,
        });
        setLocation(`/events/${event.id}`);
        onClose();
        setEventCode("");
      }
    } catch (error: any) {
      console.error("Event access error:", error);
      toast({
        title: "Access Denied",
        description: error.message || "Invalid event code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <Key className="h-5 w-5 text-blue-600" />
            </div>
            Enter Event Code
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Enter the unique code provided by your event organizer to access photos.
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="eventCode">Event Code</Label>
              <Input
                id="eventCode"
                type="text"
                placeholder="e.g., WEDDING2024"
                value={eventCode}
                onChange={(e) => setEventCode(e.target.value.toUpperCase())}
                className="uppercase"
                disabled={loading}
              />
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={loading || !eventCode.trim()}
              >
                {loading ? "Accessing..." : "Access Event"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
