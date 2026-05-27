const multer = require('multer');
const fs = require('fs');

// Otomatis membuat folder 'uploads' jika belum ada
if (!fs.existsSync('./uploads')) {
    fs.mkdirSync('./uploads');
}

// Konfigurasi tempat penyimpanan dan nama file
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/');
    },
    filename: function (req, file, cb) {
        // Nama file unik: timestamp + nama asli
        cb(null, Date.now() + '-' + file.originalname);
    }
});

// Filter khusus hanya untuk JPEG dan PNG
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(new Error('Format Image tidak sesuai'), false);
    }
};

const upload = multer({ 
    storage: storage, 
    fileFilter: fileFilter 
});

module.exports = upload;