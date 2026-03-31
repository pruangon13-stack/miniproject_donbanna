const pool = require('./db_pool');

async function checkTable() {
    try {
        const [results] = await pool.query("DESCRIBE product");
        console.log("Table structure:");
        console.table(results);
    } catch (err) {
        console.error("Error describing table:", err.message);
    } finally {
        process.exit();
    }
}

checkTable();
