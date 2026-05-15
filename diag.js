
const { Client } = require('pg');
const url = "postgres://postgres:yAPgc5SO7ph3M8M0byLYFQUivWo31m8jWu1zv3W4GDAsmjxXL5uAvI8ApYgtxR3V@178.104.100.186:5432/dtag_dev";

async function test() {
    const client = new Client({ connectionString: url });
    try {
        await client.connect();
        const res = await client.query("SELECT * FROM \"SystemSetting\" LIMIT 1");
        console.log("SystemSetting row keys:", Object.keys(res.rows[0] || {}));

        const res2 = await client.query("SELECT * FROM \"Location\" LIMIT 1");
        console.log("Location row keys:", Object.keys(res2.rows[0] || {}));
    } catch (err) {
        console.error("Error:", err.message);
    } finally {
        await client.end();
    }
}
test();
