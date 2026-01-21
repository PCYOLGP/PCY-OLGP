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
        if (!event.body) {
            return {
                statusCode: 400,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Request body is missing' }),
            };
        }

        const { username, password } = JSON.parse(event.body);

        if (!username || !password) {
            return {
                statusCode: 400,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Username and password are required' }),
            };
        }

        // Use a more robust query
        const users = await sql`
            SELECT id, username, email, image, fname, lname, bio, password as hashed_password
            FROM users
            WHERE LOWER(username) = LOWER(${username.trim()})
        `;

        if (users && users.length > 0) {
            const user = users[0];
            // Verify password using crypt
            const match = await sql`
                SELECT (hashed_password = crypt(${password}, hashed_password)) as is_match 
                FROM (SELECT ${user.hashed_password} as hashed_password) t
            `;

            if (match[0].is_match) {
                // Remove password from response
                const { hashed_password, ...userWithoutPassword } = user;
                return {
                    statusCode: 200,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(userWithoutPassword),
                };
            }
        }

        return {
            statusCode: 401,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Invalid username or password' }),
        };

    } catch (err: any) {
        console.error('Login error:', err);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Internal Server Error', details: err.message }),
        };
    }
};
