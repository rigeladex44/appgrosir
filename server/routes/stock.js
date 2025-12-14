const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Get all stock movements
router.get('/movements', authenticateToken, (req, res) => {
  db.all(
    `SELECT sm.*, p.name as product_name, p.sku, u.full_name as user_name
     FROM stock_movements sm
     JOIN products p ON sm.product_id = p.id
     JOIN users u ON sm.user_id = u.id
     ORDER BY sm.created_at DESC
     LIMIT 100`,
    [],
    (err, movements) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(movements);
    }
  );
});

// Transfer stock from warehouse to cashier
router.post('/transfer', authenticateToken, (req, res) => {
  const { product_id, quantity, notes } = req.body;

  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    // Check warehouse stock
    db.get('SELECT warehouse_stock FROM products WHERE id = ?', [product_id], (err, product) => {
      if (err || !product) {
        db.run('ROLLBACK');
        return res.status(400).json({ error: 'Product not found' });
      }

      if (product.warehouse_stock < quantity) {
        db.run('ROLLBACK');
        return res.status(400).json({ error: 'Insufficient warehouse stock' });
      }

      // Update product stocks
      db.run(
        `UPDATE products 
         SET warehouse_stock = warehouse_stock - ?, 
             cashier_stock = cashier_stock + ?,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [quantity, quantity, product_id],
        (err) => {
          if (err) {
            db.run('ROLLBACK');
            return res.status(500).json({ error: 'Error updating stock' });
          }

          // Record stock movement
          db.run(
            `INSERT INTO stock_movements (product_id, type, from_location, to_location, quantity, notes, user_id)
             VALUES (?, 'transfer', 'warehouse', 'cashier', ?, ?, ?)`,
            [product_id, quantity, notes, req.user.id],
            function(err) {
              if (err) {
                db.run('ROLLBACK');
                return res.status(500).json({ error: 'Error recording movement' });
              }

              db.run('COMMIT');
              res.json({ message: 'Stock transferred successfully', movement_id: this.lastID });
            }
          );
        }
      );
    });
  });
});

// Add stock to warehouse (incoming stock)
router.post('/receive', authenticateToken, (req, res) => {
  const { product_id, quantity, reference, notes } = req.body;

  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    db.run(
      `UPDATE products 
       SET warehouse_stock = warehouse_stock + ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [quantity, product_id],
      (err) => {
        if (err) {
          db.run('ROLLBACK');
          return res.status(500).json({ error: 'Error updating stock' });
        }

        db.run(
          `INSERT INTO stock_movements (product_id, type, from_location, to_location, quantity, reference, notes, user_id)
           VALUES (?, 'in', 'supplier', 'warehouse', ?, ?, ?, ?)`,
          [product_id, quantity, reference, notes, req.user.id],
          function(err) {
            if (err) {
              db.run('ROLLBACK');
              return res.status(500).json({ error: 'Error recording movement' });
            }

            db.run('COMMIT');
            res.json({ message: 'Stock received successfully', movement_id: this.lastID });
          }
        );
      }
    );
  });
});

// Adjust stock (corrections)
router.post('/adjust', authenticateToken, (req, res) => {
  const { product_id, location, quantity, notes } = req.body;

  // Whitelist validation for location
  if (location !== 'warehouse' && location !== 'cashier') {
    return res.status(400).json({ error: 'Invalid location. Must be warehouse or cashier.' });
  }

  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    const field = location === 'warehouse' ? 'warehouse_stock' : 'cashier_stock';

    db.run(
      `UPDATE products 
       SET ${field} = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [quantity, product_id],
      (err) => {
        if (err) {
          db.run('ROLLBACK');
          return res.status(500).json({ error: 'Error adjusting stock' });
        }

        db.run(
          `INSERT INTO stock_movements (product_id, type, from_location, to_location, quantity, notes, user_id)
           VALUES (?, 'adjustment', ?, ?, ?, ?, ?)`,
          [product_id, location, location, quantity, notes, req.user.id],
          function(err) {
            if (err) {
              db.run('ROLLBACK');
              return res.status(500).json({ error: 'Error recording adjustment' });
            }

            db.run('COMMIT');
            res.json({ message: 'Stock adjusted successfully', movement_id: this.lastID });
          }
        );
      }
    );
  });
});

module.exports = router;
