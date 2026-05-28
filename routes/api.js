const express = require('express');
const router = express.Router();

// Controllers
const authController = require('../controllers/authController');
const profileController = require('../controllers/profileController');
const informationController = require('../controllers/informationController');
const transactionController = require('../controllers/transactionController');

// Middlewares
const authMiddleware = require('../middlewares/authMiddleware');
const uploadMiddleware = require('../middlewares/uploadMiddleware');

// ==========================================
// MODUL 1: MEMBERSHIP
// ==========================================

// Public
router.post('/registration', authController.register);
router.post('/login', authController.login);

// Private (memerlukan token JWT)
router.get('/profile', authMiddleware, profileController.getProfile);
router.put('/profile/update', authMiddleware, profileController.updateProfile);

// Upload foto profil — error format file ditangani di level route
const uploadProfile = uploadMiddleware.single('file');
router.put('/profile/image', authMiddleware, (req, res, next) => {
    uploadProfile(req, res, (err) => {
        if (err) {
            return res.status(400).json({ status: 102, message: "Format Image tidak sesuai", data: null });
        }
        next();
    });
}, profileController.updateProfileImage);

// ==========================================
// MODUL 2: INFORMATION
// ==========================================

router.get('/banner', informationController.getBanners);                         // Public
router.get('/services', authMiddleware, informationController.getServices);      // Private

// ==========================================
// MODUL 3: TRANSACTION
// ==========================================

router.get('/balance', authMiddleware, transactionController.getBalance);
router.post('/topup', authMiddleware, transactionController.topUp);
router.post('/transaction', authMiddleware, transactionController.transaction);
router.get('/transaction/history', authMiddleware, transactionController.getTransactionHistory);

module.exports = router;