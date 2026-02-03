// src/components/PrivateRoute.tsx
import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { verifyToken } from './verifyLogin'; // Your verifyToken helper
import LoginRequired from './LoginRequired';
import axios from '../api';

const PrivateRoute: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      try {
        const isValid = await verifyToken(token);
        setIsAuthenticated(isValid);
      } catch (error) {
        console.error('Token verification failed:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600"></div>
      </div>
    );
  }

  // ✅ If not logged in, redirect to login page
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
    // return <LoginRequired />;
  }

  // ✅ If logged in, show the protected route content
  return <Outlet />;
};

export default PrivateRoute;