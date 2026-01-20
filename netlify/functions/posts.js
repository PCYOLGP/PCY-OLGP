import { neon } from '@netlify/neon';

export default async (req) => {
    const url = new URL(req.url);
    // Netlify Functions v2: path is in url.pathname
    // Expected path format: /.netlify/functions/posts/... or /api/posts/... (if redirected)
    const path = url.pathname.replace('/.netlify/functions/posts', '').replace('/api/posts', '');
    const segments = path.split('/').filter(Boolean);
    const method = req.method;
    const sql = neon();

    try {
        if (method === 'GET') {
            if (segments.length === 2 && segments[1] === 'comments') {
                const postId = segments[0];
                const comments = await sql`SELECT * FROM comments WHERE post_id = ${postId} ORDER BY timestamp ASC`;
                return new Response(JSON.stringify(comments), { status: 200 });
            } else if (segments.length === 1) {
                const postId = segments[0];
                const posts = await sql`SELECT * FROM posts WHERE id = ${postId}`;
                return new Response(JSON.stringify(posts[0] || {}), { status: 200 });
            } else {
                const posts = await sql`SELECT * FROM posts ORDER BY timestamp DESC`;
                return new Response(JSON.stringify(posts), { status: 200 });
            }
        }

        if (method === 'POST') {
            const body = await req.json();
            if (segments.length === 2 && segments[1] === 'comments') {
                const postId = segments[0];
                const { username, comment } = body;
                const result = await sql`
          INSERT INTO comments (post_id, username, comment, timestamp)
          VALUES (${postId}, ${username}, ${comment}, NOW())
          RETURNING *
        `;
                return new Response(JSON.stringify(result[0]), { status: 201 });
            } else if (segments.length === 2 && segments[1] === 'toggle-like') {
                const postId = segments[0];
                const { userId } = body;
                const check = await sql`SELECT * FROM likes WHERE post_id = ${postId} AND user_id = ${userId}`;
                if (check.length > 0) {
                    await sql`DELETE FROM likes WHERE post_id = ${postId} AND user_id = ${userId}`;
                    return new Response(JSON.stringify({ success: true, liked: false }), { status: 200 });
                } else {
                    await sql`INSERT INTO likes (post_id, user_id, timestamp) VALUES (${postId}, ${userId}, NOW())`;
                    return new Response(JSON.stringify({ success: true, liked: true }), { status: 200 });
                }
            } else {
                const { username, caption, image } = body;
                const result = await sql`
          INSERT INTO posts (username, caption, image, timestamp)
          VALUES (${username}, ${caption}, ${image}, NOW())
          RETURNING *
        `;
                return new Response(JSON.stringify(result[0]), { status: 201 });
            }
        }

        if (method === 'PATCH' && segments.length === 1) {
            const postId = segments[0];
            const { caption } = await req.json();
            const result = await sql`UPDATE posts SET caption = ${caption} WHERE id = ${postId} RETURNING *`;
            return new Response(JSON.stringify(result[0]), { status: 200 });
        }

        if (method === 'DELETE' && segments.length === 1) {
            const postId = segments[0];
            await sql`DELETE FROM posts WHERE id = ${postId}`;
            return new Response(null, { status: 204 });
        }

        return new Response('Method Not Allowed', { status: 405 });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
};
