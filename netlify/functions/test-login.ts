import { Handler } from '@netlify/functions';
import { sql } from './lib/db';

export const handler: Handler = async (event) => {
    const username = 'user';
    const password = 'user123';

    try {
        // 1. Check if user exists
        const userExists = await sql`SELECT username, password FROM users WHERE username = ${username}`;

        if (userExists.length === 0) {
            return { statusCode: 200, body: JSON.stringify({ error: 'User does not exist in DB' }) };
        }

        const storedHash = userExists[0].password;

        // 2. Check crypt match
        const match = await sql`SELECT (password = crypt(${password}, password)) as is_match FROM users WHERE username = ${username}`;

        return {
            statusCode: 200,
            body: JSON.stringify({
                username,
                storedHashPrefix: storedHash.substring(0, 10),
                isMatch: match[0].is_match,
                rawMatchResult: match[0]
            })
        };
    } catch (err: any) {
        return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
    }
};
