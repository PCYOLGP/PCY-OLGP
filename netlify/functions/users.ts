import { Handler } from '@netlify/functions';
import { sql } from './lib/db';

export const handler: Handler = async (event) => {
    const method = event.httpMethod;
    const path = event.path.replace('/.netlify/functions/users', '').replace('/api/users', '');
    const segments = path.split('/').filter(Boolean);

    try {
        if (method === 'GET') {
            const username = event.queryStringParameters?.username;
            if (username) {
                const users = await sql`
                    SELECT id, username, email, image, fname, lname, bio
                    FROM users WHERE username = ${username}
                `;
                return { statusCode: 200, body: JSON.stringify(users) };
            } else {
                const users = await sql`
                    SELECT id, username, email, image, fname, lname, bio
                    FROM users ORDER BY id ASC
                `;
                return { statusCode: 200, body: JSON.stringify(users) };
            }
        }

        if (method === 'POST') {
            const { username, password, email, fname, lname, bio } = JSON.parse(event.body || '{}');
            const result = await sql`
                INSERT INTO users (username, password, email, fname, lname, bio)
                VALUES (${username}, crypt(${password}, gen_salt('bf')), ${email || ''}, ${fname || ''}, ${lname || ''}, ${bio || ''})
                RETURNING id, username, email, image, fname, lname, bio
            `;
            return { statusCode: 201, body: JSON.stringify(result[0]) };
        }

        if (method === 'PATCH' && segments.length === 1) {
            const id = segments[0];
            const { username, bio, password, image } = JSON.parse(event.body || '{}');

            let result;
            if (password) {
                result = await sql`
          UPDATE users
          SET username = ${username}, bio = ${bio}, password = crypt(${password}, gen_salt('bf')), image = ${image}
          WHERE id = ${id}
          RETURNING id, username, email, image, fname, lname, bio
        `;
            } else {
                result = await sql`
          UPDATE users
          SET username = ${username}, bio = ${bio}, image = ${image}
          WHERE id = ${id}
          RETURNING id, username, email, image, fname, lname, bio
        `;
            }
            return { statusCode: 200, body: JSON.stringify(result[0]) };
        }

        return { statusCode: 405, body: 'Method Not Allowed' };
    } catch (err: any) {
        return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
    }
};
