import pool from '../config/database.js';

export const logAction = async (businessId, userId, action, details) => {
    try {
        await pool.query(
            'INSERT INTO audit_logs (business_id, user_id, action, details) VALUES ($1, $2, $3, $4)',
            [businessId || null, userId || null, action, details || null]
        );
    } catch (err) {
        console.error("Audit log error:", err);
    }
};