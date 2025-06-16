import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import SeatBooking from './pages/SeatBooking';
import MyBookings from './pages/MyBookings';
import PrivateRoute from './components/PrivateRoute';

function App() {
  const location = useLocation();
  const hideFooter = location.pathname === '/login' || location.pathname === '/register';

  return (
    <>
      <CssBaseline />
      <AuthProvider>
        {/* This Box is needed to ensure the footer stays at the bottom */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh',
            width: '100%',
            overflowX: 'hidden',
          }}
        >
          <Navbar />
          <Box sx={{ flexGrow: 1, py: 3 }}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/book-seats" element={<PrivateRoute><SeatBooking /></PrivateRoute>} />
              <Route path="/my-bookings" element={<PrivateRoute><MyBookings /></PrivateRoute>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Box>
          {!hideFooter && <Footer />}
        </Box>
      </AuthProvider>
    </>
  );
}

export default App;