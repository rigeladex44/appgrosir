const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Get all products
router.get('/', authenticateToken, (req, res) => {
  db.all('SELECT * FROM products ORDER BY name', [], (err, products) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(products);
  });
});

// Get single product
router.get('/:id', authenticateToken, (req, res) => {
  db.get('SELECT * FROM products WHERE id = ?', [req.params.id], (err, product) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  });
});

// Create product
router.post('/', authenticateToken, (req, res) => {
  const { sku, name, description, category, unit, purchase_price, selling_price, min_stock_alert } = req.body;

  db.run(
    `INSERT INTO products (sku, name, description, category, unit, purchase_price, selling_price, min_stock_alert) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [sku, name, description, category, unit, purchase_price, selling_price, min_stock_alert || 10],
    function(err) {
      if (err) {
        return res.status(400).json({ error: 'SKU already exists or invalid data' });
      }
      res.json({ message: 'Product created successfully', id: this.lastID });
    }
  );
});

// Update product
router.put('/:id', authenticateToken, (req, res) => {
  const { name, description, category, unit, purchase_price, selling_price, min_stock_alert } = req.body;

  db.run(
    `UPDATE products 
     SET name = ?, description = ?, category = ?, unit = ?, purchase_price = ?, 
         selling_price = ?, min_stock_alert = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [name, description, category, unit, purchase_price, selling_price, min_stock_alert, req.params.id],
    function(err) {
      if (err) {
        return res.status(400).json({ error: 'Error updating product' });
      }
      res.json({ message: 'Product updated successfully' });
    }
  );
});

// Delete product
router.delete('/:id', authenticateToken, (req, res) => {
  db.run('DELETE FROM products WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      return res.status(400).json({ error: 'Error deleting product' });
    }
    res.json({ message: 'Product deleted successfully' });
  });
});

// Get low stock products
router.get('/alerts/low-stock', authenticateToken, (req, res) => {
  db.all(
    `SELECT * FROM products 
     WHERE (warehouse_stock + cashier_stock) <= min_stock_alert 
     ORDER BY (warehouse_stock + cashier_stock) ASC`,
    [],
    (err, products) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(products);
    }
  );
});

module.exports = router;
