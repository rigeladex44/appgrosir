const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Get attendance records
router.get('/', authenticateToken, (req, res) => {
  const { user_id, start_date, end_date } = req.query;
  
  let query = `SELECT a.*, u.full_name, u.role
               FROM attendance a
               JOIN users u ON a.user_id = u.id`;
  let params = [];

  const conditions = [];
  
  if (user_id) {
    conditions.push('a.user_id = ?');
    params.push(user_id);
  }

  if (start_date && end_date) {
    conditions.push('a.created_at BETWEEN ? AND ?');
    params.push(start_date, end_date);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY a.created_at DESC LIMIT 100';

  db.all(query, params, (err, records) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(records);
  });
});

// Check in
router.post('/check-in', authenticateToken, (req, res) => {
  const { notes } = req.body;

  // Check if already checked in today
  db.get(
    `SELECT * FROM attendance 
     WHERE user_id = ? AND DATE(created_at) = DATE('now') AND check_out IS NULL`,
    [req.user.id],
    (err, existing) => {
      if (existing) {
        return res.status(400).json({ error: 'Already checked in today' });
      }

      db.run(
        `INSERT INTO attendance (user_id, check_in, notes)
         VALUES (?, datetime('now'), ?)`,
        [req.user.id, notes],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Error checking in' });
          }
          res.json({ message: 'Checked in successfully', id: this.lastID });
        }
      );
    }
  );
});

// Check out
router.post('/check-out', authenticateToken, (req, res) => {
  const { notes } = req.body;

  db.run(
    `UPDATE attendance 
     SET check_out = datetime('now'), notes = COALESCE(?, notes)
     WHERE user_id = ? AND DATE(created_at) = DATE('now') AND check_out IS NULL`,
    [notes, req.user.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error checking out' });
      }
      if (this.changes === 0) {
        return res.status(400).json({ error: 'No active check-in found' });
      }
      res.json({ message: 'Checked out successfully' });
    }
  );
});

// Get today's attendance summary
router.get('/today', authenticateToken, (req, res) => {
  db.all(
    `SELECT a.*, u.full_name, u.role
     FROM attendance a
     JOIN users u ON a.user_id = u.id
     WHERE DATE(a.created_at) = DATE('now')
     ORDER BY a.check_in DESC`,
    [],
    (err, records) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(records);
    }
  );
});

// Get user's current status
router.get('/my-status', authenticateToken, (req, res) => {
  db.get(
    `SELECT * FROM attendance 
     WHERE user_id = ? AND DATE(created_at) = DATE('now')
     ORDER BY id DESC LIMIT 1`,
    [req.user.id],
    (err, record) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(record || { checked_in: false });
    }
  );
});

module.exports = router;
