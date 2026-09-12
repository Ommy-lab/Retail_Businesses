import 'dotenv/config';
import app from './app.js';
import pool from './config/database.js';

const PORT = process.env.PORT || 4000;

// Test Database Connection and Start Server
pool.connect()
    .then(() => {
        console.log("Connected to PostgreSQL database: retailbusiness_db");
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error("Database connection error:", err.stack);
        process.exit(1);
    });