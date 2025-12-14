const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Get dashboard statistics
router.get('/stats', authenticateToken, (req, res) => {
  const stats = {};

  // Get total products
  db.get('SELECT COUNT(*) as count FROM products', [], (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    stats.total_products = result.count;

    // Get low stock products
    db.get(
      'SELECT COUNT(*) as count FROM products WHERE (warehouse_stock + cashier_stock) <= min_stock_alert',
      [],
      (err, result) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        stats.low_stock_products = result.count;

        // Get today's sales
        db.get(
          'SELECT COUNT(*) as count, COALESCE(SUM(total_amount), 0) as total FROM sales WHERE DATE(created_at) = DATE("now")',
          [],
          (err, result) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            stats.today_sales_count = result.count;
            stats.today_sales_total = result.total;

            // Get this month's sales
            db.get(
              `SELECT COUNT(*) as count, COALESCE(SUM(total_amount), 0) as total 
               FROM sales 
               WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')`,
              [],
              (err, result) => {
                if (err) return res.status(500).json({ error: 'Database error' });
                stats.month_sales_count = result.count;
                stats.month_sales_total = result.total;

                // Get today's attendance
                db.get(
                  'SELECT COUNT(*) as count FROM attendance WHERE DATE(created_at) = DATE("now")',
                  [],
                  (err, result) => {
                    if (err) return res.status(500).json({ error: 'Database error' });
                    stats.today_attendance = result.count;

                    // Get total users
                    db.get('SELECT COUNT(*) as count FROM users', [], (err, result) => {
                      if (err) return res.status(500).json({ error: 'Database error' });
                      stats.total_users = result.count;

                      res.json(stats);
                    });
                  }
                );
              }
            );
          }
        );
      }
    );
  });
});

// Get profit/loss report
router.get('/profit-loss', authenticateToken, (req, res) => {
  const { start_date, end_date } = req.query;
  
  let dateCondition = '';
  let params = [];

  if (start_date && end_date) {
    dateCondition = 'WHERE DATE(s.created_at) BETWEEN ? AND ?';
    params = [start_date, end_date];
  } else {
    dateCondition = `WHERE strftime('%Y-%m', s.created_at) = strftime('%Y-%m', 'now')`;
  }

  // Calculate revenue from sales
  db.get(
    `SELECT 
       COALESCE(SUM(si.quantity * si.unit_price), 0) as total_revenue,
       COALESCE(SUM(si.quantity * p.purchase_price), 0) as total_cost
     FROM sales s
     JOIN sales_items si ON s.id = si.sale_id
     JOIN products p ON si.product_id = p.id
     ${dateCondition}`,
    params,
    (err, salesData) => {
      if (err) return res.status(500).json({ error: 'Database error' });

      // Get expenses
      const expenseCondition = dateCondition.replace('s.created_at', 'created_at');
      db.get(
        `SELECT COALESCE(SUM(amount), 0) as total_expenses
         FROM expenses
         ${expenseCondition}`,
        params,
        (err, expenseData) => {
          if (err) return res.status(500).json({ error: 'Database error' });

          const grossProfit = salesData.total_revenue - salesData.total_cost;
          const netProfit = grossProfit - expenseData.total_expenses;

          res.json({
            revenue: salesData.total_revenue,
            cost_of_goods: salesData.total_cost,
            gross_profit: grossProfit,
            expenses: expenseData.total_expenses,
            net_profit: netProfit,
            profit_margin: salesData.total_revenue > 0 
              ? ((netProfit / salesData.total_revenue) * 100).toFixed(2) 
              : 0
          });
        }
      );
    }
  );
});

// Get recent activities
router.get('/recent-activities', authenticateToken, (req, res) => {
  db.all(
    `SELECT 
       'sale' as type,
       s.invoice_number as reference,
       s.total_amount as amount,
       u.full_name as user_name,
       s.created_at
     FROM sales s
     JOIN users u ON s.cashier_id = u.id
     UNION ALL
     SELECT 
       'stock_movement' as type,
       sm.type || ' - ' || p.name as reference,
       sm.quantity as amount,
       u.full_name as user_name,
       sm.created_at
     FROM stock_movements sm
     JOIN products p ON sm.product_id = p.id
     JOIN users u ON sm.user_id = u.id
     ORDER BY created_at DESC
     LIMIT 20`,
    [],
    (err, activities) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json(activities);
    }
  );
});

module.exports = router;
