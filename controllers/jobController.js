const db = require('../config/db');

// GET Semua Lowongan (Bisa diakses publik tanpa login)
exports.getAllJobs = async (req, res) => {
    try {
        const [jobs] = await db.query('SELECT * FROM jobs ORDER BY posted_at DESC');
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// POST Tambah Lowongan (Butuh Login)
exports.createJob = async (req, res) => {
    try {
        const { title, company_name, location, salary, description, job_type } = req.body;
        const userId = req.user.id; // Didapat dari middleware token

        await db.query(
            'INSERT INTO jobs (user_id, title, company_name, location, salary, description, job_type) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [userId, title, company_name, location, salary, description, job_type]
        );

        res.status(201).json({ message: 'Lowongan berhasil diposting!' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// PUT Update Lowongan (Hanya pemilik lowongan yang bisa edit)
exports.updateJob = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, company_name, location, salary, description, job_type } = req.body;
        const userId = req.user.id;

        // Cek dulu apakah job ini milik user yang sedang login
        const [check] = await db.query('SELECT user_id FROM jobs WHERE id = ?', [id]);
        if (check.length === 0) return res.status(404).json({ message: 'Job tidak ditemukan' });
        if (check[0].user_id !== userId) return res.status(403).json({ message: 'Anda tidak berhak mengedit job ini' });

        await db.query(
            'UPDATE jobs SET title=?, company_name=?, location=?, salary=?, description=?, job_type=? WHERE id=?',
            [title, company_name, location, salary, description, job_type, id]
        );

        res.json({ message: 'Job berhasil diupdate' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE Hapus Lowongan
exports.deleteJob = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const [check] = await db.query('SELECT user_id FROM jobs WHERE id = ?', [id]);
        if (check.length === 0) return res.status(404).json({ message: 'Job tidak ditemukan' });
        if (check[0].user_id !== userId) return res.status(403).json({ message: 'Anda tidak berhak menghapus job ini' });

        await db.query('DELETE FROM jobs WHERE id = ?', [id]);
        res.json({ message: 'Job berhasil dihapus' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// AMBIL LOWONGAN MILIK USER YANG LOGIN (MY JOBS)
exports.getMyJobs = async (req, res) => {
    try {
        const userId = req.user.id;
        const [jobs] = await db.query('SELECT * FROM jobs WHERE user_id = ? ORDER BY posted_at DESC', [userId]);
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ... kode lama ...

// APPLY JOB (Melamar Pekerjaan)
exports.applyJob = async (req, res) => {
    try {
        const userId = req.user.id; // Dari token login
        const { job_id } = req.body;

        // 1. Cek apakah sudah pernah apply sebelumnya
        const [existing] = await db.query(
            'SELECT * FROM applications WHERE user_id = ? AND job_id = ?', 
            [userId, job_id]
        );

        if (existing.length > 0) {
            return res.status(400).json({ message: 'Anda sudah melamar pekerjaan ini sebelumnya.' });
        }

        // 2. Simpan Lamaran
        await db.query(
            'INSERT INTO applications (user_id, job_id) VALUES (?, ?)',
            [userId, job_id]
        );

        res.status(201).json({ message: 'Lamaran berhasil dikirim!' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};