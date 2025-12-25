const express = require('express');
const cors = require('cors');
const authController = require('./controllers/authController');
const jobController = require('./controllers/jobController');
const verifyToken = require('./middleware/authMiddleware');

const app = express();
app.use(cors()); // Agar Flutter bisa akses API ini
app.use(express.json());

// --- ROUTES ---

// Auth Routes
app.post('/api/register', authController.register);
app.post('/api/login', authController.login);

// Job 
app.get('/api/jobs', jobController.getAllJobs); // Public
app.post('/api/jobs', verifyToken, jobController.createJob); // Private
app.put('/api/jobs/:id', verifyToken, jobController.updateJob); // Private
app.delete('/api/jobs/:id', verifyToken, jobController.deleteJob); // Private
app.get('/api/my-jobs', verifyToken, jobController.getMyJobs); // Private
app.post('/api/apply', verifyToken, jobController.applyJob); // Private

// --- PROFILE ROUTES ---
app.get('/api/profile', verifyToken, authController.getUserProfile);
app.put('/api/profile', verifyToken, authController.updateUserProfile);

// Jalankan Server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});