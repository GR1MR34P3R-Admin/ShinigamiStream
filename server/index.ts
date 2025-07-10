import express from 'express';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import path from 'path';
import { db } from './database/index.js';
import { authenticateToken, requireRole, AuthRequest } from './middleware/auth.js';
import { upload, getFileUrl, deleteFile } from './middleware/upload.js';
import { setupStaticServing } from './static-serve.js';

dotenv.config();

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const dataDirectory = process.env.DATA_DIRECTORY || './data';

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Always serve uploaded files statically (both dev and production)
app.use('/uploads', express.static(path.join(dataDirectory, 'uploads')));

// Upload Routes
app.post('/api/upload/site-logo', authenticateToken, requireRole(['admin']), upload.single('logo'), async (req: AuthRequest, res: express.Response) => {
  console.log('Site logo upload request received');
  
  try {
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }

    const fileUrl = getFileUrl(req.file.filename);
    console.log('Site logo uploaded successfully:', fileUrl);

    res.json({ 
      message: 'Logo uploaded successfully', 
      filename: req.file.filename,
      url: fileUrl
    });
  } catch (error) {
    console.error('Error uploading site logo:', error);
    res.status(500).json({ message: 'Failed to upload logo' });
  }
});

app.post('/api/upload/anime-cover', authenticateToken, requireRole(['admin', 'staff']), upload.single('cover'), async (req: AuthRequest, res: express.Response) => {
  console.log('Anime cover upload request received');
  
  try {
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }

    const fileUrl = getFileUrl(req.file.filename);
    console.log('Anime cover uploaded successfully:', fileUrl);

    res.json({ 
      message: 'Cover uploaded successfully', 
      filename: req.file.filename,
      url: fileUrl
    });
  } catch (error) {
    console.error('Error uploading anime cover:', error);
    res.status(500).json({ message: 'Failed to upload cover' });
  }
});

app.post('/api/upload/episode-thumbnail', authenticateToken, requireRole(['admin', 'staff']), upload.single('thumbnail'), async (req: AuthRequest, res: express.Response) => {
  console.log('Episode thumbnail upload request received');
  
  try {
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }

    const fileUrl = getFileUrl(req.file.filename);
    console.log('Episode thumbnail uploaded successfully:', fileUrl);

    res.json({ 
      message: 'Thumbnail uploaded successfully', 
      filename: req.file.filename,
      url: fileUrl
    });
  } catch (error) {
    console.error('Error uploading episode thumbnail:', error);
    res.status(500).json({ message: 'Failed to upload thumbnail' });
  }
});

app.post('/api/upload/episode-video', authenticateToken, requireRole(['admin', 'staff']), upload.single('video'), async (req: AuthRequest, res: express.Response) => {
  console.log('Episode video upload request received');
  
  try {
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }

    const fileUrl = getFileUrl(req.file.filename);
    console.log('Episode video uploaded successfully:', fileUrl);

    res.json({ 
      message: 'Video uploaded successfully', 
      filename: req.file.filename,
      url: fileUrl
    });
  } catch (error) {
    console.error('Error uploading episode video:', error);
    res.status(500).json({ message: 'Failed to upload video' });
  }
});

