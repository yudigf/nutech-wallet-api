const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../uploads');

// Buat folder uploads jika belum ada
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Konfigurasi penyimpanan file
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Format nama file: timestamp-namaasli (contoh: 1716800000000-photo.jpg)
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

// Hanya format JPEG dan PNG
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(new Error('Format Image tidak sesuai'), false);
    }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;