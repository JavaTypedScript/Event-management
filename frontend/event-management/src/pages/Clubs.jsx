import React, { useEffect, useState, useContext } from 'react';
import api from '../services/api';
import AuthContext from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Import Tabs
import { Users, CheckCircle, Clock, Settings } from 'lucide-react';
import ClubMemberRequests from '../components/ClubMemberRequests'; // <--- Import the Approval Component

const Clubs = () => {
  const { user } = useContext(AuthContext);
  const [clubs, setClubs] = useState([]);
  const [myMemberships, setMyMemberships] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Logic (Same as before)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const clubsRes = await api.get('/clubs');
        setClubs(clubsRes.data);
        if (user) {
          const statusRes = await api.get('/clubs/my-status');
          setMyMemberships(statusRes.data);
        }
      } catch (err) { console.error("Failed to fetch data"); } 
      finally { setLoading(false); }
    };
    fetchData();
  }, [user]);

  const handleJoin = async (clubName) => {
    if (!user) return alert("Please login to join a club");
    try {
      await api.post('/clubs/join', { clubName });
      setMyMemberships([...myMemberships, { clubName, status: 'pending' }]);
    } catch (err) { alert(err.response?.data?.message || "Failed to join"); }
  };

  const getMembershipStatus = (clubName) => {
    const membership = myMemberships.find(m => m.clubName === clubName);
    return membership ? membership.status : null;
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Student Clubs</h1>
        <p className="text-muted-foreground">
          Join communities or manage your own.
        </p>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Clubs</TabsTrigger>

          {/* SHOW "MANAGE" TAB ONLY FOR ORGANIZERS */}
          {user?.role === "organizer" && (
            <TabsTrigger value="manage" className="text-blue-600 font-semibold">
              Manage {user.managedClub || "My Club"}
            </TabsTrigger>
          )}
        </TabsList>

        {/* TAB 1: PUBLIC CLUB LIST */}
        <TabsContent value="all">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clubs.map((club) => {
              const status = getMembershipStatus(club.name);
              // Don't show "Join" button if I am the organizer of this club
              const isMyClub = user?.managedClub === club.name;

              return (
                <Card key={club._id} className="flex flex-col">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle>{club.name}</CardTitle>
                      <Badge variant="secondary">{club.type}</Badge>
                    </div>
                    <CardDescription>
                      {club.description || "Campus Community"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grow">
                    <div className="bg-slate-100 h-32 rounded-md flex items-center justify-center text-slate-400">
                      <Users className="h-10 w-10" />
                    </div>
                  </CardContent>
                  <CardFooter>
                    {isMyClub ? (
                      <Button
                        variant="outline"
                        className="w-full border-blue-200 text-blue-700 bg-blue-50"
                      >
                        <Settings className="w-4 h-4 mr-2" /> You Manage This
                      </Button>
                    ) : status === "approved" ? (
                      <Button
                        variant="outline"
                        className="w-full text-green-600 bg-green-50"
                        disabled
                      >
                        <CheckCircle className="w-4 h-4 mr-2" /> Member
                      </Button>
                    ) : status === "pending" ? (
                      <Button variant="secondary" className="w-full" disabled>
                        <Clock className="w-4 h-4 mr-2" /> Request Sent
                      </Button>
                    ) : (
                      <Button
                        className="w-full"
                        onClick={() => handleJoin(club.name)}
                        disabled={!user}
                      >
                        Request to Join
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* TAB 2: ORGANIZER MANAGEMENT */}
        {user?.role === "organizer" && (
          <TabsContent value="manage">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Member Approvals Component */}
              <div className="md:col-span-2">
                <ClubMemberRequests clubName={user.managedClub} />
              </div>

              {/* Quick Info Card */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Club Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Role:</span>
                      <span className="font-medium">Club Lead</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Club:</span>
                      <span className="font-medium">{user.managedClub}</span>
                    </div>
                    <Button className="w-full mt-4" variant="outline">
                      Update Club Details
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default Clubs;