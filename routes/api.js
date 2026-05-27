const express = require('express');
const router = express.Router();

// Import Controller
const authController = require('../controllers/authController');
const profileController = require('../controllers/profileController');
const informationController = require('../controllers/informationController');
const transactionController = require('../controllers/transactionController');

// Import Middleware
const authMiddleware = require('../middlewares/authMiddleware');
const uploadMiddleware = require('../middlewares/uploadMiddleware');

// ==========================================
// ROUTES MODUL 1: MEMBERSHIP
// ==========================================

// Public (Tidak butuh token)
router.post('/registration', authController.register);
router.post('/login', authController.login);

// Private (Wajib lewat authMiddleware / Butuh Token)
router.get('/profile', authMiddleware, profileController.getProfile);
router.put('/profile/update', authMiddleware, profileController.updateProfile);

// Rute untuk Upload Foto (Pakai pembungkus untuk menangkap error format)
const uploadProfile = uploadMiddleware.single('file');
router.put('/profile/image', authMiddleware, (req, res, next) => {
    uploadProfile(req, res, function (err) {
        if (err) {
            return res.status(400).json({ status: 102, message: "Format Image tidak sesuai", data: null });
        }
        next();
    });
}, profileController.updateProfileImage);

// ==========================================
// ROUTES MODUL 2: INFORMATION
// ==========================================
router.get('/banner', informationController.getBanners); // Public
router.get('/services', authMiddleware, informationController.getServices); // Private (Butuh Token)

// ==========================================
// ROUTES MODUL 3: TRANSACTION
// ==========================================
router.get('/balance', authMiddleware, transactionController.getBalance);
router.post('/topup', authMiddleware, transactionController.topUp);
router.post('/transaction', authMiddleware, transactionController.transaction);
router.get('/transaction/history', authMiddleware, transactionController.getTransactionHistory);

// Wajib diletakkan di baris paling bawah
module.exports = router;