const pool = require('../db_pool');

module.exports = {
    //ดึงข้อมูลสินค้าทัั้งหมด (Read)
    getAll: async () => {
        const query = "SELECT p_id, p_name, p_price, p_stock, p_image FROM product";
        try {
            const [results] = await pool.execute(query);//รันsql
            return { isError: false, result: true, data: results };
        } catch (err) {
            return { isError: true, result: false, errorMessage: err.message };
        }
    },
    //ดึงข้อมูลสินค้าตามไอดี
    getById: async (id) => {
        const query = "SELECT * FROM product WHERE p_id = ?";
        try {
            const [results] = await pool.execute(query, [id]);
            if (results.length > 0) {
                return { isError: false, result: true, data: results[0] };
            }
            return { isError: false, result: false, errorMessage: "Product not found" };
        } catch (err) {
            return { isError: true, result: false, errorMessage: err.message };
        }
    },
    //เพิ่มสินค้า
    add: async (name, price, stock, image = null) => {
        const query = "INSERT INTO product (p_name, p_price, p_stock, p_image) VALUES (?, ?, ?, ?)";
        try {
            const [results] = await pool.execute(query, [name, price, stock, image]);
            return { isError: false, result: true, data: results.insertId };
        } catch (err) {
            return { isError: true, result: false, errorMessage: err.message };
        }
    },
    //เเก้ไขสินค้า
    update: async (id, name, price, stock, image = null) => {
        let query = "UPDATE product SET p_name = ?, p_price = ?, p_stock = ? WHERE p_id = ?";
        let params = [name, price, stock, id];
        
        //ดูว่ามีการอัพรูปมาใหม่หรือไม่
        if (image) {
            query = "UPDATE product SET p_name = ?, p_price = ?, p_stock = ?, p_image = ? WHERE p_id = ?";
            params = [name, price, stock, image, id];
        }

        try {
            await pool.execute(query, params);
            return { isError: false, result: true };
        } catch (err) {
            return { isError: true, result: false, errorMessage: err.message };
        }
    },
    delete: async (id) => {
        const query = "DELETE FROM product WHERE p_id = ?";
        try {
            await pool.execute(query, [id]);
            return { isError: false, result: true };
        } catch (err) {
            return { isError: true, result: false, errorMessage: err.message };
        }
    }
};
