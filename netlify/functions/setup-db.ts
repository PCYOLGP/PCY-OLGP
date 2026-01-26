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

        await sql`
            CREATE TABLE IF NOT EXISTS posts (
                id SERIAL PRIMARY KEY,
                username TEXT NOT NULL,
                caption TEXT,
                image TEXT,
                timestamp TIMESTAMPTZ DEFAULT NOW()
            )
        `;

        await sql`
            CREATE TABLE IF NOT EXISTS comments (
                id SERIAL PRIMARY KEY,
                post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
                username TEXT NOT NULL,
                comment TEXT NOT NULL,
                timestamp TIMESTAMPTZ DEFAULT NOW()
            )
        `;

        await sql`
            CREATE TABLE IF NOT EXISTS likes (
                id SERIAL PRIMARY KEY,
                post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                timestamp TIMESTAMPTZ DEFAULT NOW(),
                UNIQUE(post_id, user_id)
            )
        `;

        // 3. Sync users from db.json
        const users = dbData.users;
        console.log(`Syncing ${users.length} users...`);
        for (const user of users) {
            console.log(`Syncing user: ${user.username}`);
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
                    bio = EXCLUDED.bio;
            `;
        }

        // 4. Sync posts from db.json
        const posts = dbData.posts;
        console.log(`Syncing ${posts.length} posts...`);
        for (const post of posts) {
            console.log(`Syncing post: ${post.id}`);
            await sql`
                INSERT INTO posts (id, username, caption, image, timestamp)
                VALUES (
                    ${post.id},
                    ${post.username}, 
                    ${post.caption || ''}, 
                    ${post.image || ''}, 
                    ${post.timestamp || 'NOW()'}
                )
                ON CONFLICT (id) DO UPDATE 
                SET username = EXCLUDED.username,
                    caption = EXCLUDED.caption,
                    image = EXCLUDED.image,
                    timestamp = EXCLUDED.timestamp;
            `;
        }

        // 5. Site Content Table
        await sql`
            CREATE TABLE IF NOT EXISTS site_content (
                id SERIAL PRIMARY KEY,
                content JSONB NOT NULL,
                updated_at TIMESTAMPTZ DEFAULT NOW()
            )
        `;

        // Sync Site Content with specific requested data
        const siteContent = {
            landing: {
                welcomeLabel: 'Welcome to our community',
                heroTitle: 'This is OLGP | PCY',
                heroSubtitle: 'The Parish Commission on Youth is a group of young people dedicated to faith, fellowship, and service. Whether you\'re looking to volunteer or grow in spirit, there\'s a place for you here.',
                heroButtonText: 'PCY OFFICERS 2025',
                logoImage: '/assets/PCY.png',
                gsffLabel: 'Short Film Festival',
                gsffTitle: 'GSFF 2022',
                gsffDescription: 'GSFF is a short film festival of Our Lady of Guadalupe Parish in Marilao, Bulacan, bringing stories of faith and reflection to the screen.'
            },
            officerTerms: [
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
            ],
            videos: [
                { title: 'KANDILA', description: '"Ama patawarin mo sila sapagkat hindi nila alam ang kaniyang ginagawa"', url: 'https://www.youtube.com/embed/pz7DJU7Os7U' },
                { title: 'NAKAW NA PARAISO', description: '"Sinasabi ko sa \'yo: Ngayon din ay isasama kita sa Pariso."', url: 'https://www.youtube.com/embed/vYoLj4PfGlE' },
                { title: 'BUBOY', description: '"Babae, narito, ang iyong anak!" "Narito, ang iyong ina!"', url: 'https://www.youtube.com/embed/HXq1xr8PMWI' },
                { title: 'ILAW', description: '"Diyos ko, Diyos ko! Bakit mo ako pinabayaan?"', url: 'https://www.youtube.com/embed/AV0o6VQXmZs' },
                { title: 'KAMAYAN', description: '"Nauuhaw ako!"', url: 'https://www.youtube.com/embed/olTlczcdFWQ' },
                { title: 'ANGHEL SA DILIM', description: '"Naganap na"', url: 'https://www.youtube.com/embed/jl76Iw6mwJM' },
                { title: 'GULONG NA BUHAY', description: '"Ama, sa mga kamay mo, inihahabilin ko ang aking espiritu"', url: 'https://www.youtube.com/embed/5l1V56qClC0' }
            ],
            directory: [
                { name: 'Tristan Jhon Fruelda', role: 'Auditor', previousPosition: 'Coordinator', age: 23, yearJoined: 2023, address: 'St. Martha', bio: 'Youth Leader and community servant.', image: 'assets/tan.jpg', email: 'sample@gmail.com', fb: 'https://www.facebook.com/profile.php?id=100008628315250' },
                { name: 'Aeron jay Boringot', role: 'Member', previousPosition: 'Vice Coordinator', age: 22, yearJoined: 2023, address: 'Marilao', bio: 'Tech enthusiast and active PCY member.', image: 'assets/tan.jpg', email: 'sample@gmail.com', fb: 'https://www.facebook.com/Aeronjay.11.1827A' },
                { name: 'Nixarene Nicole P. Escobillo', role: 'Coordinator', previousPosition: 'Secretary', age: 21, yearJoined: 2024, address: 'Marilao', bio: 'Leading the youth with passion and dedication.', image: 'assets/nica.jpg', email: 'sample@gmail.com', fb: 'https://www.facebook.com/Nixarene.Escobilo' },
                { name: 'Zianna Crisolo', role: 'Vice Coordinator (External)', previousPosition: 'Treasurer', age: 20, yearJoined: 2024, address: 'Marilao', bio: 'Passionate about external relations and service.', image: 'assets/nica.jpg', email: 'sample@gmail.com', fb: 'https://www.facebook.com/profile.php?id=100074652100042' }
            ]
        };

        // Brute force update: Clear old content and insert the fresh requested one
        await sql`TRUNCATE TABLE site_content`;
        await sql`
            INSERT INTO site_content (content, updated_at)
            VALUES (${JSON.stringify(siteContent)}, NOW())
        `;

        // Reset sequence for posts id
        await sql`SELECT setval('posts_id_seq', (SELECT MAX(id) FROM posts))`;

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Database setup and synced (users, posts, & content) successfully!' })
        };
    } catch (err: any) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: err.message })
        };
    }
};
