import path from 'path';
import express from 'express';

/**
 * Sets up static file serving for the Express app
 * @param app Express application instance
 */
export function setupStaticServing(app: express.Application) {
  const dataDirectory = process.env.DATA_DIRECTORY || './data';
  
  // Serve uploaded files from the uploads directory
  app.use('/uploads', express.static(path.join(dataDirectory, 'uploads')));
  
  // Serve static files from the public directory (built frontend)
  app.use(express.static(path.join(process.cwd(), 'dist', 'public')));

  // For any other routes, serve the index.html file
  app.get('/*splat', (req, res, next) => {
    // Skip API routes and upload routes
    if (req.path.startsWith('/api/') || req.path.startsWith('/uploads/')) {
      return next();
    }
    res.sendFile(path.join(process.cwd(), 'dist', 'public', 'index.html'));
  });
}
