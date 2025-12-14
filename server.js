require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Initialize database lazily (atomic initialization with promise)
let dbInitPromise = null;

function getDatabase() {
  if (!dbInitPromise) {
    dbInitPromise = Promise.resolve().then(() => {
      try {
        return require('./server/config/database');
      } catch (err) {
        console.error('Database initialization error:', err);
        throw err;
      }
    });
  }
  return dbInitPromise;
}

// Middleware to check configuration and initialize database for API requests
app.use('/api', (req, res, next) => {
  // Check JWT_SECRET
  if (!process.env.JWT_SECRET) {
    console.error('FATAL ERROR: JWT_SECRET is not defined in environment variables.');
    return res.status(500).json({ 
      error: 'Server configuration error. Please contact administrator.',
      details: 'JWT_SECRET environment variable is not configured.'
    });
  }
  
  // Ensure database is initialized
  getDatabase()
    .then(() => {
      if (!res.headersSent) {
        next();
      }
    })
    .catch((err) => {
      console.error('Database error:', err);
      if (!res.headersSent) {
        return res.status(500).json({ 
          error: 'Database connection error. Please try again later.'
        });
      }
    });
});

// Rate limiting
const { apiLimiter, authLimiter } = require('./server/middleware/rateLimiter');

// Routes with rate limiting
app.use('/api/auth', authLimiter, require('./server/routes/auth'));
app.use('/api/products', apiLimiter, require('./server/routes/products'));
app.use('/api/stock', apiLimiter, require('./server/routes/stock'));
app.use('/api/sales', apiLimiter, require('./server/routes/sales'));
app.use('/api/attendance', apiLimiter, require('./server/routes/attendance'));
app.use('/api/dashboard', apiLimiter, require('./server/routes/dashboard'));
app.use('/api/users', apiLimiter, require('./server/routes/users'));

// API 404 handler - must come after all API routes
app.use('/api', (req, res, next) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Serve frontend - catch-all route for SPA
app.use((req, res, next) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'), (err) => {
    if (err) {
      next(err);
    }
  });
});

// Global error handler for API routes
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  
  // If request is to API, return JSON error
  if (req.path.startsWith('/api/')) {
    const isDevelopment = process.env.NODE_ENV !== 'production';
    res.status(err.status || 500).json({ 
      error: isDevelopment ? (err.message || 'Internal server error') : 'Internal server error'
    });
  } else {
    next(err);
  }
});

// Only listen on a port when running locally (not on Vercel)
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Visit http://localhost:${PORT}`);
  });
}

// Export the app for Vercel serverless functions
module.exports = app;
