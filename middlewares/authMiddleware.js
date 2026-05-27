const jwt = require('jsonwebtoken');

// Middleware untuk memverifikasi JWT Bearer Token
module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization;

    // Pastikan header Authorization ada dan menggunakan format Bearer
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ status: 108, message: "Token tidak tidak valid atau kadaluwarsa", data: null });
    }

    const token = authHeader.split(' ')[1];

    try {
        // Verifikasi token dan lampirkan data user ke objek request
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ status: 108, message: "Token tidak tidak valid atau kadaluwarsa", data: null });
    }
};