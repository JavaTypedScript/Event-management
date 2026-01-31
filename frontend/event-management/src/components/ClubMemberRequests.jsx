import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, UserPlus, Users } from 'lucide-react';
import { toast } from 'sonner'; // If you have toast installed, otherwise use alert

const ClubMemberRequests = ({ clubName }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Requests on Mount
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await api.get('/clubs/my-requests');
        setRequests(res.data);
      } catch (err) {
        console.error("Failed to fetch requests");
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  // 2. Handle Approval
  const handleAction = async (id, action) => {
    try {
      if (action === 'approve') {
        await api.put('/clubs/approve', { membershipId: id });
        // toast.success("Member approved!");
      } else {
        await api.put('/clubs/reject', { membershipId: id });
        // toast.info("Request rejected.");
      }
      
      // Optimistic UI Update (Remove from list immediately)
      setRequests(prev => prev.filter(req => req._id !== id));
    } catch (err) {
      alert("Action failed: " + err.message);
    }
  };

  if (loading) return <div className="p-4 text-sm text-muted-foreground">Loading requests...</div>;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-blue-600" />
          Membership Requests
        </CardTitle>
        <CardDescription>
          Students requesting to join <strong>{clubName}</strong>
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {requests.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground flex flex-col items-center">
            <div className="bg-slate-100 p-3 rounded-full mb-3">
              <Users className="w-6 h-6 text-slate-400" />
            </div>
            <p>No pending requests.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => (
              <div 
                key={req._id} 
                className="flex items-center justify-between p-3 border rounded-lg bg-slate-50/50 hover:bg-slate-50 transition-colors"
              >
                {/* Student Details */}
                <div className="flex flex-col">
                  <span className="font-semibold text-sm">{req.user.name}</span>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                    <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">
                      {req.user.department}
                    </Badge>
                    <span>Year {req.user.year}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <Button 
                    size="icon" 
                    variant="outline" 
                    className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                    onClick={() => handleAction(req._id, 'approve')}
                    title="Approve"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => handleAction(req._id, 'reject')}
                    title="Reject"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClubMemberRequests;