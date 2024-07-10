const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const cors = require('cors');
const { OAuth2Client } = require('google-auth-library');
const fileUpload = require('express-fileupload');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({
  origin: "http://localhost:3000",
  methods: ["POST", "GET"],
  credentials: true,
}));
app.use(fileUpload({
  createParentPath: true // This will create the upload directory if it does not exist
}));

const db = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: '',
  database: 'user_database',
});

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

db.connect((err) => {
  if (err) throw err;
  console.log('MySQL Connected...');
});

app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = 'INSERT INTO register (username, email, password) VALUES (?, ?, ?)';
    db.query(sql, [username, email, hashedPassword], (err, result) => {
      if (err) {
        console.error('Error inserting user into database:', err);
        return res.status(500).send('Error registering user');
      }
      res.status(201).send('User registered');
    });
  } catch (error) {
    console.error('Error hashing password:', error);
    res.status(500).send('Error registering user');
  }
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const sql = 'SELECT * FROM register WHERE email = ?';
  db.query(sql, [email], async (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).send('Error logging in');
    }
    if (results.length === 0) {
      console.log('No user found with this email');
      return res.status(401).send('Invalid email or password');
    }
    const user = results[0];

    try {
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        return res.status(200).json({ user: { id: user.id, username: user.username, email: user.email } });
      } else {
        console.log('Invalid password for user:', email);
        return res.status(401).send('Invalid email or password');
      }
    } catch (error) {
      console.error('Error comparing passwords:', error);
      return res.status(500).send('Error logging in');
    }
  });
});

app.post('/google-login', async (req, res) => {
  const token = req.body.token || req.headers['authorization'];
  if (!token) {
    return res.status(401).send('No token provided');
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const user = {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
    };
    res.status(200).json({ user });
  } catch (error) {
    console.error('Error verifying Google ID token:', error);
    res.status(403).send('Failed to authenticate token');
  }
});

app.post('/submit-transaction', (req, res) => {
  const {
    transactionName,
    accountHolderName,
    employmentType,
    employerName,
    accountHolderAge,
    profession,
  } = req.body;

  console.log("Transaction request body:", req.body);

  const documents = req.files ? req.files.documents : [];

  const insertTransaction = `INSERT INTO transactions (transaction_name, account_holder_name, employment_type, employer_name, account_holder_age, profession) VALUES (?, ?, ?, ?, ?, ?)`;

  db.query(insertTransaction, [transactionName, accountHolderName || null, employmentType || null, employerName || null, accountHolderAge || null, profession || null], (err, result) => {
    if (err) {
      console.error('Error inserting transaction into database:', err);
      return res.status(500).send('Error submitting transaction');
    }

    if (!result || !result.insertId) {
      console.error('No insertId found in the result:', result);
      return res.status(500).send('Error submitting transaction');
    }

    const transactionId = result.insertId;

    if (documents && documents.length > 0) {
      documents.forEach((document, index) => {
        const documentPath = path.join(__dirname, 'uploads', `${transactionId}_${index}_${document.name}`);
        document.mv(documentPath, (err) => {
          if (err) {
            console.error('Error saving document:', err);
            return res.status(500).send('Error submitting transaction');
          }
        });
      });
    }

    res.status(201).send('Transaction submitted');
  });
});

app.get('/previous-transactions', (req, res) => {
  const sql = 'SELECT * FROM transactions';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error', details: err });
    }
    console.log(`Transactions fetched: ${results.length}`);
    res.status(200).json(results);
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
