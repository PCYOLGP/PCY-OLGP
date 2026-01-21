import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initDb() {
    const sql = neon(process.env.DATABASE_URL);
    const sqlFile = path.join(__dirname, 'db_setup.sql');
    const commands = fs.readFileSync(sqlFile, 'utf8');

    console.log('Initializing database...');
    try {
        // Neon client can handle multiple statements if they are separated by semicolons
        // but some clients prefer one at a time or use a specific method.
        // For simplicity, we'll try to run the whole block.
        await sql(commands);
        console.log('Database initialized successfully!');
    } catch (error) {
        console.error('Error initializing database:', error);
        process.exit(1);
    }
}

initDb();
