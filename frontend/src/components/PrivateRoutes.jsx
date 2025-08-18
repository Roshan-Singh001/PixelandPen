import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from './Navbar';
import Footer from './Footer';
import PixelPenLoader from './PixelPenLoader';
import AccessDenied from './AccessDenied';

const PrivateRoute = ({ allowedRoles }) => {
  const { loggedIn, userData, loading } = useAuth();

  if (loading) {
    return(
      <>
        <PixelPenLoader/>
      </>
    )
  }

  if (!loggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && (!userData || !allowedRoles.includes(userData.userRole))) {
    return (
      <>
        <Navbar />
          <AccessDenied/>
        <Footer />
      </>
    );
  }

  return <Outlet />;
};

export default PrivateRoute;
