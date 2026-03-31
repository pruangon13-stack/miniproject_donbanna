const pool = require('./db_pool');

async function debugDb() {
    try {
        console.log("Checking tables...");
        const [tables] = await pool.query("SHOW TABLES");
        console.table(tables);

        for (const row of tables) {
            const tableName = Object.values(row)[0];
            console.log(`\n--- Structure of ${tableName} ---`);
            const [structure] = await pool.query(`DESCRIBE ${tableName}`);
            console.table(structure);
        }

        console.log("\nChecking users...");
        const [users] = await pool.query("SELECT u_id, username, role FROM users");
        console.table(users);

    } catch (err) {
        console.error("DEBUG ERROR:", err.message);
    } finally {
        process.exit();
    }
}

debugDb();
