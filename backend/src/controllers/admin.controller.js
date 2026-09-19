import pool from '../config/database.js';
import bcrypt from 'bcryptjs';

import { logAction } from '../utils/logger.js';

export const createBusiness = async (req, res) => {
    const { name, username, password } = req.body;

    if (!name || !username || !password) {
        return res.status(400).json({ error: "Business name, username, and password are required." });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Insert business
        const businessResult = await client.query(
            'INSERT INTO businesses (name) VALUES ($1) RETURNING id, name, created_at',
            [name]
        );
        const newBusiness = businessResult.rows[0];

        // 2. Hash password and create business user
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const userResult = await client.query(
            'INSERT INTO users (business_id, username, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, username, role',
            [newBusiness.id, username, passwordHash, 'business_user']
        );

        await client.query('COMMIT');

        res.status(201).json({
            message: "Business created successfully",
            business: newBusiness,
            user: userResult.rows[0]
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Create business error:", err);
        if (err.code === '23505') {
            return res.status(400).json({ error: "Username already exists." });
        }
        res.status(500).json({ error: "Internal server error." });
    } finally {
        client.release();
    }
};

export const getAllBusinesses = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT b.id, b.name, b.created_at, 
                COALESCE(b.is_active, TRUE) AS is_active, 
                COALESCE(b.is_archived, FALSE) AS is_archived, 
                u.username 
            FROM businesses b
            LEFT JOIN users u ON b.id = u.business_id AND u.role = 'business_user'
            ORDER BY b.created_at DESC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error("Get businesses error:", err);
        res.status(500).json({ error: "Internal server error." });
    }
};

// Super Admin Global Dashboard
export const getAdminDashboard = async (req, res) => {
    try {
        const businessCountRes = await pool.query('SELECT COUNT(*) AS total_businesses FROM businesses');
        const businessesRes = await pool.query(`
            SELECT b.id, b.name, b.created_at, 
                COALESCE(b.is_active, TRUE) AS is_active, 
                COALESCE(b.is_archived, FALSE) AS is_archived, 
                u.username,
                (SELECT COUNT(*) FROM daily_sessions ds WHERE ds.business_id = b.id) as total_sessions
            FROM businesses b
            LEFT JOIN users u ON b.id = u.business_id AND u.role = 'business_user'
            ORDER BY b.created_at DESC
        `);

        res.json({
            totalBusinesses: parseInt(businessCountRes.rows[0].total_businesses),
            businesses: businessesRes.rows
        });
    } catch (err) {
        console.error("Admin dashboard error:", err);
        res.status(500).json({ error: "Internal server error." });
    }
};

