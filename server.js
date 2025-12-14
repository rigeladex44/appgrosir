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

// Initialize database
require('./server/config/database');

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

// Serve frontend - catch-all route for SPA
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT}`);
});
