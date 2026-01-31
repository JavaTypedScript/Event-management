import React, { useEffect, useState } from 'react';
import { fetchPendingEvents, approveEvent, rejectEvent } from '../services/api';

const PendingApprovals = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null); // To show spinner on specific button

  useEffect(() => {
    loadPending();
  }, []);

  const loadPending = async () => {
    try {
      const res = await fetchPendingEvents();
      setEvents(res.data);
    } catch (err) {
      console.error("Failed to load pending events");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    setProcessingId(id);
    try {
      if (action === 'approve') {
        await approveEvent(id);
      } else {
        await rejectEvent(id);
      }
      // Remove the item from the UI immediately (Optimistic update)
      setEvents(events.filter(e => e._id !== id));
    } catch (err) {
      alert(`Failed to ${action} event`);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <div className="p-4 text-gray-500">Loading requests...</div>;

  if (events.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow border border-green-100 text-center">
        <div className="text-green-500 text-4xl mb-2">✓</div>
        <h3 className="text-lg font-medium text-gray-900">All caught up!</h3>
        <p className="text-gray-500">No pending event requests.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-800">Pending Approvals</h3>
        <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
          {events.length} Waiting
        </span>
      </div>
      
      <ul className="divide-y divide-gray-200">
        {events.map((event) => (
          <li key={event._id} className="p-6 hover:bg-gray-50 transition-colors">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              
              {/* Event Details */}
              <div className="grow">
                <h4 className="text-lg font-bold text-blue-600">{event.title}</h4>
                <div className="mt-1 text-sm text-gray-600 space-y-1">
                  <p>
                    <span className="font-semibold">Organizer:</span> {event.organizer?.name} ({event.organizer?.department})
                  </p>
                  <p>
                    <span className="font-semibold">Date:</span> {new Date(event.startDate).toLocaleString()}
                  </p>
                  <p>
                    <span className="font-semibold">Venue:</span> {event.venue?.name || "No Venue Selected"}
                  </p>
                  <p className="text-gray-500 italic mt-2">"{event.description}"</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-start space-x-3">
                <button
                  onClick={() => handleAction(event._id, 'reject')}
                  disabled={processingId === event._id}
                  className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition-colors disabled:opacity-50"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleAction(event._id, 'approve')}
                  disabled={processingId === event._id}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-sm transition-colors disabled:opacity-50 flex items-center"
                >
                  {processingId === event._id ? 'Processing...' : 'Approve'}
                </button>
              </div>

            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PendingApprovals;