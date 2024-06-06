const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const app = express();
app.use(bodyParser.json());

// MySQL connection setup
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'mysql', // replace with your MySQL password
    database: 'user_database'
});

db.connect((err) => {
    if (err) throw err;
    console.log('MySQL connected...');
});

// User registration
app.post('/register', (req, res) => {
    const { username, email, password } = req.body;

    // Hash the password
    bcrypt.hash(password, 10, (err, hash) => {
        if (err) throw err;
        // Store hashed password
        const sql = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
        db.query(sql, [username, email, hash], (err, result) => {
            if (err) throw err;
            res.send('User registered');
        });
    });
});

// User login
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    const sql = 'SELECT * FROM users WHERE email = ?';
    db.query(sql, [email], (err, results) => {
        if (err) throw err;
        if (results.length > 0) {
            // Compare the password
            bcrypt.compare(password, results[0].password, (err, isMatch) => {
                if (err) throw err;
                if (isMatch) {
                    // Generate JWT token
                    const token = jwt.sign({ id: results[0].id }, 'your_jwt_secret', { expiresIn: '1h' });
                    res.json({ token });
                } else {
                    res.status(401).send('Password incorrect');
                }
            });
        } else {
            res.status(404).send('User not found');
        }
    });
});

// Middleware to protect routes
const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).send('Access Denied');

    try {
        const verified = jwt.verify(token, 'your_jwt_secret');
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).send('Invalid Token');
    }
};

// Protected route
app.get('/dashboard', authenticateToken, (req, res) => {
    res.send('Welcome to the dashboard');
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
