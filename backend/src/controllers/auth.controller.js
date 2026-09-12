import pool from '../config/database.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required." });
    }

    try {
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        
        if (result.rows.length === 0) {
            return res.status(401).json({ error: "Invalid username or password." });
        }

        const user = result.rows[0];

        // Check if user belongs to a business and if that business is suspended or archived
        if (user.business_id) {
            const bizRes = await pool.query('SELECT is_active, is_archived FROM businesses WHERE id = $1', [user.business_id]);
            if (bizRes.rows.length > 0) {
                if (bizRes.rows[0].is_archived) {
                    return res.status(403).json({ error: "This business account has been archived." });
                }
                if (bizRes.rows[0].is_active === false) {
                    return res.status(403).json({ error: "This business account has been suspended. Please contact support." });
                }
            }
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ error: "Invalid username or password." });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role, business_id: user.business_id },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
                business_id: user.business_id
            }
        });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ error: "Internal server error." });
    }
};