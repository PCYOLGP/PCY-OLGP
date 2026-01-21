import { Handler } from '@netlify/functions';
import { sql } from './lib/db';

export const handler: Handler = async (event) => {
    const method = event.httpMethod;
    const path = event.path.replace('/.netlify/functions/posts', '').replace('/api/posts', '');
    const segments = path.split('/').filter(Boolean);
    const id = segments[0];

    try {
        if (method === 'GET') {
            if (segments.length === 2 && segments[1] === 'comments') {
                const postId = segments[0];
                const comments = await sql`
                    SELECT c.*, u.image as "userImage"
                    FROM comments c
                    LEFT JOIN users u ON c.username = u.username
                    WHERE c.post_id = ${postId} 
                    ORDER BY c.timestamp ASC
                `;
                return { statusCode: 200, body: JSON.stringify(comments) };
            } else if (id) {
                const posts = await sql`
                    SELECT p.*, u.image as "userImage"
                    FROM posts p
                    LEFT JOIN users u ON p.username = u.username
                    WHERE p.id = ${id}
                `;
                return { statusCode: 200, body: JSON.stringify(posts[0] || {}) };
            } else {
                const posts = await sql`
                    SELECT p.*, u.image as "userImage"
                    FROM posts p
                    LEFT JOIN users u ON LOWER(TRIM(p.username)) = LOWER(TRIM(u.username))
                    ORDER BY p.timestamp DESC
                `;

                // Fetch likes for each post
                for (let post of posts) {
                    const likes = await sql`
                        SELECT l.*, u.username
                        FROM likes l
                        LEFT JOIN users u ON l.user_id = u.id
                        WHERE l.post_id = ${post.id}
                    `;
                    post.likes = likes;
                }

                return { statusCode: 200, body: JSON.stringify(posts) };
            }
        }

        if (method === 'POST') {
            const body = JSON.parse(event.body || '{}');
            if (segments.length === 2 && segments[1] === 'comments') {
                const postId = segments[0];
                const { username, comment } = body;
                const result = await sql`
          INSERT INTO comments (post_id, username, comment, timestamp)
          VALUES (${postId}, ${username}, ${comment}, NOW())
          RETURNING *
        `;
                return { statusCode: 201, body: JSON.stringify(result[0]) };
            } else if (segments.length === 2 && segments[1] === 'toggle-like') {
                const postId = segments[0];
                const { userId } = body;
                const check = await sql`SELECT * FROM likes WHERE post_id = ${postId} AND user_id = ${userId}`;
                if (check.length > 0) {
                    await sql`DELETE FROM likes WHERE post_id = ${postId} AND user_id = ${userId}`;
                    return { statusCode: 200, body: JSON.stringify({ success: true, liked: false }) };
                } else {
                    await sql`INSERT INTO likes (post_id, user_id, timestamp) VALUES (${postId}, ${userId}, NOW())`;
                    return { statusCode: 200, body: JSON.stringify({ success: true, liked: true }) };
                }
            } else {
                const { username, caption, image } = body;
                const result = await sql`
          INSERT INTO posts (username, caption, image, timestamp)
          VALUES (${username}, ${caption}, ${image}, NOW())
          RETURNING *
        `;
                return { statusCode: 201, body: JSON.stringify(result[0]) };
            }
        }

        if (method === 'PATCH' && id) {
            const { caption } = JSON.parse(event.body || '{}');
            const result = await sql`UPDATE posts SET caption = ${caption} WHERE id = ${id} RETURNING *`;
            return { statusCode: 200, body: JSON.stringify(result[0]) };
        }

        if (method === 'DELETE' && id) {
            await sql`DELETE FROM posts WHERE id = ${id}`;
            return { statusCode: 204, body: '' };
        }

        return { statusCode: 405, body: 'Method Not Allowed' };
    } catch (err: any) {
        return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
    }
};
