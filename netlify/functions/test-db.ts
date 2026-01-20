import { Handler } from '@netlify/functions';
import { sql } from './lib/db';

export const handler: Handler = async (event) => {
    try {
        const result = await sql`SELECT version()`;
        const { version } = result[0];

        return {
            statusCode: 200,
            body: JSON.stringify({ version }),
            headers: {
                'Content-Type': 'application/json'
            }
        };
    } catch (error: any) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
            headers: {
                'Content-Type': 'application/json'
            }
        };
    }
};
