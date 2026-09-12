import pool from '../config/database.js';
import bcrypt from 'bcryptjs';

// Open a business day
export const openDay = async (req, res) => {
    const business_id = req.user.business_id;
    const session_date = new Date().toISOString().split('T')[0];

    try {
        // Strict check for any existing session on this date regardless of status
        const existing = await pool.query(
            'SELECT * FROM daily_sessions WHERE business_id = $1 AND session_date = $2',
            [business_id, session_date]
        );

        if (existing.rows.length > 0) {
            const session = existing.rows[0];
            if (session.status === 'open') {
                return res.status(400).json({ error: "Today's business session is already open." });
            } else {
                return res.status(400).json({ error: "Today's session has already been closed and locked." });
            }
        }

        const result = await pool.query(
            'INSERT INTO daily_sessions (business_id, session_date, status) VALUES ($1, $2, $3) RETURNING *',
            [business_id, session_date, 'open']
        );

        res.status(201).json({ message: "Business day opened successfully", session: result.rows[0] });
    } catch (err) {
        console.error("Open day error:", err);
        res.status(500).json({ error: "Internal server error." });
    }
};

// Close a business day and calculate profits
export const closeDay = async (req, res) => {
    const business_id = req.user.business_id;
    const session_date = new Date().toISOString().split('T')[0];

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Find open session
        const sessionResult = await client.query(
            'SELECT * FROM daily_sessions WHERE business_id = $1 AND session_date = $2 AND status = $3',
            [business_id, session_date, 'open']
        );

        if (sessionResult.rows.length === 0) {
            return res.status(404).json({ error: "No active open session found for today." });
        }

        const session = sessionResult.rows[0];

        // Update session status to closed
        await client.query(
            'UPDATE daily_sessions SET status = $1, closed_at = CURRENT_TIMESTAMP WHERE id = $2',
            ['closed', session.id]
        );

        // Calculate totals for the session
        const incomeRes = await client.query('SELECT SUM(amount) AS total_income FROM incomes WHERE session_id = $1', [session.id]);
        const directExpRes = await client.query('SELECT SUM(amount) AS total_direct FROM expenses WHERE session_id = $1 AND expense_type = $2', [session.id, 'direct']);
        const operatingExpRes = await client.query('SELECT SUM(amount) AS total_operating FROM expenses WHERE session_id = $1 AND expense_type = $2', [session.id, 'operating']);

        const totalIncome = parseFloat(incomeRes.rows[0].total_income || 0);
        const totalDirectExp = parseFloat(directExpRes.rows[0].total_direct || 0);
        const totalOperatingExp = parseFloat(operatingExpRes.rows[0].total_operating || 0);

        const grossProfit = totalIncome - totalDirectExp;
        const netProfit = grossProfit - totalOperatingExp;

        await client.query('COMMIT');

        res.json({
            message: "Business day closed successfully",
            summary: {
                date: session_date,
                totalIncome,
                totalDirectExp,
                grossProfit,
                totalOperatingExp,
                netProfit
            }
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Close day error:", err);
        res.status(500).json({ error: "Internal server error." });
    } finally {
        client.release();
    }
};

// Add Income
export const addIncome = async (req, res) => {
    const business_id = req.user.business_id;
    const { amount, source, description } = req.body;
    const session_date = new Date().toISOString().split('T')[0];

    if (!amount || !source) {
        return res.status(400).json({ error: "Amount and source are required." });
    }

    try {
        // Verify active open session for today (explicitly check status to block closed/locked days)
        const sessionRes = await pool.query(
            'SELECT id, status FROM daily_sessions WHERE business_id = $1 AND session_date = $2',
            [business_id, session_date]
        );

        if (sessionRes.rows.length === 0) {
            return res.status(400).json({ error: "You must open the business day before recording incomes." });
        }

        const session = sessionRes.rows[0];
        if (session.status !== 'open') {
            return res.status(400).json({ error: "Action denied. Today's business day has been closed and locked." });
        }

        const session_id = session.id;

        const result = await pool.query(
            'INSERT INTO incomes (business_id, session_id, amount, source, description) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [business_id, session_id, amount, source, description]
        );

        res.status(201).json({ message: "Income recorded successfully", income: result.rows[0] });
    } catch (err) {
        console.error("Add income error:", err);
        res.status(500).json({ error: "Internal server error." });
    }
};

// Add Expense
export const addExpense = async (req, res) => {
    const business_id = req.user.business_id;
    const { amount, category, expense_type, description } = req.body;
    const session_date = new Date().toISOString().split('T')[0];

    if (!amount || !category || !expense_type) {
        return res.status(400).json({ error: "Amount, category, and expense_type ('direct' or 'operating') are required." });
    }

    if (!['direct', 'operating'].includes(expense_type)) {
        return res.status(400).json({ error: "Invalid expense_type. Must be 'direct' or 'operating'." });
    }

    try {
        // Verify active open session for today (explicitly check status to block closed/locked days)
        const sessionRes = await pool.query(
            'SELECT id, status FROM daily_sessions WHERE business_id = $1 AND session_date = $2',
            [business_id, session_date]
        );

        if (sessionRes.rows.length === 0) {
            return res.status(400).json({ error: "You must open the business day before recording expenses." });
        }

        const session = sessionRes.rows[0];
        if (session.status !== 'open') {
            return res.status(400).json({ error: "Action denied. Today's business day has been closed and locked." });
        }

        const session_id = session.id;

        const result = await pool.query(
            'INSERT INTO expenses (business_id, session_id, amount, category, expense_type, description) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [business_id, session_id, amount, category, expense_type, description]
        );

        res.status(201).json({ message: "Expense recorded successfully", expense: result.rows[0] });
    } catch (err) {
        console.error("Add expense error:", err);
        res.status(500).json({ error: "Internal server error." });
    }
};

// Get Business Dashboard & Reports Summary
export const getBusinessDashboard = async (req, res) => {
    const business_id = req.user.business_id;
    const session_date = new Date().toISOString().split('T')[0];

    try {
        // 1. Get today's active or closed session
        const sessionRes = await pool.query(
            'SELECT * FROM daily_sessions WHERE business_id = $1 AND session_date = $2',
            [business_id, session_date]
        );

        const currentSession = sessionRes.rows[0] || null;
        let session_id = currentSession ? currentSession.id : null;

        let totalIncome = 0;
        let totalDirectExp = 0;
        let totalOperatingExp = 0;

        if (session_id) {
            const incomeRes = await pool.query('SELECT SUM(amount) AS total FROM incomes WHERE session_id = $1', [session_id]);
            const directRes = await pool.query('SELECT SUM(amount) AS total FROM expenses WHERE session_id = $1 AND expense_type = $2', [session_id, 'direct']);
            const operatingRes = await pool.query('SELECT SUM(amount) AS total FROM expenses WHERE session_id = $1 AND expense_type = $2', [session_id, 'operating']);

            totalIncome = parseFloat(incomeRes.rows[0].total || 0);
            totalDirectExp = parseFloat(directRes.rows[0].total || 0);
            totalOperatingExp = parseFloat(operatingRes.rows[0].total || 0);
        }

        const grossProfit = totalIncome - totalDirectExp;
        const netProfit = grossProfit - totalOperatingExp;

        res.json({
            sessionStatus: currentSession ? currentSession.status : 'not_opened',
            todayMetrics: {
                totalIncome,
                totalDirectExp,
                totalOperatingExp,
                grossProfit,
                netProfit
            }
        });
    } catch (err) {
        console.error("Dashboard error:", err);
        res.status(500).json({ error: "Internal server error." });
    }
};

// Get Business Settings
export const getSettings = async (req, res) => {
    const business_id = req.user.business_id;
    try {
        const result = await pool.query(`
            SELECT b.id, b.name, b.logo_url, u.username 
            FROM businesses b
            JOIN users u ON b.id = u.business_id
            WHERE b.id = $1
        `, [business_id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Business not found." });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error("Get settings error:", err);
        res.status(500).json({ error: "Internal server error." });
    }
};

// Update Business Settings (Name, Profile Photo, Password)
export const updateSettings = async (req, res) => {
    const business_id = req.user.business_id;
    const user_id = req.user.id;
    const { name, currentPassword, newPassword } = req.body;
    const logo_url = req.file ? `/uploads/${req.file.filename}` : undefined;

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Update Business Name and/or Logo if provided
        if (name || logo_url) {
            let query = 'UPDATE businesses SET';
            let values = [];
            let idx = 1;

            if (name) {
                query += ` name = $${idx++}`;
                values.push(name);
            }
            if (logo_url) {
                if (name) query += ',';
                query += ` logo_url = $${idx++}`;
                values.push(logo_url);
            }
            query += ` WHERE id = $${idx}`;
            values.push(business_id);

            await client.query(query, values);
        }

        // 2. Handle Password Change if requested
        if (newPassword) {
            if (!currentPassword) {
                await client.query('ROLLBACK');
                return res.status(400).json({ error: "Current password is required to set a new password." });
            }

            const userRes = await client.query('SELECT password_hash FROM users WHERE id = $1', [user_id]);
            const user = userRes.rows[0];

            const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
            if (!isMatch) {
                await client.query('ROLLBACK');
                return res.status(401).json({ error: "Incorrect current password." });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);

            await client.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hashedPassword, user_id]);
        }

        await client.query('COMMIT');
        res.json({ message: "Settings updated successfully." });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Update settings error:", err);
        res.status(500).json({ error: "Internal server error." });
    } finally {
        client.release();
    }
};

