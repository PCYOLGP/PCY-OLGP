const { Client } = require('pg');

exports.handler = async (event, context) => {
    const method = event.httpMethod;
    const path = event.path.replace('/api/posts', '').replace('/.netlify/functions/posts', '');
    const segments = path.split('/').filter(Boolean);
    const id = segments[0];

    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();

        if (method === 'GET') {
            if (segments.length === 2 && segments[1] === 'comments') {
                // GET /api/posts/:postId/comments
                const result = await client.query('SELECT * FROM comments WHERE post_id = $1 ORDER BY timestamp ASC', [segments[0]]);
                return { statusCode: 200, body: JSON.stringify(result.rows) };
            } else if (id) {
                // GET /api/posts/:id
                const result = await client.query('SELECT * FROM posts WHERE id = $1', [id]);
                return { statusCode: 200, body: JSON.stringify(result.rows[0] || {}) };
            } else {
                // GET /api/posts
                const result = await client.query('SELECT * FROM posts ORDER BY timestamp DESC');
                return { statusCode: 200, body: JSON.stringify(result.rows) };
            }
        }

        if (method === 'POST') {
            if (segments.length === 2 && segments[1] === 'comments') {
                // POST /api/posts/:postId/comments
                const { username, comment } = JSON.parse(event.body);
                const result = await client.query(
                    'INSERT INTO comments (post_id, username, comment, timestamp) VALUES ($1, $2, $3, NOW()) RETURNING *',
                    [segments[0], username, comment]
                );
                return { statusCode: 201, body: JSON.stringify(result.rows[0]) };
            } else if (segments.length === 2 && segments[1] === 'toggle-like') {
                // POST /api/posts/:postId/toggle-like
                const { userId } = JSON.parse(event.body);
                const postId = segments[0];

                // Check if liked
                const check = await client.query('SELECT * FROM likes WHERE post_id = $1 AND user_id = $2', [postId, userId]);
                if (check.rows.length > 0) {
                    await client.query('DELETE FROM likes WHERE post_id = $1 AND user_id = $2', [postId, userId]);
                    return { statusCode: 200, body: JSON.stringify({ success: true, liked: false }) };
                } else {
                    await client.query('INSERT INTO likes (post_id, user_id, timestamp) VALUES ($1, $2, NOW())', [postId, userId]);
                    return { statusCode: 200, body: JSON.stringify({ success: true, liked: true }) };
                }
            } else {
                // POST /api/posts
                const { username, caption, image } = JSON.parse(event.body);
                const result = await client.query(
                    'INSERT INTO posts (username, caption, image, timestamp) VALUES ($1, $2, $3, NOW()) RETURNING *',
                    [username, caption, image]
                );
                return { statusCode: 201, body: JSON.stringify(result.rows[0]) };
            }
        }

        if (method === 'PATCH' && id) {
            const { caption } = JSON.parse(event.body);
            const result = await client.query(
                'UPDATE posts SET caption = $1 WHERE id = $2 RETURNING *',
                [caption, id]
            );
            return { statusCode: 200, body: JSON.stringify(result.rows[0]) };
        }

        if (method === 'DELETE' && id) {
            await client.query('DELETE FROM posts WHERE id = $1', [id]);
            return { statusCode: 204, body: '' };
        }

        return { statusCode: 405, body: 'Method Not Allowed' };
    } catch (err) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: err.message })
        };
    } finally {
        await client.end();
    }
};
