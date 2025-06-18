import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/contexts/AuthContext";

interface CreateEventFormProps {
  onSuccess?: () => void;
}

export default function CreateEventForm({ onSuccess }: CreateEventFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: ""
  });

  const createEventMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      console.log("Submitting event data:", data);
      const response = await apiRequest("POST", "/api/admin/events", data);
      console.log("Event creation response:", response);
      return response;
    },
    onSuccess: (data) => {
      console.log("Event created successfully:", data);
      toast({
        title: "Success",
        description: "Event created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      setFormData({ name: "", code: "", description: "" });
      onSuccess?.();
    },
    onError: (error: any) => {
      console.error("Event creation failed:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create event",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted with data:", formData);
    console.log("User:", user);
    
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Event name is required",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.code.trim()) {
      toast({
        title: "Error",
        description: "Event code is required",
        variant: "destructive",
      });
      return;
    }

    createEventMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'code' ? value.toUpperCase() : value
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Event</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Event Name *
            </label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter event name"
              required
            />
          </div>

          <div>
            <label htmlFor="code" className="block text-sm font-medium mb-1">
              Event Code *
            </label>
            <Input
              id="code"
              type="text"
              value={formData.code}
              onChange={(e) => handleInputChange('code', e.target.value)}
              placeholder="EVENTCODE123"
              required
              className="uppercase"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">
              Description
            </label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Event description (optional)"
              rows={3}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={createEventMutation.isPending}
          >
            {createEventMutation.isPending ? "Creating..." : "Create Event"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}