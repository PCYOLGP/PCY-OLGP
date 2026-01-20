import { neon } from '@netlify/neon';

export default async (req) => {
    if (req.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 });
    }

    try {
        const { username, password } = await req.json();
        const sql = neon(); // Automatically uses NETLIFY_DATABASE_URL

        const users = await sql`
      SELECT id, username, email, image, fname, lname, bio
      FROM users
      WHERE username = ${username} AND password = crypt(${password}, password)
    `;

        if (users.length > 0) {
            return new Response(JSON.stringify(users[0]), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        } else {
            return new Response(JSON.stringify({ error: 'Invalid username or password' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    } catch (err) {
        return new Response(JSON.stringify({ error: 'Internal Server Error', details: err.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