// Get all transactions (combined incomes and expenses) for the business
export const getTransactions = async (req, res) => {
    const business_id = req.user.business_id;

    try {
        const incomes = await pool.query(
            `SELECT id, amount, source, description, created_at, 'income' AS type 
            FROM incomes WHERE business_id = $1 ORDER BY created_at DESC`,
            [business_id]
        );

        const expenses = await pool.query(
            `SELECT id, amount, category, description, created_at, expense_type AS type 
            FROM expenses WHERE business_id = $1 ORDER BY created_at DESC`,
            [business_id]
        );

        const transactions = [...incomes.rows, ...expenses.rows].sort(
            (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );

        res.json({ transactions });
    } catch (err) {
        console.error("Get transactions error:", err);
        res.status(500).json({ error: "Internal server error." });
    }
};

// Delete Income Entry (Blocked if session is locked/closed)
export const deleteIncome = async (req, res) => {
    const business_id = req.user.business_id;
    const { id } = req.params;

    try {
        const incomeRes = await pool.query(
            'SELECT session_id FROM incomes WHERE id = $1 AND business_id = $2',
            [id, business_id]
        );

        if (incomeRes.rows.length === 0) {
            return res.status(404).json({ error: "Income transaction not found." });
        }

        const session_id = incomeRes.rows[0].session_id;
        const sessionRes = await pool.query('SELECT status FROM daily_sessions WHERE id = $1', [session_id]);

        if (sessionRes.rows[0]?.status !== 'open') {
            return res.status(400).json({ error: "Action denied. The business day session is closed and locked." });
        }

        await pool.query('DELETE FROM incomes WHERE id = $1', [id]);
        res.json({ message: "Income deleted successfully." });
    } catch (err) {
        console.error("Delete income error:", err);
        res.status(500).json({ error: "Internal server error." });
    }
};

// Delete Expense Entry (Blocked if session is locked/closed)
export const deleteExpense = async (req, res) => {
    const business_id = req.user.business_id;
    const { id } = req.params;

    try {
        const expenseRes = await pool.query(
            'SELECT session_id FROM expenses WHERE id = $1 AND business_id = $2',
            [id, business_id]
        );

        if (expenseRes.rows.length === 0) {
            return res.status(404).json({ error: "Expense transaction not found." });
        }

        const session_id = expenseRes.rows[0].session_id;
        const sessionRes = await pool.query('SELECT status FROM daily_sessions WHERE id = $1', [session_id]);

        if (sessionRes.rows[0]?.status !== 'open') {
            return res.status(400).json({ error: "Action denied. The business day session is closed and locked." });
        }

        await pool.query('DELETE FROM expenses WHERE id = $1', [id]);
        res.json({ message: "Expense deleted successfully." });
    } catch (err) {
        console.error("Delete expense error:", err);
        res.status(500).json({ error: "Internal server error." });
    }
};