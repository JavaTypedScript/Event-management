import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Check, X, ShieldAlert } from 'lucide-react';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [clubsList, setClubsList] = useState([]); // <--- STATE FOR CLUBS
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [assignClubName, setAssignClubName] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, clubsRes] = await Promise.all([
        api.get('/auth/users'),
        api.get('/clubs') // <--- FETCH REAL DB CLUBS
      ]);
      setUsers(usersRes.data);
      setClubsList(clubsRes.data);
    } catch (error) {
      console.error("Failed to load data", error);
    }
  };

  // 1. Approve Request Directly (The Green Button)
  const approveOrganizer = async (userId, requestedClub) => {
    try {
      await api.put(`/auth/users/${userId}/role`, { 
        role: 'organizer', 
        managedClub: requestedClub 
      });
      // Update UI
      setUsers(users.map(u => u._id === userId ? { ...u, role: 'organizer', managedClub: requestedClub } : u));
    } catch (err) {
      alert("Failed to approve");
    }
  };

  // 2. Manual Role Change (The Dropdown)
  const onRoleChangeRequest = (user, newRole) => {
    if (newRole === 'organizer') {
      setSelectedUser(user);
      // Pre-fill with their requested club OR existing club
      setAssignClubName(user.requestedClub || user.managedClub || ""); 
      setIsDialogOpen(true);
    } else {
      updateRoleApi(user._id, newRole, null);
    }
  };

  const updateRoleApi = async (userId, role, club) => {
    try {
      await api.put(`/auth/users/${userId}/role`, { role, managedClub: club });
      setUsers(users.map(u => u._id === userId ? { ...u, role, managedClub: club } : u));
      setIsDialogOpen(false);
    } catch (e) { alert("Failed"); }
  };

  return (
    <div className="max-w-6xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>User & Club Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role / Club</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>
                    <div className="font-medium">{user.name}</div>
                    {/* Show Pending Request Badge */}
                    {user.requestedClub && user.role === 'participant' && (
                       <Badge variant="outline" className="mt-1 bg-yellow-50 text-yellow-700 border-yellow-200 flex w-fit items-center">
                         <ShieldAlert className="w-3 h-3 mr-1" />
                         Wants: {user.requestedClub}
                       </Badge>
                    )}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 items-start">
                      <Badge variant={user.role === 'admin' ? 'default' : user.role === 'organizer' ? 'secondary' : 'outline'}>
                        {user.role}
                      </Badge>
                      {user.role === 'organizer' && user.managedClub && (
                        <span className="text-xs font-semibold text-blue-600">
                          📍 {user.managedClub}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {/* BUTTONS for Pending Requests */}
                    {user.requestedClub && user.role === 'participant' ? (
                       <div className="flex gap-2">
                         <Button 
                           size="sm" 
                           className="bg-green-600 hover:bg-green-700 h-8"
                           onClick={() => approveOrganizer(user._id, user.requestedClub)}
                         >
                           <Check className="w-4 h-4 mr-1" /> Approve
                         </Button>
                         <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                           <X className="w-4 h-4" />
                         </Button>
                       </div>
                    ) : (
                       /* Standard Dropdown for everyone else */
                       <Select 
                         value={user.role} 
                         onValueChange={(val) => onRoleChangeRequest(user, val)}
                         disabled={user.email === 'admin@campus.com'}
                       >
                         <SelectTrigger className="w-32.5 h-8">
                           <SelectValue />
                         </SelectTrigger>
                         <SelectContent>
                           <SelectItem value="participant">Participant</SelectItem>
                           <SelectItem value="organizer">Organizer</SelectItem>
                           <SelectItem value="admin">Admin</SelectItem>
                         </SelectContent>
                       </Select>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* --- DIALOG: ASSIGN CLUB --- */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Club Leadership</DialogTitle>
            <DialogDescription>
              Select the club that <b>{selectedUser?.name}</b> will manage.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Club / Committee</Label>
              
              {/* DYNAMIC SELECT FROM DATABASE */}
              <Select value={assignClubName} onValueChange={setAssignClubName}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a club..." />
                </SelectTrigger>
                <SelectContent>
                  {clubsList.map(club => (
                    <SelectItem key={club._id} value={club.name}>
                      {club.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => updateRoleApi(selectedUser._id, 'organizer', assignClubName)}>
              Confirm Assignment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageUsers;