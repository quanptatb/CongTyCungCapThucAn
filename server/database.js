const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'catering.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Database connection error:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        initializeDatabase();
    }
});

function initializeDatabase() {
    db.serialize(() => {
        // Customers Table
        db.run(`CREATE TABLE IF NOT EXISTS customers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            contact TEXT
        )`);

        // Insert mock customer if empty
        db.get("SELECT COUNT(*) as count FROM customers", (err, row) => {
            if (row.count === 0) {
                db.run("INSERT INTO customers (name, contact) VALUES (?, ?)", ['Công Ty Samsung', '0123456789']);
                db.run("INSERT INTO customers (name, contact) VALUES (?, ?)", ['Công Ty LG', '0987654321']);
            }
        });

        // Orders Table
        db.run(`CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_id INTEGER,
            menu_id INTEGER,
            date TEXT NOT NULL,
            shift INTEGER NOT NULL, -- 1, 2, 3
            quantity INTEGER NOT NULL,
            status TEXT DEFAULT 'Pending', -- Pending, Completed
            FOREIGN KEY (customer_id) REFERENCES customers(id),
            FOREIGN KEY (menu_id) REFERENCES menu(id)
        )`);

        // Menu Items Table
        db.run(`CREATE TABLE IF NOT EXISTS menu (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            category TEXT,
            price REAL DEFAULT 0
        )`);

        // Ingredients Table (Recipe link)
        db.run(`CREATE TABLE IF NOT EXISTS ingredients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            menu_id INTEGER,
            item_name TEXT NOT NULL,
            amount_per_portion REAL NOT NULL, -- in grams/ml
            unit TEXT NOT NULL,
            FOREIGN KEY (menu_id) REFERENCES menu(id)
        )`);

        // Deliveries Table
        db.run(`CREATE TABLE IF NOT EXISTS deliveries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER,
            delivery_time TEXT,
            recipient_name TEXT,
            status TEXT DEFAULT 'Scheduled',
            FOREIGN KEY (order_id) REFERENCES orders(id)
        )`);

        // Seed some menu items and ingredients
        db.get("SELECT COUNT(*) as count FROM menu", (err, row) => {
            if (row.count === 0) {
                db.run("INSERT INTO menu (name, category, price) VALUES (?, ?, ?)", ['Cơm Sườn', 'Main', 35000], function(err) {
                    const menuId = this.lastID;
                    db.run("INSERT INTO ingredients (menu_id, item_name, amount_per_portion, unit) VALUES (?, ?, ?, ?)", [menuId, 'Gạo', 150, 'g']);
                    db.run("INSERT INTO ingredients (menu_id, item_name, amount_per_portion, unit) VALUES (?, ?, ?, ?)", [menuId, 'Sườn heo', 200, 'g']);
                });
                db.run("INSERT INTO menu (name, category, price) VALUES (?, ?, ?)", ['Cơm Gà', 'Main', 30000], function(err) {
                    const menuId = this.lastID;
                    db.run("INSERT INTO ingredients (menu_id, item_name, amount_per_portion, unit) VALUES (?, ?, ?, ?)", [menuId, 'Gạo', 150, 'g']);
                    db.run("INSERT INTO ingredients (menu_id, item_name, amount_per_portion, unit) VALUES (?, ?, ?, ?)", [menuId, 'Thịt gà', 150, 'g']);
                });
            }
        });
    });
}

module.exports = db;
