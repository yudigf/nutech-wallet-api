const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    // Ambil token dari header 'Authorization'
    const authHeader = req.headers.authorization;

    // Cek apakah header ada dan formatnya Bearer Token
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        // Teks error ini 100% mengikuti typo dari dokumen Swagger soal
        return res.status(401).json({ status: 108, message: "Token tidak tidak valid atau kadaluwarsa", data: null });
    }

    // Pisahkan kata 'Bearer ' dan ambil token aslinya
    const token = authHeader.split(' ')[1];

    try {
        // Verifikasi token dengan JWT_SECRET rahasia kita
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Simpan data email dari token ke dalam request agar bisa dibaca controller
        req.user = decoded; 
        
        next(); // Token valid, silakan lewat!
    } catch (error) {
        return res.status(401).json({ status: 108, message: "Token tidak tidak valid atau kadaluwarsa", data: null });
    }
};