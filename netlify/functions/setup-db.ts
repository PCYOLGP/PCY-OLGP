import { Handler } from '@netlify/functions';
import { sql } from './lib/db';
import dbData from '../../db.json' assert { type: 'json' };

export const handler: Handler = async (event) => {
    try {
        console.log('Starting DB Setup...');

        // 1. Enable pgcrypto
        await sql`CREATE EXTENSION IF NOT EXISTS pgcrypto`;

        // 2. Ensure tables exist
        await sql`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                email TEXT,
                image TEXT,
                fname TEXT,
                lname TEXT,
                bio TEXT
            )
        `;

        // 3. Sync users from db.json
        const users = dbData.users;
        for (const user of users) {
            await sql`
                INSERT INTO users (username, password, email, image, fname, lname, bio)
                VALUES (
                    ${user.username}, 
                    crypt(${user.password}, gen_salt('bf')), 
                    ${user.email || ''}, 
                    ${user.image || ''}, 
                    ${user.fname || ''}, 
                    ${user.lname || ''}, 
                    ${user.bio || ''}
                )
                ON CONFLICT (username) DO UPDATE 
                SET password = crypt(${user.password}, gen_salt('bf')),
                    email = EXCLUDED.email,
                    image = EXCLUDED.image,
                    fname = EXCLUDED.fname,
                    lname = EXCLUDED.lname,
                    bio = EXCLUDED.bio
            `;
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Database setup and synced successfully!' })
        };
    } catch (err: any) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: err.message })
        };
    }
};
