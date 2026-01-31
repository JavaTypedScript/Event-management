import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarIcon, MapPin, User } from 'lucide-react'; // Install lucide-react if needed
import { 
  Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';

const EventCard = ({ event }) => {
  const navigate = useNavigate();

  const formattedDate = new Date(event.startDate).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  return (
    <Card className="flex flex-col h-full hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <div className="flex justify-between items-start">
          <Badge variant="secondary" className="mb-2">
            {event.visibility === 'public' ? 'Public' : 'Internal'}
          </Badge>
          {/* Status Badge Logic */}
          {event.status === 'pending' && <Badge variant="outline" className="text-yellow-600 border-yellow-200 bg-yellow-50">Pending</Badge>}
        </div>
        
        <CardTitle className="text-xl line-clamp-1">{event.title}</CardTitle>
        <CardDescription className="flex items-center mt-1 font-medium text-blue-600">
  <Users className="w-3 h-3 mr-1" />
  {event.hostingClub || event.organizer?.name} {/* Shows "Robotics Club" */}
</CardDescription>
      </CardHeader>

      <CardContent className="grow">
        <p className="text-sm text-gray-500 line-clamp-3 mb-4">
          {event.description}
        </p>
        
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center">
            <CalendarIcon className="w-4 h-4 mr-2 text-blue-500" />
            {formattedDate}
          </div>
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-2 text-red-500" />
            {event.venue?.name || "TBA"}
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-4 border-t bg-gray-50/50">
        <Button 
          className="w-full" 
          onClick={() => navigate(`/events/${event._id}`)}
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
};

export default EventCard;