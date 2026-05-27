const mysql = require('mysql2/promise');
require('dotenv').config();

// Membuat pool koneksi database
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Tes koneksi saat aplikasi berjalan
pool.getConnection()
    .then(conn => {
        console.log('✅ Berhasil terhubung ke database MySQL');
        conn.release();
    })
    .catch(err => {
        console.error('❌ Gagal terhubung ke database:', err.message);
    });

module.exports = pool;