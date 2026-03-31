const pool = require('./db_pool');

async function fixTable() {
    try {
        console.log("Checking if p_image column exists...");
        const [columns] = await pool.query("SHOW COLUMNS FROM product LIKE 'p_image'");
        
        if (columns.length === 0) {
            console.log("Adding p_image column to product table...");
            await pool.query("ALTER TABLE product ADD COLUMN p_image VARCHAR(255) DEFAULT NULL");
            console.log("Column p_image added successfully!");
        } else {
            console.log("Column p_image already exists.");
        }
    } catch (err) {
        console.error("Error fixing table:", err.message);
    } finally {
        process.exit();
    }
}

fixTable();
