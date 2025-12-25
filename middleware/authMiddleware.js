const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    // Format token biasanya: "Bearer <token_disini>"
    const token = authHeader && authHeader.split(' ')[1]; 

    if (!token) {
        return res.status(403).json({ message: 'Akses ditolak. Token tidak ditemukan.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Simpan data user (id & email) ke request
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token tidak valid' });
    }
};

module.exports = verifyToken;