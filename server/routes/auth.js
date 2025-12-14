const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

// Login
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Ensure we always return JSON
  res.setHeader('Content-Type', 'application/json');

  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Use default JWT secret if not set (for development only)
    const jwtSecret = process.env.JWT_SECRET || 'default-secret-change-in-production';

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      jwtSecret,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        role: user.role
      }
    });
  });
});

// Register (requires authentication)
router.post('/register', (req, res) => {
  const { username, password, full_name, role, email, phone } = req.body;

  // Ensure we always return JSON
  res.setHeader('Content-Type', 'application/json');

  bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
      return res.status(500).json({ error: 'Error hashing password' });
    }

    db.run(
      `INSERT INTO users (username, password, full_name, role, email, phone) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [username, hash, full_name, role, email, phone],
      function(err) {
        if (err) {
          return res.status(400).json({ error: 'Username already exists' });
        }
        res.json({ message: 'User registered successfully', id: this.lastID });
      }
    );
  });
});

module.exports = router;
