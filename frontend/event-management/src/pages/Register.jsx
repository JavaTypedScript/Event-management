import React, { useState, useContext,useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import api from '../services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Register = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', department: 'CSE', year: '1' });
  const [loading, setLoading] = useState(false);
  const [clubs, setClubs] = useState([]);
  const [wantsToOrganize, setWantsToOrganize] = useState(false);

  useEffect(() => {
    api.get('/auth/clubs').then(res => setClubs(res.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/register', formData);
      await login(formData.email, formData.password);
      navigate('/');
    } catch (err) {
      alert('Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Create an account</CardTitle>
          <CardDescription>Get started with CampusSync today.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Department</Label>
                <Select onValueChange={(val) => setFormData({...formData, department: val})} defaultValue={formData.department}>
                  <SelectTrigger><SelectValue placeholder="Select Dept" /></SelectTrigger>
                  <SelectContent>
                    {['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL'].map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Year</Label>
                <Select onValueChange={(val) => setFormData({...formData, year: val})} defaultValue={formData.year}>
                  <SelectTrigger><SelectValue placeholder="Year" /></SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4].map(y => <SelectItem key={y} value={y.toString()}>{y} Year</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* NEW SECTION: Organization Intent */}
  <div className="pt-4 border-t">
    <div className="flex items-center space-x-2 mb-4">
      <input 
        type="checkbox" 
        id="organizer-check" 
        className="h-4 w-4"
        checked={wantsToOrganize}
        onChange={(e) => setWantsToOrganize(e.target.checked)}
      />
      <Label htmlFor="organizer-check">I am a Club/Committee Representative</Label>
    </div>

    {wantsToOrganize && (
      <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
        <Label>Select Your Club</Label>
        <Select onValueChange={(val) => setFormData({...formData, requestedClub: val})}>
          <SelectTrigger>
            <SelectValue placeholder="Select Club" />
          </SelectTrigger>
          <SelectContent>
            {clubs.map(c => <SelectItem key={c._id} value={c.name}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          *Admin approval required. You will start as a Participant.
        </p>
      </div>
    )}
  </div>

            <div className="space-y-2">
              <Label>Password</Label>
              <Input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required />
            </div>

            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? "Creating Account..." : "Register"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;