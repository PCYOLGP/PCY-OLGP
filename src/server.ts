import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/{*splat}', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

import multer from 'multer';
import fs from 'fs-extra';

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
    // Multer populates req.body with text fields sent BEFORE the file
    const username = req.body.username || 'user-profile';
    const ext = file.originalname.split('.').pop() || 'jpg';
    const filename = `${username}-${Date.now()}.${ext}`;
    console.log(`[Multer] Renaming profile image to: ${filename}`);
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
    console.log(`[API] DB Path: ${dbPath}`);
    if (!fs.existsSync(dbPath)) {
      console.warn('[API] db.json not found!');
      return res.json([]);
    }
    const db = await fs.readJson(dbPath);
    console.log(`[API] Found ${db.posts?.length || 0} posts in db.json`);

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
        likes: likes.filter((l: any) => l.post_id === p.id)
      };
    });

    return res.json(postsWithLikes);
  } catch (error) {
    console.error('[API] Error reading db.json:', error);
    return res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// Toggle like for a post
app.post('/api/posts/:postId/toggle-like', async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req.body;
    const db = await fs.readJson(dbPath);

    if (!db.likes) db.likes = [];

    const likeIndex = db.likes.findIndex((l: any) => l.post_id === parseInt(String(postId)) && l.user_id === parseInt(String(userId)));

    let liked = false;
    if (likeIndex > -1) {
      // Unlike
      db.likes.splice(likeIndex, 1);
      liked = false;
    } else {
      // Like
      const newLike = {
        id: db.likes.length > 0 ? Math.max(...db.likes.map((l: any) => l.id)) + 1 : 1,
        post_id: parseInt(String(postId)),
        user_id: parseInt(String(userId)),
        timestamp: new Date().toISOString()
      };
      db.likes.push(newLike);
      liked = true;
    }

    await fs.writeJson(dbPath, db, { spaces: 4 });
    return res.json({ success: true, liked });
  } catch (error) {
    console.error('Error toggling like:', error);
    return res.status(500).json({ error: 'Failed to toggle like' });
  }
});

// API Endpoint to handle post creation
app.post('/api/posts', upload.single('image'), async (req, res) => {
  try {
    const { username, caption } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'Image is required' });
    }

    const db = await fs.readJson(dbPath);

    const newPost = {
      id: db.posts.length > 0 ? Math.max(...db.posts.map((p: any) => p.id)) + 1 : 1,
      username: username || 'Anonymous',
      image: `pcy-wall/${file.filename}`,
      caption: caption || '',
      timestamp: new Date().toISOString()
    };

    db.posts.push(newPost);
    await fs.writeJson(dbPath, db, { spaces: 4 });

    return res.status(201).json(newPost);
  } catch (error) {
    console.error('Error creating post:', error);
    return res.status(500).json({ error: 'Failed to create post' });
  }
});

// Update post caption
app.patch('/api/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { caption } = req.body;
    const db = await fs.readJson(dbPath);
    const postIndex = db.posts.findIndex((p: any) => p.id === parseInt(id));

    if (postIndex === -1) {
      return res.status(404).json({ error: 'Post not found' });
    }

    db.posts[postIndex].caption = caption;
    await fs.writeJson(dbPath, db, { spaces: 4 });

    return res.json(db.posts[postIndex]);
  } catch (error) {
    console.error('Error updating post:', error);
    return res.status(500).json({ error: 'Failed to update post' });
  }
});

// Delete post
app.delete('/api/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await fs.readJson(dbPath);
    const postIndex = db.posts.findIndex((p: any) => p.id === parseInt(id));

    if (postIndex === -1) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Optional: Delete the physical image file here if desired
    // For now we just remove from db.json
    db.posts.splice(postIndex, 1);
    await fs.writeJson(dbPath, db, { spaces: 4 });

    return res.status(204).send();
  } catch (error) {
    console.error('Error deleting post:', error);
    return res.status(500).json({ error: 'Failed to delete post' });
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const db = await fs.readJson(dbPath);

    // Treat 'admin' as an alias for 'OLGP_PCY'
    const loginUsername = username === 'admin' ? 'OLGP_PCY' : username;

    const user = db.users.find((u: any) =>
      u.username === loginUsername && u.password === password
    );

    if (user) {
      // Don't send password back
      const { password: _, ...userWithoutPassword } = user;
      return res.json(userWithoutPassword);
    } else {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET Comments for a post
app.get('/api/posts/:postId/comments', async (req, res) => {
  try {
    const { postId } = req.params;
    const db = await fs.readJson(dbPath);
    const comments = (db.comments || []).filter((c: any) =>
      (c.post_id === parseInt(String(postId))) || (c.postId === parseInt(String(postId)))
    ).map((c: any) => {
      const commentUser = db.users.find((u: any) => u.username === c.username);
      return {
        ...c,
        userImage: commentUser?.image ? (commentUser.image.startsWith('/') ? commentUser.image : `/${commentUser.image}`) : null
      };
    });
    console.log(`[GET] Comments for Post ${postId}: found ${comments.length} comments`);
    return res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    return res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// POST Comment to a post
app.post('/api/posts/:postId/comments', async (req, res) => {
  try {
    const { postId } = req.params;
    const { username, comment } = req.body;
    const db = await fs.readJson(dbPath);

    if (!db.comments) db.comments = [];

    const newComment = {
      id: db.comments.length > 0 ? Math.max(...db.comments.map((c: any) => c.id)) + 1 : 1,
      post_id: parseInt(String(postId)),
      username: username || 'Anonymous',
      comment: comment || '',
      timestamp: new Date().toISOString()
    };

    db.comments.push(newComment);
    await fs.writeJson(dbPath, db, { spaces: 4 });

    return res.status(201).json(newComment);
  } catch (error) {
    console.error('Error posting comment:', error);
    return res.status(500).json({ error: 'Failed to post comment' });
  }
});

// GET all users or filter by username
app.get('/api/users', async (req, res) => {
  try {
    const { username } = req.query;
    const db = await fs.readJson(dbPath);
    let users = db.users || [];

    if (username) {
      users = users.filter((u: any) => u.username === username);
    }

    // Don't send passwords
    const usersSafe = users.map(({ password, ...u }: any) => u);
    return res.json(usersSafe);
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// PATCH update user profile
app.patch('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const db = await fs.readJson(dbPath);
    const userIndex = db.users.findIndex((u: any) => u.id === parseInt(String(id)));

    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update posts username if username is changed
    const oldUsername = db.users[userIndex].username;
    if (updateData.username && updateData.username !== oldUsername) {
      db.posts = (db.posts || []).map((p: any) =>
        p.username === oldUsername ? { ...p, username: updateData.username } : p
      );
      db.comments = (db.comments || []).map((c: any) =>
        c.username === oldUsername ? { ...c, username: updateData.username } : c
      );
    }

    db.users[userIndex] = { ...db.users[userIndex], ...updateData };
    await fs.writeJson(dbPath, db, { spaces: 4 });

    const { password, ...userSafe } = db.users[userIndex];
    return res.json(userSafe);
  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({ error: 'Failed to update profile' });
  }
});

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
