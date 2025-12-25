const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',      // Sesuaikan user database Anda
    password: '',      // Sesuaikan password database Anda (default XAMPP kosong)
    database: 'gawee_db'
});

db.getConnection((err) => {
    if (err) {
        console.error('Database connection failed:', err.message);
    } else {
        console.log('Connected to MySQL Database');
    }
});

module.exports = db.promise(); // Kita pakai mode Promise agar lebih modern (async/await)