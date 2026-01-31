import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AlertCircle } from 'lucide-react';

// Shadcn Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const CreateEvent = () => {
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [serverError, setServerError] = useState(''); // State for conflict messages
  
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm();
  
  // Load venues on mount
  useEffect(() => {
    const fetchResources = async () => {
      try {
        const res = await api.get('/resources');
        setResources(res.data);
      } catch (err) { console.error("Failed to load venues"); }
    };
    fetchResources();
  }, []);

  const onSubmit = async (data) => {
    setServerError(''); // Clear previous errors
    try {
      await api.post('/events', data);
      navigate('/events');
    } catch (err) {
      // 1. Check if it's a conflict (409) or generic error
      if (err.response && err.response.status === 409) {
        // Use the specific message from the backend ("Venue is already booked...")
        setServerError(err.response.data.message);
      } else {
        setServerError("Something went wrong. Please try again later.");
      }
    }
  };

  return (
    <div className="flex justify-center py-10 px-4 bg-gray-50/50 min-h-screen">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Create New Event</CardTitle>
          <CardDescription>Fill in the details below to request a new campus event.</CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* --- ERROR ALERT --- */}
            {serverError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Booking Conflict</AlertTitle>
                <AlertDescription>
                  {serverError}
                </AlertDescription>
              </Alert>
            )}

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Event Title</Label>
              <Input 
                id="title" 
                placeholder="e.g., Annual Hackathon 2024" 
                {...register("title", { required: "Title is required" })} 
              />
              {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                placeholder="Describe the event purpose and agenda..." 
                className="min-h-25"
                {...register("description", { required: "Description is required" })} 
              />
            </div>

            {/* Date Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input 
                  id="startDate" 
                  type="datetime-local" 
                  {...register("startDate", { required: true })} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input 
                  id="endDate" 
                  type="datetime-local" 
                  {...register("endDate", { required: true })} 
                />
              </div>
            </div>

            <div className="space-y-2">
  <Label htmlFor="budget">Event Budget (₹)</Label>
  <Input 
    id="budget" 
    type="number" 
    placeholder="e.g. 5000" 
    {...register("budget", { required: "Budget is required", min: 0 })} 
  />
</div>

            {/* Venue Selector */}
            <div className="space-y-2">
              <Label htmlFor="venue">Venue</Label>
              <select 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                {...register("venueId", { required: "Venue is required" })}
              >
                <option value="">Select a Venue</option>
                {resources.map((res) => (
                  <option key={res._id} value={res._id}>
                    {res.name} (Cap: {res.capacity})
                  </option>
                ))}
              </select>
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Checking availability..." : "Create Event"}
            </Button>

          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateEvent;