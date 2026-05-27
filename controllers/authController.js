const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Fungsi bantuan untuk validasi email
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// ==========================================
// 1. REGISTRASI
// ==========================================
exports.register = async (req, res) => {
    const { email, first_name, last_name, password } = req.body;

    // Validasi Input
    if (!email || !isValidEmail(email)) {
        return res.status(400).json({ status: 102, message: "Parameter email tidak sesuai format", data: null });
    }
    if (!password || password.length < 8) {
        return res.status(400).json({ status: 102, message: "Password length minimal 8 karakter", data: null });
    }

    try {
        // Cek apakah email sudah terdaftar
        const [existingUser] = await db.execute('SELECT email FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ status: 102, message: "Email sudah terdaftar", data: null });
        }

        // Hash password (enkripsi)
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert ke database
        await db.execute(
            'INSERT INTO users (email, first_name, last_name, password) VALUES (?, ?, ?, ?)',
            [email, first_name, last_name, hashedPassword]
        );

        res.status(200).json({
            status: 0,
            message: "Registrasi berhasil silahkan login",
            data: null
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, message: "Terjadi kesalahan pada server", data: null });
    }
};

// ==========================================
// 2. LOGIN
// ==========================================
exports.login = async (req, res) => {
    const { email, password } = req.body;

    // Validasi Input
    if (!email || !isValidEmail(email)) {
        return res.status(400).json({ status: 102, message: "Parameter email tidak sesuai format", data: null });
    }
    if (!password || password.length < 8) {
        return res.status(400).json({ status: 102, message: "Password length minimal 8 karakter", data: null });
    }

    try {
        // Cari user berdasarkan email
        const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        const user = users[0];

        // Jika user tidak ada atau password salah
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ status: 103, message: "Username atau password salah", data: null });
        }

        // Generate JWT Token (sesuai soal: payload email, expired 12 jam)
        const token = jwt.sign(
            { email: user.email }, 
            process.env.JWT_SECRET, 
            { expiresIn: '12h' }
        );

        res.status(200).json({
            status: 0,
            message: "Login Sukses",
            data: { token }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, message: "Terjadi kesalahan pada server", data: null });
    }
};

// ==========================================
// UPLOAD FOTO PROFIL
// ==========================================
exports.updateProfileImage = async (req, res) => {
    // Jika file tidak ada atau ditolak oleh filter Multer
    if (!req.file) {
        return res.status(400).json({ status: 102, message: "Format Image tidak sesuai", data: null });
    }

    try {
        // Buat URL yang bisa diakses publik (sesuaikan dengan port server)
        const imageUrl = `http://localhost:${process.env.PORT || 3000}/uploads/${req.file.filename}`;

        // Update database
        await db.execute(
            'UPDATE users SET profile_image = ? WHERE email = ?',
            [imageUrl, req.user.email]
        );

        // Ambil data terbaru untuk response
        const [users] = await db.execute(
            'SELECT email, first_name, last_name, profile_image FROM users WHERE email = ?', 
            [req.user.email]
        );

        res.status(200).json({
            status: 0,
            message: "Update Profile Image berhasil",
            data: users[0]
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, message: "Terjadi kesalahan pada server", data: null });
    }
};