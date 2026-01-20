// This file contains the original express-based server logic
// that was in src/server.ts before it was updated for Netlify compatibility.

import {
    AngularNodeAppEngine,
    createNodeRequestHandler,
    isMainModule,
    writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';
import multer from 'multer';
import fs from 'fs-extra';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

const pcyWallDir = join(process.cwd(), 'public/pcy-wall');
const profileDir = join(process.cwd(), 'public/profile');
const dbPath = join(process.cwd(), 'db.json');

// Ensure directories exist
fs.ensureDirSync(pcyWallDir);
fs.ensureDirSync(profileDir);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, pcyWallDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

const profileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, profileDir);
    },
    filename: (req, file, cb) => {
        const username = req.body.username || 'user-profile';
        const ext = file.originalname.split('.').pop() || 'jpg';
        const filename = `${username}-${Date.now()}.${ext}`;
        cb(null, filename);
    }
});

const upload = multer({ storage });
const uploadProfile = multer({ storage: profileStorage });

app.use(express.json());

// Profile image upload endpoint
app.post('/api/users/:id/profile-image', uploadProfile.single('image'), async (req, res) => {
    try {
        const { id } = req.params;
        const file = req.file;
        if (!file) {
            return res.status(400).json({ error: 'No image uploaded' });
        }

        const db = await fs.readJson(dbPath);
        const userIndex = db.users.findIndex((u: any) => u.id === parseInt(String(id)));

        if (userIndex === -1) {
            return res.status(404).json({ error: 'User not found' });
        }

        const imagePath = `profile/${file.filename}`;
        db.users[userIndex].image = imagePath;
        await fs.writeJson(dbPath, db, { spaces: 4 });

        const { password, ...userSafe } = db.users[userIndex];
        return res.json(userSafe);
    } catch (error) {
        console.error('Error uploading profile image:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/posts', async (req, res) => {
    try {
        if (!fs.existsSync(dbPath)) return res.json([]);
        const db = await fs.readJson(dbPath);
        const likes = db.likes || [];
        const postsWithLikes = (db.posts || []).map((p: any) => {
            const postUser = db.users.find((u: any) => u.username === p.username);
            let userImage = null;
            if (postUser) {
                if (postUser.image && postUser.image.startsWith('profile/')) {
                    userImage = `/${postUser.image}`;
                } else if (postUser.username === 'OLGP_PCY') {
                    userImage = 'assets/PCY.png';
                }
            }
            return {
                ...p,
                image: p.image && !p.image.startsWith('/') ? `/${p.image}` : (p.image || ''),
                userImage: userImage,
                likes: likes.filter((l: any) => l.post_id === p.id).map((l: any) => {
                    const likeUser = db.users.find((u: any) => u.id === l.user_id);
                    return { ...l, username: likeUser?.username || 'Unknown' };
                })
            };
        });
        return res.json(postsWithLikes);
    } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch posts' });
    }
});

// ... (remaining routes) ...
// Note: This is truncated for the backup file.
// The full logic is still in the original src/server.ts
// until we overwrite it.
