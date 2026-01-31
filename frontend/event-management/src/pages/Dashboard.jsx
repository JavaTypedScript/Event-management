import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bar, Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';

import AuthContext from '../context/AuthContext';
import api, { fetchResourceStats, fetchMonthlyActivity } from '../services/api';
import PendingApprovals from '../components/PendingApprovals';


// Icons
import { 
  Users, 
  AlertCircle, 
  ArrowRight, 
  Calendar, 
  Trash2, 
  ShieldAlert,
  LayoutDashboard,
  Download,
  Activity,
  DollarSign,
  PlusCircle
} from 'lucide-react';

// Shadcn UI Components
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";


// Register ChartJS
ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [resourceData, setResourceData] = useState(null);
  const [monthlyData, setMonthlyData] = useState(null);
  const [pendingUserCount, setPendingUserCount] = useState(0);
  const [allEvents, setAllEvents] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch advanced stats
  useEffect(() => {
    if (user?.role === 'admin') {
      const fetchStats = async () => {
        try {
          const res = await api.get('/analytics/advanced');
          setStats(res.data);
        } catch (err) {
          console.error('Failed to fetch advanced stats', err);
        }
      };
      fetchStats();
    }
  }, [user]);

  // Fetch basic analytics data
  useEffect(() => {
    if (user?.role !== 'admin') {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const rStats = await fetchResourceStats();
        const mStats = await fetchMonthlyActivity();

        const rData = rStats.data || [];
        const mData = mStats.data || [];

        setResourceData({
          labels: rData.map(r => r.resourceName),
          datasets: [{
            label: 'Bookings',
            data: rData.map(r => r.totalBookings),
            backgroundColor: 'rgba(59, 130, 246, 0.5)',
            borderColor: 'rgb(59, 130, 246)',
            borderWidth: 1,
          }],
        });

        setMonthlyData({
          labels: mData.map(m => m.month),
          datasets: [{
            label: 'Events per Month',
            data: mData.map(m => m.eventCount ?? m.count ?? 0),
            borderColor: 'rgb(16, 185, 129)',
            backgroundColor: 'rgba(16, 185, 129, 0.5)',
            tension: 0.3,
          }],
        });

        const userReq = await api.get('/auth/pending-requests');
        setPendingUserCount(userReq.data.count);

        const eventsRes = await api.get('/events');
        setAllEvents(eventsRes.data);
      } catch (err) {
        console.error('Dashboard Load Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Download report function
  const downloadReport = async () => {
    try {
      const response = await api.get('/analytics/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'campus_report.csv');
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error('Export failed', error);
    }
  };

  // 3. Admin Delete Event Handler
  const handleDeleteEvent = async (eventId) => {
    try {
      await api.delete(`/events/${eventId}`);
      setAllEvents(allEvents.filter(e => e._id !== eventId)); // Optimistic update
    } catch (err) {
      alert("Failed to delete event");
    }
  };

 if (!user || user.role === 'participant') {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
        <ShieldAlert className="h-16 w-16 text-red-500" />
        <h2 className="text-2xl font-bold">Access Denied</h2>
        <p className="text-muted-foreground">This area is restricted to Organizers and Admins.</p>
        <Button asChild><Link to="/">Return Home</Link></Button>
      </div>
    );
  }

  if (user.role === 'organizer') {
    return (
      <div className="max-w-6xl mx-auto py-8 space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Organizer Dashboard</h1>
            <p className="text-muted-foreground">
              Manage events for <span className="font-semibold text-primary">{user.managedClub}</span>
            </p>
          </div>
          <Button asChild>
            <Link to="/create-event">
              <PlusCircle className="mr-2 h-4 w-4" /> Create Event
            </Link>
          </Button>
        </div>

        {/* Placeholders for future features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 border rounded-lg bg-slate-50 text-center text-muted-foreground">
             Start creating events to see analytics here.
          </div>
        </div>
      </div>
    );
  }

  if (user?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
        <ShieldAlert className="h-16 w-16 text-red-500" />
        <h2 className="text-2xl font-bold">Access Denied</h2>
        <p className="text-muted-foreground">This area is restricted to administrators.</p>
        <Button asChild><Link to="/">Return Home</Link></Button>
      </div>
    );
  }

  if (loading) {
    return <div className="p-10 text-center text-muted-foreground">Loading Dashboard...</div>;
  }

  // Chart configuration
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1, precision: 0 }
      }
    },
    plugins: {
      legend: { position: 'top' },
    },
  };

  // Data preparation for charts (only render if stats exists)
  const clubBudgetChart = stats ? {
    labels: stats.clubStats.map(c => c._id),
    datasets: [{
      label: 'Budget Usage (₹)',
      data: stats.clubStats.map(c => c.totalBudget),
      backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
    }]
  } : null;

  const participationChart = stats ? {
    labels: stats.participationTrends.map(t => new Date(t.monthName).toLocaleDateString('en-US', { month: 'short' })),
    datasets: [{
      label: 'Student Participation',
      data: stats.participationTrends.map(t => t.totalParticipants),
      borderColor: '#3b82f6',
      tension: 0.4,
      fill: true,
      backgroundColor: 'rgba(59, 130, 246, 0.1)'
    }]
  } : null;

   if (user?.role === 'organizer') {
    return (
      <div className="space-y-6 max-w-6xl mx-auto py-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Club Management</h1>
          <p className="text-muted-foreground">
            Manage events and members for <span className="font-semibold text-primary">{user.managedClub}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* LEFT COLUMN: Membership Requests */}
          <div className="md:col-span-1">
            <ClubMemberRequests clubName={user.managedClub} />
          </div>

          {/* RIGHT COLUMN: Quick Actions & Stats (Placeholder for now) */}
          <div className="md:col-span-2 space-y-6">
             <Card>
               <CardHeader><CardTitle>My Events</CardTitle></CardHeader>
               <CardContent>
                 <Button asChild><Link to="/create-event">Create New Event</Link></Button>
                 {/* You can list the club's specific events here later */}
               </CardContent>
             </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">System overview and management console.</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" asChild>
            <Link to="/manage-users">
              <Users className="mr-2 h-4 w-4" />
              Manage Users
            </Link>
          </Button>
        </div>
      </div>

      {/* --- NOTIFICATION: PENDING CLUB REQUESTS --- */}
      {pendingUserCount > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-100 p-2 rounded-full text-yellow-700">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-yellow-900">Club Authorization Required</h3>
              <p className="text-sm text-yellow-800">
                <span className="font-bold">{pendingUserCount} users</span> are waiting for approval to lead a club.
              </p>
            </div>
          </div>
          <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700 text-white border-none" asChild>
            <Link to="/manage-users">
              Review Requests <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Analytics & Reports</h1>
        <Button onClick={downloadReport} className="bg-green-600 hover:bg-green-700">
          <Download className="mr-2 h-4 w-4" /> Export to CSV
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Budget Deployed</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{stats ? stats.clubStats.reduce((acc, curr) => acc + curr.totalBudget, 0).toLocaleString() : '0'}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Engagement</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats ? stats.clubStats.reduce((acc, curr) => acc + curr.totalParticipants, 0) : 0} Students
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Clubs</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats ? stats.clubStats.length : 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Participation Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Participation Trends</CardTitle>
          </CardHeader>
          <CardContent className="h-75">
            {participationChart ? <Line data={participationChart} options={{ maintainAspectRatio: false }} /> : <div className="text-muted-foreground">No data available</div>}
          </CardContent>
        </Card>

        {/* Club Budget Usage */}
        <Card>
          <CardHeader>
            <CardTitle>Budget Usage by Club</CardTitle>
          </CardHeader>
          <CardContent className="h-75">
            {clubBudgetChart ? <Bar data={clubBudgetChart} options={{ maintainAspectRatio: false }} /> : <div className="text-muted-foreground">No data available</div>}
          </CardContent>
        </Card>

      </div>

      {/* --- MAIN TABS --- */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:w-100">
          <TabsTrigger value="overview">Overview & Stats</TabsTrigger>
          <TabsTrigger value="events">All Events Manager</TabsTrigger>
        </TabsList>

        {/* TAB 1: OVERVIEW & APPROVALS */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          
          {/* Section A: Pending Event Approvals */}
          <PendingApprovals />

          {/* Section B: Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Resource Utilization</CardTitle>
                <CardDescription>Most booked venues across campus</CardDescription>
              </CardHeader>
              <CardContent className="h-75">
                {resourceData ? <Bar data={resourceData} options={chartOptions} /> : <p className="text-sm text-muted-foreground">Loading...</p>}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Event Frequency</CardTitle>
                <CardDescription>Monthly trend of approved events</CardDescription>
              </CardHeader>
              <CardContent className="h-75">
                 {monthlyData ? <Line data={monthlyData} options={chartOptions} /> : <p className="text-sm text-muted-foreground">Loading...</p>}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB 2: ALL EVENTS MANAGER (The "Missing Util") */}
        <TabsContent value="events" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>System-Wide Event Management</CardTitle>
              <CardDescription>View and manage all events (Pending, Approved, Completed).</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event Name</TableHead>
                    <TableHead>Organizer / Club</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allEvents.map((event) => (
                    <TableRow key={event._id}>
                      <TableCell className="font-medium">{event.title}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                           <span>{event.hostingClub || "Independent"}</span>
                           <span className="text-xs text-muted-foreground">{event.organizer?.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(event.startDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          event.status === 'approved' ? 'default' : 
                          event.status === 'pending' ? 'outline' : 'secondary'
                        }>
                          {event.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete the event "{event.title}" and remove it from all schedules. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteEvent(event._id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete Event
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                  {allEvents.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                        No events found in the system.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;