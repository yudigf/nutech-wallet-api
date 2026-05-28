const db = require('../config/db');

// generate nomor invoice unik dengan format: INV-DDMMYYYY-XXX
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
                balance: users[0].balance,
            },
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

    if (top_up_amount === undefined || typeof top_up_amount !== 'number' || top_up_amount < 0) {
        return res.status(400).json({
            status: 102,
            message: "Paramter amount hanya boleh angka dan tidak boleh lebih kecil dari 0",
            data: null,
        });
    }

    const conn = await db.getConnection();

    try {
        await conn.beginTransaction();

        const [users] = await conn.execute('SELECT id, balance FROM users WHERE email = ? FOR UPDATE', [req.user.email]);
        const user = users[0];

        const newBalance = user.balance + top_up_amount;
        await conn.execute('UPDATE users SET balance = ? WHERE id = ?', [newBalance, user.id]);

        const invoiceNumber = generateInvoice();
        await conn.execute(
            'INSERT INTO transactions (invoice_number, user_id, transaction_type, description, total_amount) VALUES (?, ?, ?, ?, ?)',
            [invoiceNumber, user.id, 'TOPUP', 'Top Up balance', top_up_amount]
        );

        await conn.commit();

        res.status(200).json({
            status: 0,
            message: "Top Up Balance berhasil",
            data: {
                balance: newBalance,
            },
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
// 3. TRANSACTION (PEMBAYARAN)
// ==========================================
exports.transaction = async (req, res) => {
    const { service_code } = req.body;

    if (!service_code) {
        return res.status(400).json({ status: 102, message: "Service ataus Layanan tidak ditemukan", data: null });
    }

    const conn = await db.getConnection();

    try {
        await conn.beginTransaction();

        // Validasi service_code
        const [services] = await conn.execute('SELECT service_name, service_tariff FROM services WHERE service_code = ?', [service_code]);
        if (services.length === 0) {
            await conn.rollback();
            return res.status(400).json({ status: 102, message: "Service ataus Layanan tidak ditemukan", data: null });
        }
        const service = services[0];

        // Mencegah race condition
        const [users] = await conn.execute('SELECT id, balance FROM users WHERE email = ? FOR UPDATE', [req.user.email]);
        const user = users[0];

        // Validasi saldo
        if (user.balance < service.service_tariff) {
            await conn.rollback();
            return res.status(400).json({ status: 108, message: "Saldo tidak mencukupi", data: null });
        }

        const newBalance = user.balance - service.service_tariff;
        await conn.execute('UPDATE users SET balance = ? WHERE id = ?', [newBalance, user.id]);

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
                created_on: new Date().toISOString(),
            },
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
    const limit = parseInt(req.query.limit) || 0;
    const offset = parseInt(req.query.offset) || 0;

    try {
        const [users] = await db.execute('SELECT id FROM users WHERE email = ?', [req.user.email]);
        const userId = users[0].id;

        let query = 'SELECT invoice_number, transaction_type, description, total_amount, created_on FROM transactions WHERE user_id = ? ORDER BY created_on DESC';
        const params = [userId];

        if (limit > 0) {
            query += ' LIMIT ? OFFSET ?';
            params.push(limit, offset);
        }

        const [records] = await db.execute(query, params);

        res.status(200).json({
            status: 0,
            message: "Get History Berhasil",
            data: {
                offset,
                limit,
                records,
            },
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, message: "Terjadi kesalahan pada server", data: null });
    }
};