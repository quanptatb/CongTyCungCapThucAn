const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./database');

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());

// Get all customers
app.get('/api/customers', (req, res) => {
    db.all("SELECT * FROM customers", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Create customer
app.post('/api/customers', (req, res) => {
    const { name, contact } = req.body;
    db.run("INSERT INTO customers (name, contact) VALUES (?, ?)", [name, contact], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, name, contact });
    });
});

// Update customer
app.put('/api/customers/:id', (req, res) => {
    const { name, contact } = req.body;
    db.run("UPDATE customers SET name = ?, contact = ? WHERE id = ?", [name, contact, req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// Delete customer
app.delete('/api/customers/:id', (req, res) => {
    db.run("DELETE FROM customers WHERE id = ?", [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// Get all orders with customer names
app.get('/api/orders', (req, res) => {
    const { date, month, year } = req.query;
    let query = `
        SELECT o.*, c.name as customer_name 
        FROM orders o 
        JOIN customers c ON o.customer_id = c.id
    `;
    let params = [];

    if (date) {
        query += " WHERE o.date = ?";
        params.push(date);
    } else if (month && year) {
        query += " WHERE strftime('%m', o.date) = ? AND strftime('%Y', o.date) = ?";
        params.push(month.padStart(2, '0'));
        params.push(year);
    }

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Create a new order
app.post('/api/orders', (req, res) => {
    const { customer_id, date, shift, quantity } = req.body;
    if (!customer_id || !date || !shift || !quantity) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const query = "INSERT INTO orders (customer_id, date, shift, quantity) VALUES (?, ?, ?, ?)";
    db.run(query, [customer_id, date, shift, quantity], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, customer_id, date, shift, quantity, status: 'Pending' });
    });
});

// Generate shopping list for a date/shift range
app.get('/api/shopping-list', (req, res) => {
    const { date } = req.query;
    if (!date) return res.status(400).json({ error: "Date is required" });

    // For simplicity, we assume all orders for that date use a standard recipe ratio
    // In a real app, you'd link specific orders to specific menu items
    const query = `
        SELECT i.item_name, SUM(o.quantity * i.amount_per_portion) as total_amount, i.unit
        FROM orders o
        CROSS JOIN ingredients i
        WHERE o.date = ?
        GROUP BY i.item_name
    `;
    
    db.all(query, [date], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Menu Management
app.get('/api/menu', (req, res) => {
    db.all("SELECT * FROM menu", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/menu', (req, res) => {
    const { name, category } = req.body;
    db.run("INSERT INTO menu (name, category) VALUES (?, ?)", [name, category], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, name, category });
    });
});

app.delete('/api/menu/:id', (req, res) => {
    db.run("DELETE FROM menu WHERE id = ?", [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// Ingredients (Recipe) Management
app.get('/api/menu/:id/ingredients', (req, res) => {
    db.all("SELECT * FROM ingredients WHERE menu_id = ?", [req.params.id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/menu/:id/ingredients', (req, res) => {
    const { item_name, amount_per_portion, unit } = req.body;
    db.run("INSERT INTO ingredients (menu_id, item_name, amount_per_portion, unit) VALUES (?, ?, ?, ?)", 
        [req.params.id, item_name, amount_per_portion, unit], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID });
    });
});

app.delete('/api/ingredients/:id', (req, res) => {
    db.run("DELETE FROM ingredients WHERE id = ?", [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// Update delivery status
app.post('/api/delivery', (req, res) => {
    const { order_id, delivery_time, recipient_name, status } = req.body;
    const query = "INSERT INTO deliveries (order_id, delivery_time, recipient_name, status) VALUES (?, ?, ?, ?)";
    db.run(query, [order_id, delivery_time, recipient_name, status], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID });
    });
});

app.listen(port, () => {
    console.log(`Catering Server running at http://localhost:${port}`);
});