// Super Admin Read-Only View of a Specific Business's Activity & Reports (Lifetime Incomes, Expenses & Sessions)
export const getBusinessReportsAsAdmin = async (req, res) => {
    const { businessId } = req.params;
    try {
        const businessRes = await pool.query('SELECT * FROM businesses WHERE id = $1', [businessId]);
        if (businessRes.rows.length === 0) {
            return res.status(404).json({ error: "Business not found." });
        }

        // Lifetime total income from registration date to current day
        const incomeRes = await pool.query(
            'SELECT COALESCE(SUM(amount), 0) AS total_income, COUNT(id) AS income_count FROM incomes WHERE business_id = $1',
            [businessId]
        );

        // Lifetime total expenses from registration date to current day
        const expenseRes = await pool.query(
            `SELECT 
                COALESCE(SUM(amount), 0) AS total_expenses,
                COALESCE(SUM(CASE WHEN expense_type = 'direct' THEN amount ELSE 0 END), 0) AS direct_expenses,
                COALESCE(SUM(CASE WHEN expense_type = 'operating' THEN amount ELSE 0 END), 0) AS operating_expenses,
                COUNT(id) AS expense_count
             FROM expenses 
             WHERE business_id = $1`,
            [businessId]
        );

        const totalIncome = parseFloat(incomeRes.rows[0].total_income || 0);
        const totalExpenses = parseFloat(expenseRes.rows[0].total_expenses || 0);
        const netProfit = totalIncome - totalExpenses;

        // Daily sessions with individual session income & expense breakdowns
        const sessionsRes = await pool.query(`
            SELECT 
                ds.id, 
                ds.session_date, 
                ds.status, 
                ds.opened_at, 
                ds.closed_at,
                COALESCE(i.session_income, 0) AS session_income,
                COALESCE(e.session_expenses, 0) AS session_expenses,
                (COALESCE(i.session_income, 0) - COALESCE(e.session_expenses, 0)) AS session_net
            FROM daily_sessions ds
            LEFT JOIN (
                SELECT session_id, SUM(amount) AS session_income
                FROM incomes
                WHERE business_id = $1
                GROUP BY session_id
            ) i ON ds.id = i.session_id
            LEFT JOIN (
                SELECT session_id, SUM(amount) AS session_expenses
                FROM expenses
                WHERE business_id = $1
                GROUP BY session_id
            ) e ON ds.id = e.session_id
            WHERE ds.business_id = $1
            ORDER BY ds.session_date DESC
        `, [businessId]);

        res.json({
            business: businessRes.rows[0],
            totals: {
                total_income: totalIncome,
                total_expenses: totalExpenses,
                direct_expenses: parseFloat(expenseRes.rows[0].direct_expenses || 0),
                operating_expenses: parseFloat(expenseRes.rows[0].operating_expenses || 0),
                net_profit: netProfit,
                income_count: parseInt(incomeRes.rows[0].income_count || 0),
                expense_count: parseInt(expenseRes.rows[0].expense_count || 0),
            },
            sessions: sessionsRes.rows
        });
    } catch (err) {
        console.error("Admin view business report error:", err);
        res.status(500).json({ error: "Internal server error." });
    }
};

export const toggleBusinessStatus = async (req, res) => {
    const { businessId } = req.params;
    const { is_active } = req.body; // boolean: true or false

    try {
        const result = await pool.query(
            'UPDATE businesses SET is_active = $1 WHERE id = $2 RETURNING *',
            [is_active, businessId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Business not found." });
        }

        const actionText = is_active ? "Activated business account" : "Suspended business account";
        await logAction(businessId, req.user.id, actionText, `Super Admin updated status to ${is_active}`);

        res.json({ message: `Business ${is_active ? 'activated' : 'suspended'} successfully`, business: result.rows[0] });
    } catch (err) {
        console.error("Toggle business status error:", err);
        res.status(500).json({ error: "Internal server error." });
    }
};

export const archiveBusiness = async (req, res) => {
    const { businessId } = req.params;

    try {
        const result = await pool.query(
            'UPDATE businesses SET is_archived = TRUE, is_active = FALSE WHERE id = $1 RETURNING *',
            [businessId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Business not found." });
        }

        await logAction(businessId, req.user.id, "Archived business", `Super Admin safely archived business ID ${businessId}`);

        res.json({ 
            message: "Business archived successfully. Financial history remains securely stored.", 
            business: result.rows[0] 
        });
    } catch (err) {
        console.error("Archive business error:", err);
        res.status(500).json({ error: "Internal server error." });
    }
};

export const unarchiveBusiness = async (req, res) => {
    const { businessId } = req.params;

    try {
        const result = await pool.query(
            'UPDATE businesses SET is_archived = FALSE, is_active = TRUE WHERE id = $1 RETURNING *',
            [businessId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Business not found." });
        }

        await logAction(businessId, req.user.id, "Unarchived business", `Super Admin safely restored business ID ${businessId}`);

        res.json({ 
            message: "Business unarchived successfully. Account restored.", 
            business: result.rows[0] 
        });
    } catch (err) {
        console.error("Unarchive business error:", err);
        res.status(500).json({ error: "Internal server error." });
    }
};