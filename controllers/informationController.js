const db = require('../config/db');

// ==========================================
// 1. GET BANNERS (Public)
// ==========================================
exports.getBanners = async (req, res) => {
    try {
        const [banners] = await db.execute('SELECT banner_name, banner_image, description FROM banners');
        
        res.status(200).json({
            status: 0,
            message: "Sukses",
            data: banners
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, message: "Terjadi kesalahan pada server", data: null });
    }
};

// ==========================================
// 2. GET SERVICES (Private)
// ==========================================
exports.getServices = async (req, res) => {
    try {
        const [services] = await db.execute('SELECT service_code, service_name, service_icon, service_tariff FROM services');
        
        res.status(200).json({
            status: 0,
            message: "Sukses",
            data: services
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, message: "Terjadi kesalahan pada server", data: null });
    }
};