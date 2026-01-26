import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

async function updateContent() {
    const databaseUrl = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL;
    if (!databaseUrl) {
        console.error('DATABASE_URL is not defined');
        return;
    }
    const sql = neon(databaseUrl);

    // Fetch current content to preserve other fields
    let currentContent = {};
    try {
        const result = await sql`SELECT content FROM site_content ORDER BY updated_at DESC LIMIT 1`;
        if (result.length > 0) {
            currentContent = result[0].content;
        }
    } catch (e) {
        console.log('No existing content or table found, will create one.');
    }

    const officerTerms = [
        {
            year: '2026',
            youthAdviser: 'Rev. Fr. Ronaldo Samonte',
            officers: [{ position: 'TBC', name: 'To Be Confirmed' }]
        },
        {
            year: '2025',
            youthAdviser: 'Rev. Fr. Ronaldo Samonte',
            officers: [
                { position: 'Coordinator', name: 'Nixarene Nicole P. Escobillo' },
                { position: 'Vice Coordinator (External)', name: 'Zianna Crisolo' },
                { position: 'Vice Coordinator (Internal)', name: 'Pristine Burio' },
                { position: 'Secretary', name: 'Chloe Paraan' },
                { position: 'Treasurer', name: 'Carl Misajon' },
                { position: 'Auditor', name: 'Tristan Fruelda' }
            ],
            committees: [
                { position: 'Social Communication', name: 'Wency Opiso' },
                { position: 'Sports and Recreational', name: 'Jeffrey Hibanes' }
            ]
        },
        {
            year: '2023-2024',
            youthAdviser: 'Rev. Fr. Ronaldo Samonte',
            officers: [
                { position: 'Coordinator', name: 'Tristan Jhon Fruelda' },
                { position: 'Vice Coor', name: 'Aeron jay Boringot' },
                { position: 'Secretary', name: 'Nixarene Escobillo' },
                { position: 'Treasurer', name: 'Zianna Crisolo' },
                { position: 'Auditor', name: 'Pearly Colacion' }
            ],
            committees: [
                { position: 'Liturgy', name: 'Kenneth Baselonia' },
                { position: 'Social Communication', name: 'Wency Opiso' },
                { position: 'Property Custodial', name: 'Ria Ligason' },
                { position: 'Sports and Recreational', name: 'Jeffrey Hibanes' }
            ]
        },
        {
            year: '2022-2023',
            youthAdviser: 'Rev. Fr. Ronaldo Samonte',
            officers: [
                { position: 'President', name: 'Richmond Lyle Chang' },
                { position: 'Vice-president', name: 'Rome Azeleigh Salangad' },
                { position: 'Secretary', name: 'Denmark Paningbatan' },
                { position: 'Treasurer', name: 'Gleiza Nones' },
                { position: 'Auditor', name: 'Medarlyn Vergara' }
            ]
        },
        {
            year: '2021-2022',
            youthAdviser: 'Rev. Fr. Ronaldo Samonte',
            officers: [
                { position: 'President', name: 'Medarlyn Vergara' },
                { position: 'Vice-president', name: 'Rhode Uy' },
                { position: 'Secretary', name: 'Richmond Lyle Chang' },
                { position: 'Treasurer', name: 'Denmark Paningbatan' },
                { position: 'Auditor', name: 'Janelle Andrea Icay' }
            ]
        },
        {
            year: '2020',
            youthAdviser: 'Rev. Fr. Lazaro Benedictos',
            officers: [
                { position: 'President', name: 'Kenneth Baselonia' },
                { position: 'Vice-president', name: 'Daisy Lazar' },
                { position: 'Secretary', name: 'Jeffrey Hibanes' },
                { position: 'Treasurer', name: 'Emerson Jayme' },
                { position: 'Auditor', name: 'Wency Jezrel Opiso' }
            ]
        },
        {
            year: '2019',
            youthAdviser: 'Rev. Fr. Lazaro Benedictos',
            officers: [{ position: 'TBC', name: 'To Be Confirmed' }]
        },
        {
            year: '2018',
            youthAdviser: 'Rev. Fr. Lazaro Benedictos',
            officers: [{ position: 'TBC', name: 'To Be Confirmed' }]
        },
        {
            year: '2016',
            youthAdviser: 'Rev. Fr. Lazaro Benedictos',
            officers: [{ position: 'TBC', name: 'To Be Confirmed' }]
        }
    ];

    const newContent = {
        ...currentContent,
        officerTerms: officerTerms
    };

    // Ensure landing exists and logo is correct
    if (!newContent.landing) {
        newContent.landing = {
            welcomeLabel: 'Welcome to our community',
            heroTitle: 'This is OLGP | PCY',
            heroSubtitle: 'The Parish Commission on Youth is a group of young people dedicated to faith, fellowship, and service.',
            heroButtonText: 'PCY OFFICERS',
            logoImage: 'assets/PCY.png',
            gsffLabel: 'Short Film Festival',
            gsffTitle: 'GSFF 2022',
            gsffDescription: 'GSFF is a short film festival...'
        };
    } else {
        // Fix image path if it was broken
        newContent.landing.logoImage = 'assets/PCY.png';
    }

    console.log('Updating site content...');
    try {
        await sql`
            CREATE TABLE IF NOT EXISTS site_content (
                id SERIAL PRIMARY KEY,
                content JSONB NOT NULL,
                updated_at TIMESTAMPTZ DEFAULT NOW()
            )
        `;

        await sql`
            INSERT INTO site_content (content, updated_at)
            VALUES (${JSON.stringify(newContent)}, NOW())
        `;
        console.log('Site content updated successfully!');
    } catch (error) {
        console.error('Error updating site content:', error);
    }
}

updateContent();
