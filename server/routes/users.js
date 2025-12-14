const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Get all users (manager/owner only)
router.get('/', authenticateToken, authorizeRoles('manager', 'owner'), (req, res) => {
  db.all(
    'SELECT id, username, full_name, role, email, phone, created_at FROM users ORDER BY full_name',
    [],
    (err, users) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(users);
    }
  );
});

// Get single user
router.get('/:id', authenticateToken, (req, res) => {
  db.get(
    'SELECT id, username, full_name, role, email, phone, created_at FROM users WHERE id = ?',
    [req.params.id],
    (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    }
  );
});

// Update user
router.put('/:id', authenticateToken, authorizeRoles('manager', 'owner'), (req, res) => {
  const { full_name, role, email, phone } = req.body;

  db.run(
    `UPDATE users 
     SET full_name = ?, role = ?, email = ?, phone = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [full_name, role, email, phone, req.params.id],
    function(err) {
      if (err) {
        return res.status(400).json({ error: 'Error updating user' });
      }
      res.json({ message: 'User updated successfully' });
    }
  );
});

// Change password
router.put('/:id/password', authenticateToken, async (req, res) => {
  const { current_password, new_password } = req.body;

  // Only allow users to change their own password, or owner to change any password
  // Managers can only change their own password for security
  if (req.user.id !== parseInt(req.params.id)) {
    // Only owners can change other users' passwords
    if (req.user.role !== 'owner') {
      return res.status(403).json({ error: 'Access denied. Only owners can change other users passwords.' });
    }
  }

  // If changing own password, always verify current password
  if (req.user.id === parseInt(req.params.id)) {
    db.get('SELECT password FROM users WHERE id = ?', [req.params.id], async (err, user) => {
      if (err || !user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const validPassword = await bcrypt.compare(current_password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }

      const hash = await bcrypt.hash(new_password, 10);
      db.run(
        'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [hash, req.params.id],
        (err) => {
          if (err) {
            return res.status(500).json({ error: 'Error updating password' });
          }
          res.json({ message: 'Password updated successfully' });
        }
      );
    });
  } else {
    // Owner changing another user's password (requires current_password for owner verification)
    db.get('SELECT password FROM users WHERE id = ?', [req.user.id], async (err, ownerUser) => {
      if (err || !ownerUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (!current_password) {
        return res.status(400).json({ error: 'Current password required for verification' });
      }

      const validPassword = await bcrypt.compare(current_password, ownerUser.password);
      if (!validPassword) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }

      const hash = await bcrypt.hash(new_password, 10);
      db.run(
        'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [hash, req.params.id],
        (err) => {
          if (err) {
            return res.status(500).json({ error: 'Error updating password' });
          }
          res.json({ message: 'Password updated successfully' });
        }
      );
    });
  }
});

// Delete user
router.delete('/:id', authenticateToken, authorizeRoles('owner'), (req, res) => {
  db.run('DELETE FROM users WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      return res.status(400).json({ error: 'Error deleting user' });
    }
    res.json({ message: 'User deleted successfully' });
  });
});

module.exports = router;
