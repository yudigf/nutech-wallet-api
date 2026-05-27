
-- ==========================================
-- TABEL USERS
-- ==========================================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    profile_image VARCHAR(255) DEFAULT 'https://yoururlapi.com/profile.jpeg',
    balance INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ==========================================
-- TABEL BANNERS
-- ==========================================
CREATE TABLE banners (
    id INT AUTO_INCREMENT PRIMARY KEY,
    banner_name VARCHAR(100) NOT NULL,
    banner_image VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Data awal (seed) untuk tabel banners
INSERT INTO banners (banner_name, banner_image, description) VALUES
('Banner 1', 'https://nutech-integrasi.app/dummy.jpg', 'Lerem Ipsum Dolor sit amet'),
('Banner 2', 'https://nutech-integrasi.app/dummy.jpg', 'Lerem Ipsum Dolor sit amet'),
('Banner 3', 'https://nutech-integrasi.app/dummy.jpg', 'Lerem Ipsum Dolor sit amet'),
('Banner 4', 'https://nutech-integrasi.app/dummy.jpg', 'Lerem Ipsum Dolor sit amet'),
('Banner 5', 'https://nutech-integrasi.app/dummy.jpg', 'Lerem Ipsum Dolor sit amet'),
('Banner 6', 'https://nutech-integrasi.app/dummy.jpg', 'Lerem Ipsum Dolor sit amet');

-- ==========================================
-- TABEL SERVICES (Layanan PPOB)
-- ==========================================
CREATE TABLE services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    service_code VARCHAR(50) NOT NULL UNIQUE,
    service_name VARCHAR(100) NOT NULL,
    service_icon VARCHAR(255) NOT NULL,
    service_tariff INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Data awal (seed) untuk tabel services
INSERT INTO services (service_code, service_name, service_icon, service_tariff) VALUES
('PAJAK',           'Pajak PBB',           'https://nutech-integrasi.app/dummy.jpg', 40000),
('PLN',             'Listrik',             'https://nutech-integrasi.app/dummy.jpg', 10000),
('PDAM',            'PDAM Berlangganan',   'https://nutech-integrasi.app/dummy.jpg', 40000),
('PULSA',           'Pulsa',               'https://nutech-integrasi.app/dummy.jpg', 40000),
('PGN',             'PGN Berlangganan',    'https://nutech-integrasi.app/dummy.jpg', 50000),
('MUSIK',           'Musik Berlangganan',  'https://nutech-integrasi.app/dummy.jpg', 50000),
('TV',              'TV Berlangganan',     'https://nutech-integrasi.app/dummy.jpg', 50000),
('PAKET_DATA',      'Paket data',          'https://nutech-integrasi.app/dummy.jpg', 50000),
('VOUCHER_GAME',    'Voucher Game',        'https://nutech-integrasi.app/dummy.jpg', 100000),
('VOUCHER_MAKANAN', 'Voucher Makanan',     'https://nutech-integrasi.app/dummy.jpg', 100000),
('QURBAN',          'Qurban',              'https://nutech-integrasi.app/dummy.jpg', 200000),
('ZAKAT',           'Zakat',               'https://nutech-integrasi.app/dummy.jpg', 300000);

-- ==========================================
-- TABEL TRANSACTIONS (Riwayat Mutasi)
-- ==========================================
CREATE TABLE transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_number VARCHAR(100) NOT NULL UNIQUE,
    user_id INT NOT NULL,
    transaction_type VARCHAR(50) NOT NULL, -- Nilai: 'TOPUP' atau 'PAYMENT'
    description VARCHAR(255) NOT NULL,     -- Contoh: 'Top Up balance' atau 'Pulsa'
    total_amount INT NOT NULL,
    created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);