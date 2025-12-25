const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.register = async (req, res) => {
    try {
        // Ambil data sesuai input form Register Gawee
        const { fullname, email, password, phone } = req.body;

        // Cek apakah email sudah ada
        const [rows] = await db.query('SELECT email FROM users WHERE email = ?', [email]);
        if (rows.length > 0) return res.status(400).json({ message: 'Email sudah terdaftar!' });

        // Enkripsi password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Simpan ke database
        await db.query('INSERT INTO users (fullname, email, password, phone) VALUES (?, ?, ?, ?)', 
            [fullname, email, hashedPassword, phone]);

        res.status(201).json({ message: 'Registrasi berhasil!' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) return res.status(404).json({ message: 'User tidak ditemukan' });

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Password salah' });

        // Buat Token
        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.json({ 
            message: 'Login berhasil', 
            token, 
            user: { id: user.id, fullname: user.fullname, email: user.email } 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET USER PROFILE
exports.getUserProfile = async (req, res) => {
    try {
        const userId = req.user.id; 
        // Tambahkan job_title dan bio ke SELECT
        const [rows] = await db.query('SELECT id, fullname, email, phone, job_title, bio FROM users WHERE id = ?', [userId]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'User tidak ditemukan' });
        }

        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// UPDATE USER PROFILE (Update Query UPDATE)
exports.updateUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        // Tangkap input baru (job_title, bio)
        const { fullname, phone, job_title, bio } = req.body; 

        // Update database
        await db.query('UPDATE users SET fullname=?, phone=?, job_title=?, bio=? WHERE id=?', 
            [fullname, phone, job_title, bio, userId]);

        res.json({ message: 'Profil berhasil diperbarui' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};