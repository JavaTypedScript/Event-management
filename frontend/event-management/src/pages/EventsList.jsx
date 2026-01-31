import React, { useEffect, useState } from 'react';
import { getEvents } from '../services/api';
import EventCard from '../components/EventCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

const EventsList = () => {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getEvents({ search }).then(res => setEvents(res.data));
  }, [search]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Upcoming Events</h1>
        <div className="flex w-full md:w-auto gap-2">
          <div className="relative w-full md:w-75">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search events..." 
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map(event => <EventCard key={event._id} event={event} />)}
      </div>
    </div>
  );
};

export default EventsList;