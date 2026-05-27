const db = require('../config/db');

// ==========================================
// 1. GET PROFIL
// ==========================================
exports.getProfile = async (req, res) => {
    try {
        const [users] = await db.execute(
            'SELECT email, first_name, last_name, profile_image FROM users WHERE email = ?',
            [req.user.email]
        );

        if (users.length === 0) {
            return res.status(404).json({ status: 1, message: "User tidak ditemukan", data: null });
        }

        res.status(200).json({
            status: 0,
            message: "Sukses",
            data: users[0],
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, message: "Terjadi kesalahan pada server", data: null });
    }
};

// ==========================================
// 2. UPDATE PROFIL
// ==========================================
exports.updateProfile = async (req, res) => {
    const { first_name, last_name } = req.body;

    if (!first_name || !last_name) {
        return res.status(400).json({ status: 102, message: "Parameter first_name dan last_name harus diisi", data: null });
    }

    try {
        await db.execute(
            'UPDATE users SET first_name = ?, last_name = ? WHERE email = ?',
            [first_name, last_name, req.user.email]
        );

        const [users] = await db.execute(
            'SELECT email, first_name, last_name, profile_image FROM users WHERE email = ?',
            [req.user.email]
        );

        res.status(200).json({
            status: 0,
            message: "Update Pofile berhasil",
            data: users[0],
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, message: "Terjadi kesalahan pada server", data: null });
    }
};

// ==========================================
// 3. UPDATE FOTO PROFIL
// ==========================================
exports.updateProfileImage = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ status: 102, message: "Format Image tidak sesuai", data: null });
    }

    try {
        const imageUrl = `${process.env.APP_URL}/uploads/${req.file.filename}`;

        await db.execute(
            'UPDATE users SET profile_image = ? WHERE email = ?',
            [imageUrl, req.user.email]
        );

        const [users] = await db.execute(
            'SELECT email, first_name, last_name, profile_image FROM users WHERE email = ?',
            [req.user.email]
        );

        res.status(200).json({
            status: 0,
            message: "Update Profile Image berhasil",
            data: users[0],
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, message: "Terjadi kesalahan pada server", data: null });
    }
};