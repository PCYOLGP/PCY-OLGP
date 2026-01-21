import { Handler } from '@netlify/functions';
import { sql } from './lib/db';

export const handler: Handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: 'Method Not Allowed',
        };
    }

    try {
        const { username, password } = JSON.parse(event.body || '{}');

        const users = await sql`
      SELECT id, username, email, image, fname, lname, bio
      FROM users
      WHERE username = ${username} AND password = crypt(${password}, password)
    `;

        if (users.length > 0) {
            return {
                statusCode: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(users[0]),
            };
        } else {
            return {
                statusCode: 401,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Invalid username or password' }),
            };
        }
    } catch (err: any) {
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Internal Server Error', details: err.message }),
        };
    }
};
