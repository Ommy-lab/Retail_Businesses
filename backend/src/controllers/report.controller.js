import pool from '../config/database.js';

export const getFilteredReports = async (req, res) => {
    const business_id = req.user.business_id;
    const { filter = 'daily', startDate, endDate } = req.query;

    try {
        let dateCondition = "";
        let queryParams = [business_id];

        // Custom or preset filters
        if (startDate && endDate) {
            dateCondition = "AND ds.session_date BETWEEN $2 AND $3";
            queryParams.push(startDate, endDate);
        } else if (filter === 'weekly') {
            dateCondition = "AND ds.session_date >= CURRENT_DATE - INTERVAL '7 days'";
        } else if (filter === 'monthly') {
            dateCondition = "AND ds.session_date >= CURRENT_DATE - INTERVAL '30 days'";
        } else {
            // Default to today/daily
            dateCondition = "AND ds.session_date = CURRENT_DATE";
        }

        const reportQuery = `
    SELECT 
        ds.id AS session_id,
        ds.session_date,
        ds.status,

        COALESCE(i.total_income, 0) AS total_income,
        COALESCE(e.total_direct_exp, 0) AS total_direct_exp,
        COALESCE(e.total_operating_exp, 0) AS total_operating_exp

    FROM daily_sessions ds

    -- Aggregate all income transactions for each session separately
    LEFT JOIN (
        SELECT
            session_id,
            SUM(amount) AS total_income
        FROM incomes
        GROUP BY session_id
    ) i ON ds.id = i.session_id

    -- Aggregate all expenses for each session separately
    LEFT JOIN (
        SELECT
            session_id,
            SUM(CASE
                WHEN expense_type = 'direct' THEN amount
                ELSE 0
            END) AS total_direct_exp,

            SUM(CASE
                WHEN expense_type = 'operating' THEN amount
                ELSE 0
            END) AS total_operating_exp

        FROM expenses
        GROUP BY session_id
    ) e ON ds.id = e.session_id

    WHERE ds.business_id = $1 ${dateCondition}

    ORDER BY ds.session_date DESC;
`;

        const result = await pool.query(reportQuery, queryParams);

        // Calculate calculated metrics for each row
        const formattedReport = result.rows.map(row => {
            const income = parseFloat(row.total_income);
            const direct = parseFloat(row.total_direct_exp);
            const operating = parseFloat(row.total_operating_exp);
            const gross = income - direct;
            const net = gross - operating;

            return {
                session_id: row.session_id,
                date: row.session_date,
                status: row.status,
                totalIncome: income,
                totalDirectExp: direct,
                totalOperatingExp: operating,
                grossProfit: gross,
                netProfit: net
            };
        });

        res.json({ filter, report: formattedReport });
    } catch (err) {
        console.error("Report filtering error:", err);
        res.status(500).json({ error: "Internal server error." });
    }
};