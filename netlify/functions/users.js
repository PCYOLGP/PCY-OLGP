const { Client } = require('pg');

exports.handler = async (event, context) => {
    const method = event.httpMethod;
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();

        if (method === 'GET') {
            const username = event.queryStringParameters.username;
            if (username) {
                const result = await client.query('SELECT id, username, email, image, fname, lname, bio FROM users WHERE username = $1', [username]);
                return { statusCode: 200, body: JSON.stringify(result.rows) };
            }
        }

        if (method === 'PATCH') {
            const path = event.path.split('/').filter(Boolean);
            const id = path[path.length - 1];
            const { username, bio, password } = JSON.parse(event.body);

            let query = 'UPDATE users SET username = $1, bio = $2';
            let params = [username, bio, id];

            if (password) {
                query += ', password = $4 WHERE id = $3 RETURNING id, username, email, image, fname, lname, bio';
                params.push(password);
            } else {
                query += ' WHERE id = $3 RETURNING id, username, email, image, fname, lname, bio';
            }

            const result = await client.query(query, params);
            return { statusCode: 200, body: JSON.stringify(result.rows[0]) };
        }

        return { statusCode: 405, body: 'Method Not Allowed' };
    } catch (err) {
        return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
    } finally {
        await client.end();
    }
};
