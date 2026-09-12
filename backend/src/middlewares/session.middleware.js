import pool from '../config/database.js';
import { logAction } from '../utils/logger.js';

export const checkAutoCloseSession = async (req, res, next) => {
    const business_id = req.user.business_id;
    const today = new Date().toISOString().split('T')[0];

    try {
        // Find any open sessions belonging to a date prior to today
        const oldSessions = await pool.query(
            "SELECT * FROM daily_sessions WHERE business_id = $1 AND status = 'open' AND session_date < $2",
            [business_id, today]
        );

        if (oldSessions.rows.length > 0) {
            for (let session of oldSessions.rows) {
                // Auto-close the stale session
                await pool.query(
                    "UPDATE daily_sessions SET status = 'closed', closed_at = CURRENT_TIMESTAMP WHERE id = $1",
                    [session.id]
                );
                await logAction(business_id, req.user.id, "Auto-closed session", `Session for ${session.date} automatically closed due to date change.`);
            }
        }
        next();
    } catch (err) {
        console.error("Auto-close middleware error:", err);
        next(); // Proceed even if check fails to avoid completely blocking users
    }
};