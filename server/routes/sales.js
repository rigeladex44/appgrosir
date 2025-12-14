const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Get all sales
router.get('/', authenticateToken, (req, res) => {
  const { start_date, end_date } = req.query;
  
  let query = `SELECT s.*, u.full_name as cashier_name
               FROM sales s
               JOIN users u ON s.cashier_id = u.id`;
  let params = [];

  if (start_date && end_date) {
    query += ` WHERE DATE(s.created_at) BETWEEN ? AND ?`;
    params = [start_date, end_date];
  }

  query += ` ORDER BY s.created_at DESC LIMIT 100`;

  db.all(query, params, (err, sales) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(sales);
  });
});

// Get single sale with items
router.get('/:id', authenticateToken, (req, res) => {
  db.get(
    `SELECT s.*, u.full_name as cashier_name
     FROM sales s
     JOIN users u ON s.cashier_id = u.id
     WHERE s.id = ?`,
    [req.params.id],
    (err, sale) => {
      if (err || !sale) {
        return res.status(404).json({ error: 'Sale not found' });
      }

      db.all(
        `SELECT si.*, p.name as product_name, p.sku
         FROM sales_items si
         JOIN products p ON si.product_id = p.id
         WHERE si.sale_id = ?`,
        [req.params.id],
        (err, items) => {
          if (err) {
            return res.status(500).json({ error: 'Database error' });
          }
          sale.items = items;
          res.json(sale);
        }
      );
    }
  );
});

// Create sale
router.post('/', authenticateToken, (req, res) => {
  const { items, payment_method, customer_name } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'No items in sale' });
  }

  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    // Generate invoice number
    const invoiceNumber = `INV-${Date.now()}`;
    const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);

    // Create sale
    db.run(
      `INSERT INTO sales (invoice_number, total_amount, payment_method, customer_name, cashier_id)
       VALUES (?, ?, ?, ?, ?)`,
      [invoiceNumber, totalAmount, payment_method, customer_name, req.user.id],
      function(err) {
        if (err) {
          db.run('ROLLBACK');
          return res.status(500).json({ error: 'Error creating sale' });
        }

        const saleId = this.lastID;
        let completed = 0;
        let hasError = false;

        items.forEach((item) => {
          // Insert sale item
          db.run(
            `INSERT INTO sales_items (sale_id, product_id, quantity, unit_price, subtotal)
             VALUES (?, ?, ?, ?, ?)`,
            [saleId, item.product_id, item.quantity, item.unit_price, item.subtotal],
            (err) => {
              if (err && !hasError) {
                hasError = true;
                db.run('ROLLBACK');
                return res.status(500).json({ error: 'Error creating sale item' });
              }

              // Update cashier stock
              db.run(
                `UPDATE products 
                 SET cashier_stock = cashier_stock - ?
                 WHERE id = ?`,
                [item.quantity, item.product_id],
                (err) => {
                  if (err && !hasError) {
                    hasError = true;
                    db.run('ROLLBACK');
                    return res.status(500).json({ error: 'Error updating stock' });
                  }

                  // Record stock movement
                  db.run(
                    `INSERT INTO stock_movements (product_id, type, from_location, to_location, quantity, reference, user_id)
                     VALUES (?, 'out', 'cashier', 'customer', ?, ?, ?)`,
                    [item.product_id, item.quantity, invoiceNumber, req.user.id],
                    (err) => {
                      if (err && !hasError) {
                        hasError = true;
                        db.run('ROLLBACK');
                        return res.status(500).json({ error: 'Error recording movement' });
                      }

                      completed++;
                      if (completed === items.length && !hasError) {
                        db.run('COMMIT');
                        res.json({
                          message: 'Sale completed successfully',
                          sale_id: saleId,
                          invoice_number: invoiceNumber,
                          total_amount: totalAmount
                        });
                      }
                    }
                  );
                }
              );
            }
          );
        });
      }
    );
  });
});

module.exports = router;
