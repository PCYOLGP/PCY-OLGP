import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import fs from 'fs';

async function fixDb() {
    const databaseUrl = process.env.DATABASE_URL || process.env.NETLIFY_DATABASE_URL;

    if (!databaseUrl) {
        console.error('Error: DATABASE_URL is not set in your environment.');
        process.exit(1);
    }

    const sql = neon(databaseUrl);

    console.log('Connecting to database...');

    try {
        // 1. Enable pgcrypto extension
        console.log('Enabling pgcrypto extension...');
        await sql`CREATE EXTENSION IF NOT EXISTS pgcrypto`;

        // 2. Create tables if they don't exist
        console.log('Ensuring tables exist...');
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

        // 3. Insert/Update users from db.json with HASHED passwords
        console.log('Syncing users from db.json...');
        const dbJson = JSON.parse(fs.readFileSync('./db.json', 'utf8'));
        const users = dbJson.users;

        for (const user of users) {
            console.log(`Processing user: ${user.username}`);
            // We use crypt() with gen_salt() to store the password securely
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

        console.log('Database fixed and synced successfully!');
    } catch (error) {
        console.error('Error fixing database:', error);
        process.exit(1);
    }
}

fixDb();
