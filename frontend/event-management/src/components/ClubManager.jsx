import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, UserPlus } from 'lucide-react';

const ClubManager = () => {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    // Fetch requests for MY club
    api.get('/clubs/my-requests').then(res => setRequests(res.data));
  }, []);

  const handleApprove = async (id) => {
    await api.put('/clubs/approve', { membershipId: id });
    setRequests(requests.filter(r => r._id !== id));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="w-5 h-5" />
          Pending Member Requests
        </CardTitle>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? <p className="text-muted-foreground">No pending requests.</p> : (
          <ul className="space-y-3">
            {requests.map(req => (
              <li key={req._id} className="flex justify-between items-center p-3 bg-slate-50 rounded border">
                <div>
                  <p className="font-medium">{req.user.name}</p>
                  <p className="text-xs text-muted-foreground">{req.user.department} - Year {req.user.year}</p>
                </div>
                <Button size="sm" onClick={() => handleApprove(req._id)}>
                  <Check className="w-4 h-4 mr-1" /> Approve
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default ClubManager;