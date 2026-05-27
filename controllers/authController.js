const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Validasi format email menggunakan regex
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// ==========================================
// 1. REGISTRASI
// ==========================================
exports.register = async (req, res) => {
    const { email, first_name, last_name, password } = req.body;

    if (!email || !isValidEmail(email)) {
        return res.status(400).json({ status: 102, message: "Paramter email tidak sesuai format", data: null });
    }
    if (!password || password.length < 8) {
        return res.status(400).json({ status: 102, message: "Password length minimal 8 karakter", data: null });
    }

    try {
        const [existingUser] = await db.execute('SELECT email FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ status: 102, message: "Email sudah terdaftar", data: null });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await db.execute(
            'INSERT INTO users (email, first_name, last_name, password) VALUES (?, ?, ?, ?)',
            [email, first_name, last_name, hashedPassword]
        );

        res.status(200).json({
            status: 0,
            message: "Registrasi berhasil silahkan login",
            data: null,
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

    if (!email || !isValidEmail(email)) {
        return res.status(400).json({ status: 102, message: "Paramter email tidak sesuai format", data: null });
    }
    if (!password || password.length < 8) {
        return res.status(400).json({ status: 102, message: "Password length minimal 8 karakter", data: null });
    }

    try {
        const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        const user = users[0];

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ status: 103, message: "Username atau password salah", data: null });
        }

        // JWT payload berisi email, berlaku selama 12 jam
        const token = jwt.sign(
            { email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '12h' }
        );

        res.status(200).json({
            status: 0,
            message: "Login Sukses",
            data: { token },
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, message: "Terjadi kesalahan pada server", data: null });
    }
};