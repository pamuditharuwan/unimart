import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-xs text-slate-500">
        Checking student verification status...
      </div>
    );
  }

  // 1. Not signed in -> redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  // 2. Signed in but unverified email -> redirect to verify-email
  const isUnconfirmed = user.email_confirmed === false || 
    (user.email_confirmed_at === null && user.email_confirmed !== true && user.id && !user.id.startsWith('mock_'));

  if (isUnconfirmed) {
    return <Navigate to={`/verify-email?email=${encodeURIComponent(user.email || '')}`} replace />;
  }

  // 3. Verified -> allow access
  return children;
}
