import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import AuthContext from '../context/AuthContext';
import { Button } from '@/components/ui/button'; // Shadcn Button
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, MapPin, User, MessageSquare } from 'lucide-react';
import { MessageCircle, Users } from 'lucide-react';


const EventDetails = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await api.get(`/events/${id}`);
        setEvent(res.data);
        
        if (user && res.data.participants.some(p => p._id === user._id)) {
            setIsRegistered(true);
        }
      } catch (err) {
        console.error("Failed to fetch event");
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id, user]);

  const handleRegister = async () => {
    if (!user) return navigate('/login');
    setRegistering(true);
    try {
      await api.post(`/events/${id}/register`);
      setIsRegistered(true);
    } catch (err) {
      alert("Registration failed");
    } finally {
      setRegistering(false);
    }
  };

  // --- NEW FUNCTION: START CHAT ---
  // Handle DM with Organizer
  const handleMessageOrganizer = async () => {
    if (!user) return navigate('/login');
    try {
      const res = await api.post('/chat', { targetUserId: event.organizer._id });
      // CRITICAL FIX: Pass the chat ID in state so ChatPage knows what to open
      navigate('/messages', { state: { openChatId: res.data._id } }); 
    } catch (error) {
      console.error("Failed to start chat", error);
    }
  };

  // Handle Joining Event Group
  const handleJoinGroupChat = async () => {
    if (!user) return navigate('/login');
    try {
      const res = await api.post(`/chat/group/${event._id}`);
      // Pass the group chat ID to open immediately
      navigate('/messages', { state: { openChatId: res.data._id } });
    } catch (error) {
      console.error("Failed to join group", error);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!event) return <div className="p-10 text-center">Event not found.</div>;

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <Card>
        <CardHeader className="bg-muted/20 border-b pb-6">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-3xl font-bold mb-2">{event.title}</CardTitle>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(event.startDate).toLocaleString()}
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {event.venue?.name || "TBA"}
                </div>
              </div>
            </div>
            <Badge variant={event.status === 'approved' ? 'default' : 'secondary'}>
              {event.status}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          {/* Organizer Info */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Organized by</p>
                <p className="font-semibold">{event.organizer?.name}</p>
              </div>
            </div>

            {/* MESSAGE BUTTON (Only show if user is NOT the organizer) */}
            {user && user._id !== event.organizer?._id && (
        <Button variant="outline" onClick={handleMessageOrganizer}>
          <MessageCircle className="w-4 h-4 mr-2" />
          DM Organizer
        </Button>
      )}

      {/* 2. Group Chat Button */}
      {user && (
         <Button variant="outline" onClick={handleJoinGroupChat}>
           <Users className="w-4 h-4 mr-2" />
           Event Discussion
         </Button>
      )}
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold mb-2">About Event</h3>
            <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
              {event.description}
            </p>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-6 border-t">
            <Button variant="ghost" onClick={() => navigate(-1)}>
              &larr; Back
            </Button>

            {isRegistered ? (
              <Button disabled variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
                ✓ You are Registered
              </Button>
            ) : (
              <Button onClick={handleRegister} disabled={registering} size="lg">
                {registering ? 'Registering...' : 'Register Now'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EventDetails;