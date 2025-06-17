import React, { useState, useEffect } from 'react';
import { Box, Grid, Button, TextField, Select, MenuItem, InputLabel, FormControl, Typography } from '@mui/material';
import axios from 'axios';

const BookingFilter = ({ onFilter }) => {
  const [seats, setSeats] = useState([]);
  const [nomorKursi, setNomorKursi] = useState('');
  const [posisi, setPosisi] = useState('');
  const [jendela, setJendela] = useState('');
  const [sort, setSort] = useState('waktu_pesan');
  const [order, setOrder] = useState('DESC');

  useEffect(() => {
    // Fetch all seats for filter options
    axios.get('http://localhost:4000/api/seats').then(res => setSeats(res.data)).catch(() => setSeats([]));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    onFilter({ nomor_kursi: nomorKursi, posisi, jendela, sort, order });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={3}>
          <FormControl fullWidth>
            <InputLabel id="nomor-kursi-label">Nomor Kursi</InputLabel>
            <Select
              labelId="nomor-kursi-label"
              value={nomorKursi}
              label="Nomor Kursi"
              onChange={e => setNomorKursi(e.target.value)}
            >
              <MenuItem value="">Semua</MenuItem>
              {seats.map(seat => (
                <MenuItem key={seat.nomor_kursi} value={seat.nomor_kursi}>{seat.nomor_kursi}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={2}>
          <FormControl fullWidth>
            <InputLabel id="posisi-label">Posisi</InputLabel>
            <Select
              labelId="posisi-label"
              value={posisi}
              label="Posisi"
              onChange={e => setPosisi(e.target.value)}
            >
              <MenuItem value="">Semua</MenuItem>
              <MenuItem value="atas">Atas</MenuItem>
              <MenuItem value="tengah">Tengah</MenuItem>
              <MenuItem value="bawah">Bawah</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={2}>
          <FormControl fullWidth>
            <InputLabel id="jendela-label">Jendela</InputLabel>
            <Select
              labelId="jendela-label"
              value={jendela}
              label="Jendela"
              onChange={e => setJendela(e.target.value)}
            >
              <MenuItem value="">Semua</MenuItem>
              <MenuItem value="true">Ya</MenuItem>
              <MenuItem value="false">Tidak</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={2}>
          <FormControl fullWidth>
            <InputLabel id="sort-label">Urutkan</InputLabel>
            <Select
              labelId="sort-label"
              value={sort}
              label="Urutkan"
              onChange={e => setSort(e.target.value)}
            >
              <MenuItem value="waktu_pesan">Waktu Pesan</MenuItem>
              <MenuItem value="id_pesanan">ID Pesanan</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={1}>
          <FormControl fullWidth>
            <InputLabel id="order-label">Order</InputLabel>
            <Select
              labelId="order-label"
              value={order}
              label="Order"
              onChange={e => setOrder(e.target.value)}
            >
              <MenuItem value="DESC">↓</MenuItem>
              <MenuItem value="ASC">↑</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={2}>
          <Button type="submit" variant="contained" fullWidth>Filter</Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BookingFilter;
