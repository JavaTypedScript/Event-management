import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getEvents } from '../services/api'; // Re-using the API service we built earlier
import EventCard from '../components/EventCard'; // Re-using the Card component

const Home = () => {
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch 3 upcoming events for the homepage
    const fetchFeatured = async () => {
      try {
        // We can reuse the getEvents API. 
        // Ideally, backend supports limit=3, but for now we slice the array.
        const res = await getEvents(); 
        setFeaturedEvents(res.data.slice(0, 3)); 
      } catch (error) {
        console.error("Failed to load events");
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="bg-white">
      
      {/* --- HERO SECTION --- */}
      <div className="relative bg-gray-900 overflow-hidden">
        {/* Abstract Background Image/Pattern */}
        <div className="absolute inset-0 opacity-20">
            <img 
                src="https://images.unsplash.com/photo-1523580494863-6f3031224c94?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80" 
                alt="Campus Life" 
                className="w-full h-full object-cover"
            />
        </div>
        
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Campus Life, <span className="text-blue-500">Simplified.</span>
          </h1>
          <p className="mt-6 text-xl text-gray-300 max-w-3xl">
            The one-stop platform for students and organizers. Manage clubs, book labs, discover events, and collaborate—all in real-time.
          </p>
          <div className="mt-10 flex gap-4 justify-center">
            <Link
              to="/events"
              className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:text-lg transition-transform transform hover:scale-105"
            >
              Explore Events
            </Link>
            <Link
              to="/login"
              className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-100 bg-gray-800 hover:bg-gray-700 md:text-lg"
            >
              Organizer Login
            </Link>
          </div>
        </div>
      </div>

      {/* --- FEATURES GRID --- */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to run a campus
            </p>
          </div>

          <div className="mt-10">
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
              
              {/* Feature 1 */}
              <div className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow-sm border border-gray-100">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mb-4">
                  📅
                </div>
                <h3 className="text-lg font-medium text-gray-900">Event Management</h3>
                <p className="mt-2 text-base text-gray-500">
                  Create, approve, and showcase events. Track participation and get real-time feedback.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow-sm border border-gray-100">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mb-4">
                  🏢
                </div>
                <h3 className="text-lg font-medium text-gray-900">Resource Booking</h3>
                <p className="mt-2 text-base text-gray-500">
                  Book auditoriums, labs, and equipment instantly. No more double-booking conflicts.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow-sm border border-gray-100">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mb-4">
                  💬
                </div>
                <h3 className="text-lg font-medium text-gray-900">Real-Time Chat</h3>
                <p className="mt-2 text-base text-gray-500">
                  Connect with organizers directly. Ask questions and coordinate with team members.
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* --- UPCOMING EVENTS PREVIEW --- */}
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-8">
            <div>
                <h2 className="text-3xl font-bold text-gray-900">Happening Soon</h2>
                <p className="text-gray-500 mt-1">Don't miss out on these upcoming activities.</p>
            </div>
            <Link to="/events" className="text-blue-600 font-medium hover:text-blue-800 hidden sm:block">
                View all events &rarr;
            </Link>
        </div>

        {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
                {[1,2,3].map(i => <div key={i} className="h-64 bg-gray-200 rounded-xl"></div>)}
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredEvents.length > 0 ? (
                    featuredEvents.map(event => (
                        <EventCard key={event._id} event={event} />
                    ))
                ) : (
                    <div className="col-span-3 text-center py-10 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                        <p className="text-gray-500">No upcoming events scheduled right now.</p>
                    </div>
                )}
            </div>
        )}
        
        <div className="mt-8 text-center sm:hidden">
            <Link to="/events" className="text-blue-600 font-medium hover:text-blue-800">
                View all events &rarr;
            </Link>
        </div>
      </div>

    </div>
  );
};

export default Home;