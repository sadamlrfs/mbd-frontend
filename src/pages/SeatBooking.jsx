import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Grid,
  Button,
  Paper,
  Alert,
  CircularProgress,
  Divider,
  Chip,
  Stack,
  Tooltip,
  Badge,
  ToggleButtonGroup,
  ToggleButton
} from '@mui/material';
import AirlineSeatReclineNormalIcon from '@mui/icons-material/AirlineSeatReclineNormal';
import WidthFullIcon from '@mui/icons-material/WidthFull';
import HeightIcon from '@mui/icons-material/Height';
import WindowIcon from '@mui/icons-material/Window';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import axios from 'axios';

const SeatBooking = () => {
  const navigate = useNavigate();
  const [seats, setSeats] = useState([]);
  const [filteredSeats, setFilteredSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [initializingSeats, setInitializingSeats] = useState(false);
  const [initSuccess, setInitSuccess] = useState(false);
  const [seatFilter, setSeatFilter] = useState('all');
  const [seatStats, setSeatStats] = useState({ 
    total: 0, 
    available: 0, 
    booked: 0,
    window: { total: 0, available: 0 },
    positions: { upper: 0, middle: 0, lower: 0 }
  });

  useEffect(() => {
    fetchSeats();
    fetchSeatStats();
  }, []);
  
  useEffect(() => {
    filterSeats(seatFilter);
  }, [seats, seatFilter]);

  const fetchSeats = async () => {
    try {
      console.log("Fetching seats...");
      const response = await axios.get('http://localhost:4000/api/seats');
      console.log("Seats data:", response.data);
      setSeats(response.data);
      setFilteredSeats(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching seats:", err);
      setError('Failed to fetch seats');
      setLoading(false);
    }
  };

  const fetchSeatStats = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/seats/stats');
      setSeatStats(response.data);
    } catch (err) {
      console.error("Error fetching seat stats:", err);
    }
  };

  const filterSeats = (filterType) => {
    if (filterType === 'all') {
      setFilteredSeats(seats);
      return;
    }
    
    let filtered;
    switch (filterType) {
      case 'window':
        filtered = seats.filter(seat => seat.isWindow);
        break;
      case 'upper':
        filtered = seats.filter(seat => seat.position === 'upper');
        break;
      case 'middle':
        filtered = seats.filter(seat => seat.position === 'middle');
        break;
      case 'lower':
        filtered = seats.filter(seat => seat.position === 'lower');
        break;
      case 'available':
        filtered = seats.filter(seat => !seat.isBooked);
        break;
      default:
        filtered = seats;
    }
    
    setFilteredSeats(filtered);
  };

  const handleFilterChange = (event, newFilter) => {
    if (newFilter !== null) {
      setSeatFilter(newFilter);
    }
  };

  const initializeSeats = async () => {
    try {
      setInitializingSeats(true);
      const response = await axios.post('http://localhost:4000/api/seats/init');
      console.log("Initialization response:", response.data);
      setInitSuccess(true);
      // Fetch the newly initialized seats
      fetchSeats();
      fetchSeatStats();
    } catch (err) {
      console.error("Error initializing seats:", err);
      setError(err.response?.data?.msg || 'Failed to initialize seats');
    } finally {
      setInitializingSeats(false);
    }
  };

  const handleSeatClick = (seat) => {
    if (seat.isBooked) return;
    
    setSelectedSeats(prevSelected => {
      // Check if this seat is already selected
      const isAlreadySelected = prevSelected.some(s => s.seatNumber === seat.seatNumber);
      
      if (isAlreadySelected) {
        // Remove from selection
        return prevSelected.filter(s => s.seatNumber !== seat.seatNumber);
      } else {
        // Add to selection
        return [...prevSelected, seat];
      }
    });
  };

  const handleBooking = async () => {
    if (selectedSeats.length === 0) return;

    try {
      const seatNumbers = selectedSeats.map(seat => seat.seatNumber);
      
      const response = await axios.post('http://localhost:4000/api/bookings', {
        seatNumbers: seatNumbers,
      });
      
      console.log("Booking response:", response.data);
      setBookingSuccess(true);
      setSelectedSeats([]);
      fetchSeats(); // Refresh seat data
      fetchSeatStats(); // Refresh stats
      
      // Redirect to my-bookings page after a short delay
      setTimeout(() => {
        navigate('/my-bookings');
      }, 1500);
      
    } catch (err) {
      console.error("Error booking seats:", err);
      setError(err.response?.data?.msg || 'Failed to book seats');
    }
  };

  const isSeatSelected = (seat) => {
    return selectedSeats.some(s => s.seatNumber === seat.seatNumber);
  };

  const getSeatPositionIcon = (position) => {
    switch (position) {
      case 'upper':
        return <HeightIcon fontSize="small" />;
      case 'middle':
        return <WidthFullIcon fontSize="small" />;
      case 'lower':
        return <AirlineSeatReclineNormalIcon fontSize="small" />;
      default:
        return null;
    }
  };

  const getSeatTooltip = (seat) => {
    const positionText = seat.position.charAt(0).toUpperCase() + seat.position.slice(1);
    return `${seat.seatNumber} - ${positionText} ${seat.isWindow ? '(Window)' : ''}`;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Pesan Kursi Anda
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Pilih kursi yang tersedia dari tata letak di bawah ini
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {initSuccess && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Kursi berhasil diinisialisasi!
        </Alert>
      )}

      {bookingSuccess && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Kursi berhasil dipesan! Mengarahkan ke Pemesanan Saya...
        </Alert>
      )}

      {seats.length === 0 ? (
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center', mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Tidak ada kursi tersedia
          </Typography>
          <Typography color="text.secondary" paragraph>
            Sistem kursi perlu diinisialisasi sebelum pemesanan.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={initializeSeats}
            disabled={initializingSeats}
            sx={{ mt: 2 }}
          >
            {initializingSeats ? 'Menginisialisasi...' : 'Inisialisasi Kursi'}
          </Button>
        </Paper>
      ) : (
        <>
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Typography variant="h6">
                Tata Letak Kursi Kereta
              </Typography>
              <Stack spacing={1}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip 
                    label={`Total: ${seatStats.total}`} 
                    color="default" 
                    variant="outlined" 
                  />
                  <Chip 
                    label={`Tersedia: ${seatStats.available}`} 
                    color="success" 
                    variant={seatStats.available > 0 ? "filled" : "outlined"} 
                  />
                  <Chip 
                    label={`Dipesan: ${seatStats.booked}`} 
                    color="error" 
                    variant={seatStats.booked > 0 ? "filled" : "outlined"} 
                  />
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip 
                    icon={<WindowIcon />}
                    label={`Jendela: ${seatStats.window?.available || 0}`} 
                    color="info" 
                    variant="outlined" 
                  />
                  <Chip 
                    icon={<HeightIcon />}
                    label={`Atas: ${seatStats.positions?.upper || 0}`} 
                    color="secondary" 
                    variant="outlined" 
                  />
                  <Chip 
                    icon={<WidthFullIcon />}
                    label={`Tengah: ${seatStats.positions?.middle || 0}`} 
                    color="secondary" 
                    variant="outlined" 
                  />
                </Box>
              </Stack>
            </Box>
            
            <Divider sx={{ mb: 3 }} />
            
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FilterAltIcon sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
                Filter kursi:
              </Typography>
              <ToggleButtonGroup
                value={seatFilter}
                exclusive
                onChange={handleFilterChange}
                aria-label="seat filter"
                size="small"
              >
                <ToggleButton value="all">Semua</ToggleButton>
                <ToggleButton value="available">Tersedia</ToggleButton>
                <ToggleButton value="window">Jendela</ToggleButton>
                <ToggleButton value="upper">Atas</ToggleButton>
                <ToggleButton value="middle">Tengah</ToggleButton>
                <ToggleButton value="lower">Bawah</ToggleButton>
              </ToggleButtonGroup>
            </Box>
            
            <Grid container spacing={1} justifyContent="center">
              {filteredSeats.map((seat) => (
                <Grid item key={seat.seatNumber}>
                  <Tooltip title={getSeatTooltip(seat)}>
                    <span>
                      <Badge
                        badgeContent={seat.isWindow ? <WindowIcon fontSize="small" /> : null}
                        color="info"
                        overlap="circular"
                        anchorOrigin={{
                          vertical: 'top',
                          horizontal: 'right',
                        }}
                      >
                        <Button
                          variant={seat.isBooked ? 'contained' : isSeatSelected(seat) ? 'contained' : 'outlined'}
                          color={seat.isBooked ? 'error' : isSeatSelected(seat) ? 'primary' : 'inherit'}
                          onClick={() => handleSeatClick(seat)}
                          disabled={seat.isBooked}
                          sx={{
                            minWidth: '60px',
                            height: '60px',
                            m: 0.5,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            border: seat.isWindow ? '2px solid #2196f3' : undefined,
                            background: seat.isWindow && !seat.isBooked && !isSeatSelected(seat) ? 'rgba(33, 150, 243, 0.1)' : undefined,
                          }}
                        >
                          <Typography variant="caption">{seat.seatNumber}</Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                            {getSeatPositionIcon(seat.position)}
                            {seat.isWindow && (
                              <WindowIcon 
                                fontSize="small" 
                                color="info" 
                                sx={{ ml: 0.3, opacity: 0.8 }}
                              />
                            )}
                          </Box>
                        </Button>
                      </Badge>
                    </span>
                  </Tooltip>
                </Grid>
              ))}
            </Grid>
          </Paper>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3 }}>
            <Typography variant="subtitle1">
              {selectedSeats.length > 0 ? 
                `Dipilih: ${selectedSeats.length} kursi - ${selectedSeats.map(s => s.seatNumber).join(', ')}` : 
                'Belum ada kursi yang dipilih'}
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={handleBooking}
              disabled={selectedSeats.length === 0}
            >
              {selectedSeats.length > 1 ? `Pesan ${selectedSeats.length} Kursi` : 'Pesan Kursi Terpilih'}
            </Button>
          </Box>
          
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button variant="outlined" color="inherit" disabled sx={{ minWidth: '40px' }} />
              <Typography>Tersedia</Typography>
            </Paper>
            <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button variant="contained" color="error" disabled sx={{ minWidth: '40px' }} />
              <Typography>Dipesan</Typography>
            </Paper>
            <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button variant="contained" color="primary" disabled sx={{ minWidth: '40px' }} />
              <Typography>Terpilih</Typography>
            </Paper>
            <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <WindowIcon color="info" />
              <Typography>Jendela</Typography>
            </Paper>
            <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <HeightIcon />
              <Typography>Atas</Typography>
            </Paper>
            <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <WidthFullIcon />
              <Typography>Tengah</Typography>
            </Paper>
            <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <AirlineSeatReclineNormalIcon />
              <Typography>Bawah</Typography>
            </Paper>
          </Box>
        </>
      )}
    </Container>
  );
};

export default SeatBooking;