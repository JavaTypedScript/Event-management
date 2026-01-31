import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout'; // Navbar, Footer wrapper
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard'; // Admin only
import CreateEvent from './pages/CreateEvent'; // Organizer/Admin
import EventsList from './pages/EventsList'; // Public
import Unauthorized from './pages/Unauthorized';
import Register from './pages/Register';
import EventDetails from './components/EventDetails';
import ManageUsers from './pages/ManageUsers';
import ChatPage from './pages/ChatPage';
import Clubs from './pages/Clubs';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        
        {/* PUBLIC ROUTES */}
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="events" element={<EventsList />} />
        <Route path="register" element={<Register />} />
        <Route path="unauthorized" element={<Unauthorized />} />
        <Route path="events/:id" element={<EventDetails />} />
        <Route path="clubs" element={<Clubs />} />

        {/* PROTECTED: ANY LOGGED IN USER */}
        <Route element={<ProtectedRoute />}>
          <Route path="profile" element={<div>User Profile Page</div>} />
        </Route>

        <Route element={<ProtectedRoute />}>
          {/* Chat is available to everyone who is logged in */}
          <Route path="messages" element={<ChatPage />} /> 
        </Route>

        {/* PROTECTED: ORGANIZERS & ADMINS */}
        <Route element={<ProtectedRoute allowedRoles={['admin', 'organizer']} />}>
          <Route path="create-event" element={<CreateEvent />} />
          <Route path="my-club" element={<div>Club Management Page</div>} />
        </Route>

        {/* PROTECTED: ADMIN ONLY */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="approve-events" element={<div>Approval Queue</div>} />
          <Route path="manage-users" element={<ManageUsers />} />
        </Route>

      </Route>
    </Routes>
  );
}

export default App;