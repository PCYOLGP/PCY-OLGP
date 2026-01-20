import { neon } from '@netlify/neon';

export default async (req) => {
    const url = new URL(req.url);
    const path = url.pathname.replace('/.netlify/functions/users', '').replace('/api/users', '');
    const segments = path.split('/').filter(Boolean);
    const method = req.method;
    const sql = neon();

    try {
        if (method === 'GET') {
            const username = url.searchParams.get('username');
            if (username) {
                const users = await sql`
          SELECT id, username, email, image, fname, lname, bio
          FROM users WHERE username = ${username}
        `;
                return new Response(JSON.stringify(users), { status: 200 });
            }
        }

        if (method === 'PATCH' && segments.length === 1) {
            const id = segments[0];
            const { username, bio, password } = await req.json();

            let result;
            if (password) {
                result = await sql`
          UPDATE users
          SET username = ${username}, bio = ${bio}, password = ${password}
          WHERE id = ${id}
          RETURNING id, username, email, image, fname, lname, bio
        `;
            } else {
                result = await sql`
          UPDATE users
          SET username = ${username}, bio = ${bio}
          WHERE id = ${id}
          RETURNING id, username, email, image, fname, lname, bio
        `;
            }
            return new Response(JSON.stringify(result[0]), { status: 200 });
        }

        return new Response('Method Not Allowed', { status: 405 });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
};
