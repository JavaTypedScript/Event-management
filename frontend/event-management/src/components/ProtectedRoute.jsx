import React, { useContext } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    // Prevent "flash of content" or immediate redirect while checking token
    return <div className="p-10 text-center">Loading authentication...</div>;
  }

  // 1. Check if user is authenticated
  if (!user) {
    // Redirect to login, but save the location they tried to access
    // so we can send them back there after they log in.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Check if user has the required role (if roles are specified)
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // 3. If all checks pass, render the child routes (The protected page)
  return <Outlet />;
};

export default ProtectedRoute;