require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Inisialisasi Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware Global
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Cek koneksi database
require('./config/db');

// Rute dasar untuk health check
app.get('/', (req, res) => {
    res.json({
        status: 0,
        message: "Nutech Wallet API is running gracefully!",
        data: null
    });
});

// Daftarkan Routes
const apiRoutes = require('./routes/api');
app.use('/', apiRoutes);

// Menjalankan Server
app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});