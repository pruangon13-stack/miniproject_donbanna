const pool = require('../db_pool');

module.exports = {
    login: async (username, password) => {
        const query = "SELECT u_id, f_name, l_name, username, role FROM users WHERE username = ? AND password = MD5(?)";
        try {
            const [results] = await pool.execute(query, [username, password]);
            if (results.length > 0) {
                return { isError: false, result: true, data: results[0] };
            }
            return { isError: false, result: false, errorMessage: "Invalid username or password" };
        } catch (err) {
            return { isError: true, result: false, errorMessage: err.message };
        }
    },
    register: async (f_name, l_name, username, password, role = 'member') => {
        const query = "INSERT INTO users (f_name, l_name, username, password, role) VALUES (?, ?, ?, MD5(?), ?)";
        try {
            const [results] = await pool.execute(query, [f_name, l_name, username, password, role]);
            return { isError: false, result: true, data: results.insertId };
        } catch (err) {
            return { isError: true, result: false, errorMessage: err.message };
        }
    },
    getAllUsers: async () => {
        const query = `
            SELECT u.u_id, u.f_name, u.l_name, u.username, u.role, 
            COALESCE(SUM(h.quantity * h.price_buy), 0) as total_spent 
            FROM users u 
            LEFT JOIN history h ON u.u_id = h.u_id 
            GROUP BY u.u_id
        `;
        try {
            const [results] = await pool.execute(query);
            return { isError: false, result: true, data: results };
        } catch (err) {
            return { isError: true, result: false, errorMessage: err.message };
        }
    },
    deleteUser: async (u_id) => {
        const query = "DELETE FROM users WHERE u_id = ?";
        try {
            await pool.execute(query, [u_id]);
            return { isError: false, result: true };
        } catch (err) {
            return { isError: true, result: false, errorMessage: err.message };
        }
    }
};
