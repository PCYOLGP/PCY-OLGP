import { Handler } from '@netlify/functions';
import { sql } from './lib/db';

export const handler: Handler = async (event) => {
    try {
        // Test connection
        const now = await sql`SELECT NOW()`;

        // List tables
        const tables = await sql`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `;

        // Check extensions
        const extensions = await sql`
            SELECT extname FROM pg_extension
        `;

        // Check users count
        const usersCount = await sql`SELECT COUNT(*) FROM users`;

        return {
            statusCode: 200,
            body: JSON.stringify({
                status: 'success',
                time: now,
                tables: tables.map(t => t.table_name),
                extensions: extensions.map(e => e.extname),
                usersCount: usersCount[0].count
            })
        };
    } catch (err: any) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                status: 'error',
                message: err.message,
                stack: err.stack
            })
        };
    }
};
