import pkg from "pg";

const { Pool } = pkg;

// Use Railway's DATABASE_URL in production.
// Keep the local variables as a fallback so your localhost setup
// can continue working during development.
const pool = new Pool(
    process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,

        // Railway PostgreSQL requires SSL in production.
        ssl:
        process.env.NODE_ENV === "production"
            ? { rejectUnauthorized: false }
            : false,
    }
    : {
        // Local development configuration
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
    }
);

export default pool;