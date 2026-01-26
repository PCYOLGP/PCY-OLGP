import { Handler } from '@netlify/functions';
import { sql } from './lib/db';

export const handler: Handler = async (event) => {
    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod === 'GET') {
        try {
            // Create table if it doesn't exist
            await sql`
                CREATE TABLE IF NOT EXISTS site_content (
                    id SERIAL PRIMARY KEY,
                    content JSONB NOT NULL,
                    updated_at TIMESTAMPTZ DEFAULT NOW()
                )
            `;

            // Get the latest content
            const result = await sql`
                SELECT content FROM site_content 
                ORDER BY updated_at DESC 
                LIMIT 1
            `;

            if (result.length > 0) {
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify(result[0].content)
                };
            } else {
                // Return default content if none exists
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify(null)
                };
            }
        } catch (err: any) {
            console.error('Error fetching site content:', err);
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ error: err.message })
            };
        }
    }

    if (event.httpMethod === 'POST') {
        try {
            const content = JSON.parse(event.body || '{}');

            // Create table if it doesn't exist
            await sql`
                CREATE TABLE IF NOT EXISTS site_content (
                    id SERIAL PRIMARY KEY,
                    content JSONB NOT NULL,
                    updated_at TIMESTAMPTZ DEFAULT NOW()
                )
            `;

            // Insert new content
            await sql`
                INSERT INTO site_content (content, updated_at)
                VALUES (${JSON.stringify(content)}, NOW())
            `;

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ success: true, message: 'Content saved successfully' })
            };
        } catch (err: any) {
            console.error('Error saving site content:', err);
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ error: err.message })
            };
        }
    }

    return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: 'Method not allowed' })
    };
};
