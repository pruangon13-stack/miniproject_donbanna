const pool = require('../db_pool');

module.exports = {
    getHistory: async (u_id) => {
        const query = "SELECT h.h_id, h.p_id, p.p_name, p.p_image, h.quantity, h.price_buy, h.date FROM history h JOIN product p ON h.p_id = p.p_id WHERE h.u_id = ? ORDER BY h.date DESC";
        try {
            const [results] = await pool.execute(query, [u_id]);
            return { isError: false, result: true, data: results };
        } catch (err) {
            return { isError: true, result: false, errorMessage: err.message };
        }
    },
    addHistory: async (u_id, p_id, quantity, price_buy) => {
        const query = "INSERT INTO history (u_id, p_id, quantity, price_buy, date) VALUES (?, ?, ?, ?, NOW())";
        try {
            await pool.execute(query, [u_id, p_id, quantity, price_buy]);
            return { isError: false, result: true };
        } catch (err) {
            return { isError: true, result: false, errorMessage: err.message };
        }
    }
};
