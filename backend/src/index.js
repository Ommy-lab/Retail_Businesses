import "dotenv/config";
import app from "./app.js";
import pool from "./config/database.js";

const PORT = process.env.PORT || 4000;

// Test the database connection before starting the server.
pool.connect()
    .then((client) => {
        // Release the connection back to the pool after testing.
        client.release();

        console.log("Connected to PostgreSQL database successfully.");

        // Railway provides PORT automatically in production.
        // 0.0.0.0 allows the application to accept external connections.
        app.listen(PORT, "0.0.0.0", () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("Database connection error:", err);
        process.exit(1);
    });