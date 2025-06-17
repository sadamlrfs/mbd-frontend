import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Chip,
  Modal,
  Backdrop,
  Fade,
  Divider,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  InputLabel,
  FormControl
} from '@mui/material';
import axios from 'axios';
import BookingFilter from './BookingFilter';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editKursi, setEditKursi] = useState('');
  const [availableSeats, setAvailableSeats] = useState([]);
  const [filtering, setFiltering] = useState(false);
  const [totalPesanan, setTotalPesanan] = useState(null);
  const [loadingBayarId, setLoadingBayarId] = useState(null);
  const [status, setStatus] = useState(""); // "" | "success" | "error"
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchBookings();
    fetchTotalPesanan();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/bookings/pesananSaya');
      setBookings(response.data);
      setLoading(false);
    } catch (err) {
      setError('Gagal untuk mengambil pemesanan');
      setLoading(false);
    }
  };

  const fetchTotalPesanan = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/bookings/total');
      setTotalPesanan(response.data.total);
    } catch (err) {
      setTotalPesanan(null);
    }
  };

  const handleFilter = async (params) => {
    setFiltering(true);
    setLoading(true);
    setError('');
    try {
      // Buat query string dari params
      const query = Object.entries(params)
        .filter(([_, v]) => v !== '' && v !== undefined)
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
        .join('&');
      const url = query ? `http://localhost:4000/api/bookings/filter?${query}` : 'http://localhost:4000/api/bookings/pesananSaya';
      const response = await axios.get(url);
      setBookings(response.data);
    } catch (err) {
      setError('Gagal memfilter pemesanan');
    } finally {
      setFiltering(false);
      setLoading(false);
    }
  };

  // This function displays the booking date in a user-friendly format
  const getBookingDate = (booking) => {
    try {
      // Prioritaskan waktu_pesan dari backend
      if (booking.waktu_pesan) {
        const date = new Date(booking.waktu_pesan);
        if (!isNaN(date.getTime())) {
          return date.toLocaleString();
        }
      }
      // Fallback ke bookedAt
      if (booking.bookedAt) {
        const date = new Date(booking.bookedAt);
        if (!isNaN(date.getTime())) {
          return date.toLocaleString();
        }
      }
      // Fallback ke createdAt
      if (booking.createdAt) {
        const date = new Date(booking.createdAt);
        if (!isNaN(date.getTime())) {
          return date.toLocaleString();
        }
      }
      // Jika semua gagal, tampilkan string kosong
      return '';
    } catch (error) {
      return '';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  // Edit pesanan
  const openEditDialog = async (booking) => {
    setSelectedBooking(booking);
    setEditKursi('');
    // Fetch available seats
    try {
      const response = await axios.get('http://localhost:4000/api/seats');
      // Hanya kursi yang tidak dipesan dan bukan kursi yang sedang dipesan user
      const seats = response.data.filter(seat => !seat.dipesan || seat.nomor_kursi === booking.Kursi?.nomor_kursi);
      setAvailableSeats(seats);
    } catch (err) {
      setAvailableSeats([]);
    }
    setEditDialogOpen(true);
  };

  const submitEdit = async () => {
    if (!editKursi) return;
    try {
      await axios.put(`http://localhost:4000/api/bookings/${selectedBooking.id_pesanan}`, {
        nomor_kursi_baru: editKursi
      });
      setEditDialogOpen(false);
      setOpenModal(false);
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.msg || 'Gagal mengubah pesanan');
    }
  };

  // Delete pesanan
  const handleDelete = (booking) => {
    setSelectedBooking(booking);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`http://localhost:4000/api/bookings/${selectedBooking.id_pesanan}`);
      setDeleteDialogOpen(false);
      setOpenModal(false);
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.msg || 'Gagal menghapus pesanan');
    }
  };

  const handleBayarSelesai = async (booking) => {
    if (!booking.Pembayaran?.id_pembayaran) return;
    setLoadingBayarId(booking.Pembayaran.id_pembayaran);
    try {
      await axios.put(
        `http://localhost:4000/api/bookings/pembayaran/${booking.Pembayaran.id_pembayaran}`,
        { status: 'berhasil' } // Ubah status ke "berhasil"
      );
      fetchBookings();
    } catch (err) {
      alert('Gagal update status pembayaran');
    } finally {
      setLoadingBayarId(null);
    }
  };

  const handleSubmit = async () => {
    // ...proses submit...
    const isSuccess = true; // ganti dengan hasil submit sebenarnya
    if (isSuccess) {
      setStatus("success");
    } else {
      setStatus("error");
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Pemesanan Saya
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Lihat dan kelola pemesanan kursi kereta Anda
        </Typography>
        {totalPesanan !== null && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Total pesanan Anda: <b>{totalPesanan}</b>
          </Alert>
        )}
        <BookingFilter onFilter={handleFilter} />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {bookings.length === 0 ? (
        <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            Anda belum melakukan pemesanan.
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} elevation={3}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID Pemesanan</TableCell>
                <TableCell>Nomor Kursi</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Status Pembayaran</TableCell>
                <TableCell>Tanggal Pemesanan</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bookings.map((booking, index) => (
                <TableRow
                  key={booking.id_pesanan || booking.id || index}
                  hover
                  style={{ cursor: 'pointer' }}
                  onClick={() => { setSelectedBooking(booking); setOpenModal(true); }}
                >
                  <TableCell>{booking.id_pesanan || booking.id || '-'}</TableCell>
                  <TableCell>{booking.Kursi?.nomor_kursi || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={booking.Kursi?.dipesan ? 'Dipesan' : 'Tersedia'}
                      color={booking.Kursi?.dipesan ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {booking.Pembayaran?.status === 'berhasil' ? (
                      <Chip label="Lunas" color="success" size="small" />
                    ) : booking.Pembayaran?.status ? (
                      <>
                        <Chip label={booking.Pembayaran.status} color="warning" size="small" sx={{mr:1}} />
                        <Button
                          size="small"
                          variant="contained"
                          color="primary"
                          onClick={e => { e.stopPropagation(); handleBayarSelesai(booking); }}
                          disabled={loadingBayarId === booking.Pembayaran?.id_pembayaran}
                        >
                          Tandai Lunas
                        </Button>
                      </>
                    ) : (
                      <>
                        <Chip label="Belum Bayar" color="error" size="small" sx={{mr:1}} />
                        <Button
                          size="small"
                          variant="contained"
                          color="primary"
                          onClick={e => { e.stopPropagation(); handleBayarSelesai(booking); }}
                          disabled={loadingBayarId === booking.Pembayaran?.id_pembayaran}
                        >
                          Tandai Lunas
                        </Button>
                      </>
                    )}
                  </TableCell>
                  <TableCell>{getBookingDate(booking)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Modal
        open={openModal}
        onClose={() => setOpenModal(false)}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{ timeout: 500 }}
      >
        <Fade in={openModal}>
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 350,
            bgcolor: 'background.paper',
            border: '2px solid #1976d2',
            boxShadow: 24,
            borderRadius: 2,
            p: 4,
          }}>
            <Typography variant="h6" gutterBottom>Detail Pemesanan</Typography>
            <Divider sx={{ mb: 2 }} />
            {selectedBooking && (
              <>
                <Typography><b>ID Pesanan:</b> {selectedBooking.id_pesanan}</Typography>
                <Typography><b>Nama Penumpang:</b> {selectedBooking.Penumpang?.nama || '-'}</Typography>
                <Typography><b>Email Penumpang:</b> {selectedBooking.Penumpang?.email || '-'}</Typography>
                <Typography><b>Nomor Kursi:</b> {selectedBooking.Kursi?.nomor_kursi || '-'}</Typography>
                <Typography><b>Posisi Kursi:</b> {selectedBooking.Kursi?.posisi || '-'}</Typography>
                <Typography><b>Jendela:</b> {selectedBooking.Kursi?.jendela ? 'Ya' : 'Tidak'}</Typography>
                <Typography><b>Waktu Pesan:</b> {getBookingDate(selectedBooking)}</Typography>
                <Typography sx={{mt:2}}>
                  <b>Status Pembayaran:</b>{" "}
                  <span style={{
                    color:
                      selectedBooking.Pembayaran?.status === 'berhasil'
                        ? 'green'
                        : selectedBooking.Pembayaran?.status === 'pending'
                        ? 'purple'
                        : undefined,
                    fontWeight:
                      selectedBooking.Pembayaran?.status === 'berhasil' ||
                      selectedBooking.Pembayaran?.status === 'pending'
                        ? 'bold'
                        : undefined
                  }}>
                    {selectedBooking.Pembayaran?.status === 'berhasil'
                      ? 'berhasil'
                      : selectedBooking.Pembayaran?.status === 'pending'
                      ? 'Pending'
                      : (selectedBooking.Pembayaran?.status || 'Belum Bayar')}
                  </span>
                </Typography>
                {selectedBooking.Pembayaran && selectedBooking.Pembayaran.status !== 'berhasil' && selectedBooking.Pembayaran.id_pembayaran && (
                  <Button
                    variant="contained"
                    color="primary"
                    sx={{mt:2}}
                    onClick={() => {
                      handleBayarSelesai(selectedBooking);
                    }}
                    disabled={loadingBayarId === selectedBooking.Pembayaran.id_pembayaran}
                  >
                    Tandai Lunas
                  </Button>
                )}
                {(!selectedBooking.Pembayaran || !selectedBooking.Pembayaran.id_pembayaran) && (
                  <Typography color="error" sx={{mt:2}}>ID pembayaran tidak ditemukan di data pesanan ini.</Typography>
                )}
                <Box sx={{mt:2, display:'flex', gap:1}}>
                  <Button variant="outlined" onClick={() => openEditDialog(selectedBooking)}>Edit</Button>
                  <Button variant="outlined" color="error" onClick={() => handleDelete(selectedBooking)}>Hapus</Button>
                </Box>
              </>
            )}
          </Box>
        </Fade>
      </Modal>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Edit Kursi Pesanan</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="select-seat-label">Nomor Kursi Baru</InputLabel>
            <Select
              labelId="select-seat-label"
              value={editKursi}
              label="Nomor Kursi Baru"
              onChange={e => setEditKursi(e.target.value)}
            >
              {availableSeats.map(seat => (
                <MenuItem key={seat.nomor_kursi} value={seat.nomor_kursi}>
                  {seat.nomor_kursi} - {seat.posisi} {seat.jendela ? '(Jendela)' : ''}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Batal</Button>
          <Button onClick={submitEdit} variant="contained" disabled={!editKursi}>Simpan</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Hapus Pesanan</DialogTitle>
        <DialogContent>
          <Typography>Yakin ingin menghapus pesanan ini?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Batal</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">Hapus</Button>
        </DialogActions>
      </Dialog>

      {/* Your Modal Component */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h2 className="text-xl mb-4">Pembayaran</h2>
            {/* Status */}
            {status === "success" && (
              <div className="mb-4 text-green-600 font-semibold">
                Berhasil ditandai lunas!
              </div>
            )}
            {/* Button hanya tampil jika belum berhasil */}
            {status !== "success" && (
              <button
                className="bg-green-600 text-white px-4 py-2 rounded"
                onClick={handleSubmit}
              >
                Tandai Lunas
              </button>
            )}
            <button
              className="ml-2 text-gray-600"
              onClick={() => setShowModal(false)}
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </Container>
  );
};

export default MyBookings;