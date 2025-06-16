import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  Card,
  CardContent,
  CardActions,
  Avatar,
  IconButton,
  LinearProgress,
  Skeleton,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import TrainIcon from '@mui/icons-material/Train';
import DirectionsRailwayIcon from '@mui/icons-material/DirectionsRailway';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import AirlineSeatReclineNormalIcon from '@mui/icons-material/AirlineSeatReclineNormal';
import HistoryIcon from '@mui/icons-material/History';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ChairIcon from '@mui/icons-material/Chair';
import WindowIcon from '@mui/icons-material/Window';
import DateRangeIcon from '@mui/icons-material/DateRange';
import RefreshIcon from '@mui/icons-material/Refresh';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import axios from 'axios';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    availableSeats: 0,
    windowSeats: 0,
    totalBookings: 0
  });
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      // Fetch seat stats
      const seatsResponse = await axios.get('http://localhost:4000/api/seats/stats');
      
      // Fetch user bookings count
      const bookingsResponse = await axios.get('http://localhost:4000/api/bookings/myBooking');
      
      setStats({
        availableSeats: seatsResponse.data.available || 0,
        windowSeats: seatsResponse.data.window?.available || 0,
        totalBookings: bookingsResponse.data.length || 0
      });
      
      setLastRefreshed(new Date());
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
      day: 'numeric',
      month: 'short'
    }).format(date);
  };

  return (
    <Container
  maxWidth={false} // Ganti dari "lg" ke false untuk full-width
  sx={{
    mb: 10,
    width: '100vw',       // full screen width
    overflowX: 'hidden',  // prevent horizontal scroll
  }}
>
      {/* Header Section */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 10, 
          mb: 4, 
          borderRadius: 2,
          backgroundImage: 'linear-gradient(to right, #1976d2, #64b5f6)',
          color: 'white'
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <DirectionsRailwayIcon sx={{ fontSize: 40, mr: 2 }} />
              <Typography variant="h3" fontWeight="bold">
                Haloo!
              </Typography>
            </Box>
            <Typography variant="subtitle1">
              Ayo mulai perjalananmu dengan KAI Access. Nikmati kemudahan dalam memesan kursi kereta api, cek ketersediaan kursi, dan kelola pemesananmu dengan mudah.
            </Typography>
          </Grid>
          <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
            <Avatar 
              sx={{ 
                width: 80, 
                height: 80, 
                bgcolor: 'white',
                color: '#1976d2',
                display: 'inline-flex',
                fontSize: 40
              }}
            >
              {user?.name?.charAt(0) || <AccountCircleIcon fontSize="inherit" />}
            </Avatar>
          </Grid>
        </Grid>
      </Paper>

      {/* Stats Cards Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" fontWeight="medium">
            Overview
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
              Terakhir diupdate: {formatDate(lastRefreshed)}
            </Typography>
            <IconButton size="small" onClick={fetchStats} disabled={loading}>
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
              {loading ? (
                <Skeleton variant="rectangular" height={100} />
              ) : (
                <>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography color="text.secondary" gutterBottom>
                        Kursi Tersedia
                      </Typography>
                      <Typography variant="h3" fontWeight="bold">
                        {stats.availableSeats}
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: 'primary.light' }}>
                      <ChairIcon />
                    </Avatar>
                  </Box>
                  <Box sx={{ mt: 2, mb: 1 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={stats.availableSeats > 40 ? 100 : (stats.availableSeats / 40) * 100} 
                      sx={{ height: 8, borderRadius: 4 }} 
                    />
                  </Box>
                </>
              )}
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
              {loading ? (
                <Skeleton variant="rectangular" height={100} />
              ) : (
                <>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography color="text.secondary" gutterBottom>
                        Kursi dengan Jendela
                      </Typography>
                      <Typography variant="h3" fontWeight="bold">
                        {stats.windowSeats}
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: 'info.light' }}>
                      <WindowIcon />
                    </Avatar>
                  </Box>
                  <Box sx={{ mt: 2, mb: 1 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={stats.windowSeats > 13 ? 100 : (stats.windowSeats / 13) * 100} 
                      color="info"
                      sx={{ height: 8, borderRadius: 4 }} 
                    />
                  </Box>
                </>
              )}
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
              {loading ? (
                <Skeleton variant="rectangular" height={100} />
              ) : (
                <>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography color="text.secondary" gutterBottom>
                        Pesanan Saya
                      </Typography>
                      <Typography variant="h3" fontWeight="bold">
                        {stats.totalBookings}
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: 'success.light' }}>
                      <HistoryIcon />
                    </Avatar>
                  </Box>
                  <Box sx={{ mt: 3, textAlign: 'right' }}>
                    <Button 
                      variant="text" 
                      color="primary" 
                      endIcon={<ArrowForwardIcon />} 
                      onClick={() => navigate('/my-bookings')}
                    >
                      View Details
                    </Button>
                  </Box>
                </>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Quick Actions Section */}
      <Typography variant="h5" fontWeight="medium" sx={{ mb: 2 }}>
        Quick Actions
      </Typography>

      <Grid container spacing={3} style={{ marginBottom: '20px' }}>
        <Grid item xs={12} md={4}>
          <Card 
            sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              borderRadius: 2,
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: 6
              }
            }}
          >
            <Box sx={{ 
              height: 140, 
              bgcolor: 'primary.light', 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center' 
            }}>
              <TrainIcon sx={{ fontSize: 80, color: 'white' }} />
            </Box>
            <CardContent sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrainIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" component="h2">
                  Pesan Kursi Kereta
                </Typography>
              </Box>
              <Typography color="text.secondary">
                Pesan kursi kereta api dengan mudah. Pilih dari berbagai kelas dan jadwal yang tersedia.
              </Typography>
            </CardContent>
            <CardActions sx={{ p: 2 }}>
              <Button
                size="large"
                variant="contained"
                fullWidth
                onClick={() => navigate('/book-seats')}
                endIcon={<ArrowForwardIcon />}
              >
                Book Now
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card 
            sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              borderRadius: 2,
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: 6
              }
            }}
          >
            <Box sx={{ 
              height: 140, 
              bgcolor: 'info.light', 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center' 
            }}>
              <EventSeatIcon sx={{ fontSize: 80, color: 'white' }} />
            </Box>
            <CardContent sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <EventSeatIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" component="h2">
                  Lihat Kursi Tersedia
                </Typography>
              </Box>
              <Typography color="text.secondary">
                Check ketersediaan kursi kereta api untuk perjalanan Anda. Pilih kursi yang sesuai dengan preferensi Anda.
              </Typography>
            </CardContent>
            <CardActions sx={{ p: 2 }}>
              <Button
                size="large"
                variant="contained"
                fullWidth
                onClick={() => navigate('/book-seats')}
                endIcon={<ArrowForwardIcon />}
              >
                View Seats
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card 
            sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              borderRadius: 2,
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: 6
              }
            }}
          >
            <Box sx={{ 
              height: 140, 
              bgcolor: 'success.light', 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center' 
            }}>
              <HistoryIcon sx={{ fontSize: 80, color: 'white' }} />
            </Box>
            <CardContent sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <HistoryIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" component="h2">
                  Pesanan Saya
                </Typography>
              </Box>
              <Typography color="text.secondary">
                Lihat dan kelola semua pemesanan kursi kereta api Anda. Cek status, ubah, atau batalkan pemesanan dengan mudah.
              </Typography>
            </CardContent>
            <CardActions sx={{ p: 2 }}>
              <Button
                size="large"
                variant="contained"
                fullWidth
                onClick={() => navigate('/my-bookings')}
                endIcon={<ArrowForwardIcon />}
              >
                View Bookings
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;