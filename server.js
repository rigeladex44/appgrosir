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

// Routes
app.use('/api/auth', require('./server/routes/auth'));
app.use('/api/products', require('./server/routes/products'));
app.use('/api/stock', require('./server/routes/stock'));
app.use('/api/sales', require('./server/routes/sales'));
app.use('/api/attendance', require('./server/routes/attendance'));
app.use('/api/dashboard', require('./server/routes/dashboard'));
app.use('/api/users', require('./server/routes/users'));

// Serve frontend - catch-all route for SPA
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT}`);
});
