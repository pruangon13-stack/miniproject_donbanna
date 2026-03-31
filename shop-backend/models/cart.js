const pool = require('../db_pool');

module.exports = {
    getCart: async (u_id) => {
        const query = "SELECT c.c_id, c.p_id, p.p_name, p.p_price, p.p_image, c.quantity FROM cart c JOIN product p ON c.p_id = p.p_id WHERE c.u_id = ?";
        try {
            const [results] = await pool.execute(query, [u_id]);
            return { isError: false, result: true, data: results };
        } catch (err) {
            return { isError: true, result: false, errorMessage: err.message };
        }
    },
    addToCart: async (u_id, p_id, quantity) => {
        const checkQuery = "SELECT * FROM cart WHERE u_id = ? AND p_id = ?";
        try {
            const [results] = await pool.execute(checkQuery, [u_id, p_id]);
            if (results.length > 0) {
                const updateQuery = "UPDATE cart SET quantity = quantity + ? WHERE u_id = ? AND p_id = ?";
                await pool.execute(updateQuery, [quantity, u_id, p_id]);
            } else {
                const insertQuery = "INSERT INTO cart (u_id, p_id, quantity) VALUES (?, ?, ?)";
                await pool.execute(insertQuery, [u_id, p_id, quantity]);
            }
            return { isError: false, result: true };
        } catch (err) {
            return { isError: true, result: false, errorMessage: err.message };
        }
    },
    removeFromCart: async (c_id) => {
        const query = "DELETE FROM cart WHERE c_id = ?";
        try {
            await pool.execute(query, [c_id]);
            return { isError: false, result: true };
        } catch (err) {
            return { isError: true, result: false, errorMessage: err.message };
        }
    },
    clearCart: async (u_id) => {
        const query = "DELETE FROM cart WHERE u_id = ?";
        try {
            await pool.execute(query, [u_id]);
            return { isError: false, result: true };
        } catch (err) {
            return { isError: true, result: false, errorMessage: err.message };
        }
    },
    updateQuantity: async (c_id, quantity) => {
        const query = "UPDATE cart SET quantity = ? WHERE c_id = ?";
        try {
            await pool.execute(query, [quantity, c_id]);
            return { isError: false, result: true };
        } catch (err) {
            return { isError: true, result: false, errorMessage: err.message };
        }
    }
};
