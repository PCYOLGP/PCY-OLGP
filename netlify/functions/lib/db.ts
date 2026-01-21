import { neon } from '@neondatabase/serverless';

// The 'neon' function automatically looks for DATABASE_URL or NETLIFY_DATABASE_URL
// In Netlify, the integration provides NETLIFY_DATABASE_URL
const databaseUrl = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('DATABASE_URL is not defined. Please check your Netlify environment variables.');
} else {
  console.log('Database connection initialized.');
}

export const sql = neon(databaseUrl!);

// Helper for common account queries if needed
export const getAccountByUsername = async (username: string) => {
  const result = await sql`
    SELECT id, username, email, image, fname, lname, bio, password
    FROM users 
    WHERE username = ${username}
  `;
  return result[0];
};
