import express from 'express';
import cors from 'cors';

// Import routes (ensure .js extension is included for local files in ES modules)
import authRoutes from './routes/auth.routes.js';
import adminRoutes from './routes/admin.routes.js';
import businessRoutes from './routes/business.routes.js';

import reportRoutes from './routes/report.routes.js';

const app = express();

//Load image from the frontend
app.use('/uploads', express.static('uploads'));

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/business', businessRoutes);
app.use('/api/business/reports', reportRoutes);

// Health Check Root Endpoint
app.get('/', (req, res) => {
    res.json({ message: "Retail Business API is running successfully." });
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Something went wrong on the server." });
});

export default app;