
const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env.development') });
const url = "postgres://dtag:h3Q0NxwR6DGLLc31g88MEuvwlOM1aY788wyq0gxYduIrWXQ8zAR0VpnoATry3qDu@178.104.88.58:5432/dtag_dev";

async function test() {
    console.log('Connecting to:', url);
    const client = new Client({
        connectionString: url,
        connectionTimeoutMillis: 10000,
    });
    try {
        await client.connect();
        console.log('Connected!');
        const tables = ['OdRegion', 'Location', 'Team', 'User', 'Product', 'SalesArgument', 'PriceHistory', 'SpecialPrice', 'Addon', 'SystemSetting', 'SalesSession'];
        for (const table of tables) {
            try {
                // Use quotes for tables that might be case sensitive or reserved
                const res = await client.query(`SELECT column_name FROM information_schema.columns WHERE table_name = '${table}' OR table_name = '${table.toLowerCase()}'`);
                console.log(`Columns in ${table}:`, res.rows.map(r => r.column_name));
            } catch (e) {
                console.log(`Error reading ${table}:`, e.message);
            }
        }
    } catch (err) {
        console.error('Connection failed:', err.message);
    } finally {
        await client.end();
    }
}

test();
