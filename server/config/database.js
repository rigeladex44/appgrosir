const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// For serverless environments, use /tmp for writable database
const isVercel = process.env.VERCEL === '1';
const dbPath = isVercel 
  ? '/tmp/database.db'
  : path.join(__dirname, '../../database.db');

// Ensure directory exists
if (isVercel) {
  try {
    if (!fs.existsSync('/tmp')) {
      fs.mkdirSync('/tmp', { recursive: true });
    }
  } catch (err) {
    console.error('Error creating tmp directory:', err);
  }
}

let db = null;
let initializationError = null;

try {
  db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Error connecting to database:', err);
      initializationError = err;
    } else {
      console.log('Connected to SQLite database at:', dbPath);
    }
  });
} catch (err) {
  console.error('Failed to create database connection:', err);
  initializationError = err;
  // Create a dummy db object that will throw errors on use
  db = {
    run: () => { throw new Error('Database not initialized'); },
    get: () => { throw new Error('Database not initialized'); },
    all: () => { throw new Error('Database not initialized'); },
    serialize: () => { throw new Error('Database not initialized'); }
  };
}

function initializeDatabase() {
  if (!db || initializationError) {
    console.error('Cannot initialize database - connection failed');
    return;
  }
  
  db.serialize(() => {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('owner', 'manager', 'staff', 'cashier')),
    email TEXT,
    phone TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Products table
  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sku TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    unit TEXT NOT NULL,
    purchase_price REAL NOT NULL,
    selling_price REAL NOT NULL,
    warehouse_stock INTEGER DEFAULT 0,
    cashier_stock INTEGER DEFAULT 0,
    min_stock_alert INTEGER DEFAULT 10,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Stock movements table
  db.run(`CREATE TABLE IF NOT EXISTS stock_movements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('in', 'out', 'transfer', 'adjustment')),
    from_location TEXT CHECK(from_location IN ('warehouse', 'cashier', 'supplier', 'customer')),
    to_location TEXT CHECK(to_location IN ('warehouse', 'cashier', 'supplier', 'customer')),
    quantity INTEGER NOT NULL,
    reference TEXT,
    notes TEXT,
    user_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);

  // Sales table
  db.run(`CREATE TABLE IF NOT EXISTS sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_number TEXT UNIQUE NOT NULL,
    total_amount REAL NOT NULL,
    payment_method TEXT CHECK(payment_method IN ('cash', 'card', 'transfer', 'credit')),
    customer_name TEXT,
    cashier_id INTEGER NOT NULL,
    status TEXT DEFAULT 'completed',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cashier_id) REFERENCES users(id)
  )`);

  // Sales items table
  db.run(`CREATE TABLE IF NOT EXISTS sales_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sale_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price REAL NOT NULL,
    subtotal REAL NOT NULL,
    FOREIGN KEY (sale_id) REFERENCES sales(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
  )`);

  // Attendance table
  db.run(`CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    check_in DATETIME NOT NULL,
    check_out DATETIME,
    notes TEXT,
    status TEXT DEFAULT 'present',
    created_at DATE DEFAULT CURRENT_DATE,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);

  // Expenses table
  db.run(`CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL,
    amount REAL NOT NULL,
    description TEXT,
    user_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);

    // Create default admin user if not exists
    try {
      const bcrypt = require('bcryptjs');
      const defaultPassword = bcrypt.hashSync('admin123', 10);
      
      db.run(`INSERT OR IGNORE INTO users (username, password, full_name, role) 
              VALUES ('admin', ?, 'Administrator', 'owner')`, [defaultPassword], (err) => {
        if (err) {
          console.error('Error creating admin user:', err);
        } else {
          console.log('Database initialized successfully');
        }
      });
    } catch (err) {
      console.error('Error in database initialization:', err);
    }
  });
}

// Initialize database when module is loaded (non-blocking)
try {
  initializeDatabase();
} catch (err) {
  console.error('Database initialization failed:', err);
  initializationError = err;
}

module.exports = db;
