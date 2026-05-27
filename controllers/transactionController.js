const db = require('../config/db');

// Fungsi bantuan untuk membuat nomor invoice (Format: INV-DDMMYYYY-XXX)
const generateInvoice = () => {
    const date = new Date();
    const dmy = `${String(date.getDate()).padStart(2, '0')}${String(date.getMonth() + 1).padStart(2, '0')}${date.getFullYear()}`;
    const randomStr = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `INV-${dmy}-${randomStr}`;
};

// ==========================================
// 1. GET BALANCE
// ==========================================
exports.getBalance = async (req, res) => {
    try {
        const [users] = await db.execute('SELECT balance FROM users WHERE email = ?', [req.user.email]);

        res.status(200).json({
            status: 0,
            message: "Get Balance Berhasil",
            data: {
                balance: users[0].balance
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, message: "Terjadi kesalahan pada server", data: null });
    }
};

// ==========================================
// 2. TOP UP
// ==========================================
exports.topUp = async (req, res) => {
    const { top_up_amount } = req.body;

    // Validasi input: wajib angka dan tidak boleh kurang dari 0
    if (top_up_amount === undefined || typeof top_up_amount !== 'number' || top_up_amount < 0) {
        return res.status(400).json({
            status: 102,
            message: "Parameter amount hanya boleh angka dan tidak boleh lebih kecil dari 0",
            data: null
        });
    }

    // Menggunakan koneksi khusus untuk Database Transaction (mencegah bentrok data)
    const conn = await db.getConnection();
    
    try {
        await conn.beginTransaction(); // Mulai kunci database

        // 1. Ambil ID dan Saldo User saat ini (Gunakan FOR UPDATE agar data dikunci selama proses)
        const [users] = await conn.execute('SELECT id, balance FROM users WHERE email = ? FOR UPDATE', [req.user.email]);
        const user = users[0];

        // 2. Tambahkan saldo
        const newBalance = user.balance + top_up_amount;
        await conn.execute('UPDATE users SET balance = ? WHERE id = ?', [newBalance, user.id]);

        // 3. Catat riwayat ke tabel transactions
        const invoiceNumber = generateInvoice();
        await conn.execute(
            'INSERT INTO transactions (invoice_number, user_id, transaction_type, description, total_amount) VALUES (?, ?, ?, ?, ?)',
            [invoiceNumber, user.id, 'TOPUP', 'Top Up balance', top_up_amount]
        );

        await conn.commit(); // Simpan permanen dan buka kunci

        res.status(200).json({
            status: 0,
            message: "Top Up Balance berhasil",
            data: {
                balance: newBalance
            }
        });

    } catch (error) {
        await conn.rollback(); // Batalkan semua perubahan jika terjadi error
        console.error(error);
        res.status(500).json({ status: 500, message: "Terjadi kesalahan pada server", data: null });
    } finally {
        conn.release(); // Kembalikan koneksi ke pool
    }
};

// ==========================================
// 3. TRANSACTION (PEMBAYARAN)
// ==========================================
exports.transaction = async (req, res) => {
    const { service_code } = req.body;

    if (!service_code) {
        return res.status(400).json({ status: 102, message: "Service atau Layanan tidak ditemukan", data: null });
    }

    const conn = await db.getConnection();
    
    try {
        await conn.beginTransaction();

        // 1. Cek apakah layanan tersedia
        const [services] = await conn.execute('SELECT service_name, service_tariff FROM services WHERE service_code = ?', [service_code]);
        if (services.length === 0) {
            await conn.rollback();
            return res.status(400).json({ status: 102, message: "Service atau Layanan tidak ditemukan", data: null });
        }
        const service = services[0];

        // 2. Ambil User dan Saldo saat ini
        const [users] = await conn.execute('SELECT id, balance FROM users WHERE email = ? FOR UPDATE', [req.user.email]);
        const user = users[0];

        // 3. Cek apakah saldo mencukupi
        if (user.balance < service.service_tariff) {
            await conn.rollback();
            return res.status(400).json({ status: 108, message: "Saldo tidak mencukupi", data: null });
        }

        // 4. Potong saldo
        const newBalance = user.balance - service.service_tariff;
        await conn.execute('UPDATE users SET balance = ? WHERE id = ?', [newBalance, user.id]);

        // 5. Catat transaksi
        const invoiceNumber = generateInvoice();
        await conn.execute(
            'INSERT INTO transactions (invoice_number, user_id, transaction_type, description, total_amount) VALUES (?, ?, ?, ?, ?)',
            [invoiceNumber, user.id, 'PAYMENT', service.service_name, service.service_tariff]
        );

        await conn.commit();

        res.status(200).json({
            status: 0,
            message: "Transaksi berhasil",
            data: {
                invoice_number: invoiceNumber,
                service_code: service_code,
                service_name: service.service_name,
                transaction_type: "PAYMENT",
                total_amount: service.service_tariff,
                created_on: new Date().toISOString()
            }
        });

    } catch (error) {
        await conn.rollback();
        console.error(error);
        res.status(500).json({ status: 500, message: "Terjadi kesalahan pada server", data: null });
    } finally {
        conn.release();
    }
};

// ==========================================
// 4. TRANSACTION HISTORY
// ==========================================
exports.getTransactionHistory = async (req, res) => {
    // Ambil limit dan offset dari query parameter (URL), set default jika kosong
    const limit = parseInt(req.query.limit) || 0;
    const offset = parseInt(req.query.offset) || 0;

    try {
        // Ambil ID User
        const [users] = await db.execute('SELECT id FROM users WHERE email = ?', [req.user.email]);
        const userId = users[0].id;

        // Query diubah: menggunakan created_on bukan created_at
        let query = 'SELECT invoice_number, transaction_type, description, total_amount, created_on FROM transactions WHERE user_id = ? ORDER BY created_on DESC';
        let params = [userId];

        // Jika ada limit, tambahkan ke query (Pagination)
        if (limit > 0) {
            query += ' LIMIT ? OFFSET ?';
            params.push(limit, offset);
        }

        const [records] = await db.execute(query, params);

        res.status(200).json({
            status: 0,
            message: "Get History Berhasil",
            data: {
                offset: offset,
                limit: limit,
                records: records
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, message: "Terjadi kesalahan pada server", data: null });
    }
};