// Auth Routes
app.post('/api/auth/register', async (req: express.Request, res: express.Response) => {
  console.log('Register request received:', req.body);
  
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      res.status(400).json({ message: 'Username, email, and password are required' });
      return;
    }

    // Check if user exists with username
    const existingUsername = await db.selectFrom('users')
      .select(['id'])
      .where('username', '=', username)
      .executeTakeFirst();

    if (existingUsername) {
      res.status(400).json({ message: 'Username already exists' });
      return;
    }

    // Check if user exists with email
    const existingEmail = await db.selectFrom('users')
      .select(['id'])
      .where('email', '=', email)
      .executeTakeFirst();

    if (existingEmail) {
      res.status(400).json({ message: 'Email already exists' });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user with 'user' role only - ignore any role parameter for security
    const result = await db.insertInto('users')
      .values({
        username,
        email,
        password: hashedPassword,
        role: 'user' // Force user role for all new registrations
      })
      .executeTakeFirst();

    console.log('User created successfully:', result);

    // Convert BigInt to number for JWT
    const userId = Number(result.insertId);

    // Generate JWT token
    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: { id: userId, username, email, role: 'user' }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/auth/login', async (req: express.Request, res: express.Response) => {
  console.log('Login request received:', req.body);
  
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ message: 'Username and password are required' });
      return;
    }

    // Find user
    const user = await db.selectFrom('users')
      .select(['id', 'username', 'email', 'password', 'role'])
      .where('username', '=', username)
      .executeTakeFirst();

    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });

    console.log('Login successful for user:', user.username);

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, username: user.username, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Site Settings Routes
app.get('/api/settings', async (req: express.Request, res: express.Response) => {
  console.log('Fetching site settings');
  
  try {
    const settings = await db.selectFrom('site_settings')
      .select(['key', 'value'])
      .execute();

    const settingsObj = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, string>);

    console.log('Site settings fetched successfully:', settingsObj);
    res.json(settingsObj);
  } catch (error) {
    console.error('Error fetching site settings:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/settings', authenticateToken, requireRole(['admin']), async (req: AuthRequest, res: express.Response) => {
  console.log('Updating site settings:', req.body);
  
  try {
    const { site_name, site_logo, site_announcement, hero_image } = req.body;

    const updates = [
      { key: 'site_name', value: site_name },
      { key: 'site_logo', value: site_logo },
      { key: 'site_announcement', value: site_announcement },
      { key: 'hero_image', value: hero_image }
    ];

    for (const update of updates) {
      await db.updateTable('site_settings')
        .set({
          value: update.value,
          updated_by: req.user!.id,
          updated_at: new Date().toISOString()
        })
        .where('key', '=', update.key)
        .execute();
    }

    console.log('Site settings updated successfully');
    res.json({ message: 'Site settings updated successfully' });
  } catch (error) {
    console.error('Error updating site settings:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Anime Routes
app.get('/api/anime', async (req: express.Request, res: express.Response) => {
  console.log('Fetching anime list');
  
  try {
    const anime = await db.selectFrom('anime')
      .selectAll()
      .orderBy('created_at', 'desc')
      .execute();

    console.log('Anime fetched successfully:', anime.length);
    res.json(anime);
  } catch (error) {
    console.error('Error fetching anime:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/anime/:id', async (req: express.Request, res: express.Response) => {
  console.log('Fetching anime by ID:', req.params.id);
  
  try {
    const anime = await db.selectFrom('anime')
      .selectAll()
      .where('id', '=', parseInt(req.params.id))
      .executeTakeFirst();

    if (!anime) {
      res.status(404).json({ message: 'Anime not found' });
      return;
    }

    console.log('Anime fetched successfully:', anime.title);
    res.json(anime);
  } catch (error) {
    console.error('Error fetching anime:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/anime', authenticateToken, requireRole(['admin', 'staff']), async (req: AuthRequest, res: express.Response) => {
  console.log('Creating anime:', req.body);
  
  try {
    const { title, description, genre, status, release_year, logo_url, cover_image_url, studio, tags } = req.body;

    if (!title) {
      res.status(400).json({ message: 'Title is required' });
      return;
    }

    const result = await db.insertInto('anime')
      .values({
        title,
        description,
        genre,
        status: status || 'ongoing',
        release_year,
        logo_url,
        cover_image_url,
        studio,
        tags,
        created_by: req.user!.id
      })
      .executeTakeFirst();

    console.log('Anime created successfully:', result);
    res.status(201).json({ message: 'Anime created successfully', id: Number(result.insertId) });
  } catch (error) {
    console.error('Error creating anime:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.put('/api/anime/:id', authenticateToken, requireRole(['admin', 'staff']), async (req: AuthRequest, res: express.Response) => {
  console.log('Updating anime:', req.params.id, req.body);
  
  try {
    const { title, description, genre, status, release_year, logo_url, cover_image_url, studio, tags } = req.body;
    const animeId = parseInt(req.params.id);

    if (!title) {
      res.status(400).json({ message: 'Title is required' });
      return;
    }

    const result = await db.updateTable('anime')
      .set({
        title,
        description,
        genre,
        status: status || 'ongoing',
        release_year,
        logo_url,
        cover_image_url,
        studio,
        tags,
        updated_at: new Date().toISOString()
      })
      .where('id', '=', animeId)
      .executeTakeFirst();

    console.log('Anime updated successfully:', result);
    res.json({ message: 'Anime updated successfully' });
  } catch (error) {
    console.error('Error updating anime:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.delete('/api/anime/:id', authenticateToken, requireRole(['admin', 'staff']), async (req: AuthRequest, res: express.Response) => {
  console.log('Deleting anime:', req.params.id);
  
  try {
    const animeId = parseInt(req.params.id);

    const result = await db.deleteFrom('anime')
      .where('id', '=', animeId)
      .executeTakeFirst();

    console.log('Anime deleted successfully:', result);
    res.json({ message: 'Anime deleted successfully' });
  } catch (error) {
    console.error('Error deleting anime:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Episodes Routes
app.get('/api/anime/:animeId/episodes', async (req: express.Request, res: express.Response) => {
  console.log('Fetching episodes for anime:', req.params.animeId);
  
  try {
    const episodes = await db.selectFrom('episodes')
      .selectAll()
      .where('anime_id', '=', parseInt(req.params.animeId))
      .orderBy('episode_number', 'asc')
      .execute();

    console.log('Episodes fetched successfully:', episodes.length);
    res.json(episodes);
  } catch (error) {
    console.error('Error fetching episodes:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/anime/:animeId/episodes', authenticateToken, requireRole(['admin', 'staff']), async (req: AuthRequest, res: express.Response) => {
  console.log('Creating episode:', req.body);
  
  try {
    const { episode_number, title, description, video_url, download_url, duration, subtitle_type } = req.body;
    const animeId = parseInt(req.params.animeId);

    if (!episode_number || !title) {
      res.status(400).json({ message: 'Episode number and title are required' });
      return;
    }

    const result = await db.insertInto('episodes')
      .values({
        anime_id: animeId,
        episode_number,
        title,
        description,
        video_url,
        download_url: download_url || video_url, // Use video_url as download_url if not provided
        duration,
        subtitle_type: subtitle_type || 'subbed',
        created_by: req.user!.id
      })
      .executeTakeFirst();

    console.log('Episode created successfully:', result);
    res.status(201).json({ message: 'Episode created successfully', id: Number(result.insertId) });
  } catch (error) {
    console.error('Error creating episode:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.put('/api/episodes/:id', authenticateToken, requireRole(['admin', 'staff']), async (req: AuthRequest, res: express.Response) => {
  console.log('Updating episode:', req.params.id, req.body);
  
  try {
    const { episode_number, title, description, video_url, download_url, duration, subtitle_type } = req.body;
    const episodeId = parseInt(req.params.id);

    if (!episode_number || !title) {
      res.status(400).json({ message: 'Episode number and title are required' });
      return;
    }

    const result = await db.updateTable('episodes')
      .set({
        episode_number,
        title,
        description,
        video_url,
        download_url: download_url || video_url, // Use video_url as download_url if not provided
        duration,
        subtitle_type: subtitle_type || 'subbed',
        updated_at: new Date().toISOString()
      })
      .where('id', '=', episodeId)
      .executeTakeFirst();

    console.log('Episode updated successfully:', result);
    res.json({ message: 'Episode updated successfully' });
  } catch (error) {
    console.error('Error updating episode:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.delete('/api/episodes/:id', authenticateToken, requireRole(['admin', 'staff']), async (req: AuthRequest, res: express.Response) => {
  console.log('Deleting episode:', req.params.id);
  
  try {
    const episodeId = parseInt(req.params.id);

    const result = await db.deleteFrom('episodes')
      .where('id', '=', episodeId)
      .executeTakeFirst();

    console.log('Episode deleted successfully:', result);
    res.json({ message: 'Episode deleted successfully' });
  } catch (error) {
    console.error('Error deleting episode:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// User management (admin only)
app.get('/api/users', authenticateToken, requireRole(['admin']), async (req: AuthRequest, res: express.Response) => {
  console.log('Fetching users list');
  
  try {
    const users = await db.selectFrom('users')
      .select(['id', 'username', 'email', 'role', 'created_at'])
      .orderBy('created_at', 'desc')
      .execute();

    console.log('Users fetched successfully:', users.length);
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.put('/api/users/:id', authenticateToken, requireRole(['admin']), async (req: AuthRequest, res: express.Response) => {
  console.log('Updating user role:', req.params.id, req.body);
  
  try {
    const { role } = req.body;
    const userId = parseInt(req.params.id);

    if (!['admin', 'staff', 'user'].includes(role)) {
      res.status(400).json({ message: 'Invalid role' });
      return;
    }

    const result = await db.updateTable('users')
      .set({
        role,
        updated_at: new Date().toISOString()
      })
      .where('id', '=', userId)
      .executeTakeFirst();

    console.log('User role updated successfully:', result);
    res.json({ message: 'User role updated successfully' });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Export a function to start the server
export async function startServer(port) {
  try {
    if (process.env.NODE_ENV === 'production') {
      setupStaticServing(app);
    }
    app.listen(port, () => {
      console.log(`API Server running on port ${port}`);
      console.log(`Uploads directory: ${path.join(dataDirectory, 'uploads')}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

// Start the server directly if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('Starting server...');
  startServer(process.env.PORT || 3001);
}
