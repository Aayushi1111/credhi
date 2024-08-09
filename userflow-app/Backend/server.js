const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { OAuth2Client } = require('google-auth-library');
const fileUpload = require('express-fileupload');
const path = require('path');

const app = express();
const port = process.env.PORT || 3001;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({
  origin: "http://localhost:3000",
  methods: ["POST", "GET"],
  credentials: true,
}));
app.use(fileUpload({
  createParentPath: true
}));

const db = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: '',
  database: 'user_database',
});

const client = new OAuth2Client('iKuDQ9fOF5edd6h7NUSQd9Zw9oe9omhX'); // Replace with your actual Google Client ID

db.connect((err) => {
  if (err) {
    console.error('MySQL connection error:', err);
    return;
  }
  console.log('MySQL Connected...');
});

const jwtSecret = 'your-default-secret-key'; // Replace with your actual secret key
console.log('JWT Secret:', jwtSecret); // Debugging line

const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, username: user.username, email: user.email },
    jwtSecret,
    { expiresIn: '1h' }
  );
};

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  console.log('Token from authHeader:', token); // Debugging line

  if (!token) return res.sendStatus(401);

  jwt.verify(token, jwtSecret, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  console.log('Registering user:', username, email); // Debugging line
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
  console.log('Logging in user with email:', email); // Debugging line
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
        const token = generateAccessToken({ id: user.id, username: user.username, email: user.email });
        return res.status(200).json({ token, user: { id: user.id, username: user.username, email: user.email } });
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
  const token = req.body.token;
  if (!token) {
    return res.status(401).send('No token provided');
  }
  console.log('Google token:', token); // Debugging line

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: 'iKuDQ9fOF5edd6h7NUSQd9Zw9oe9omhX', // Replace with your actual Google Client ID
    });
    const payload = ticket.getPayload();
    const user = {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
    };

    console.log('Google login user:', user); // Debugging line

    // Check if the user already exists in the database
    const sql = 'SELECT * FROM register WHERE email = ?';
    db.query(sql, [user.email], (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).send('Error logging in with Google');
      }

      if (results.length === 0) {
        // If the user doesn't exist, insert the user into the database
        const insertSql = 'INSERT INTO register (username, email) VALUES (?, ?)';
        db.query(insertSql, [user.name, user.email], (err, result) => {
          if (err) {
            console.error('Error inserting user into database:', err);
            return res.status(500).send('Error registering user with Google');
          }
        });
      }

      // Generate JWT token
      const accessToken = generateAccessToken({ id: user.id, username: user.name, email: user.email });
      res.status(200).json({ token: accessToken, user: { id: user.id, username: user.name, email: user.email } });
    });
  } catch (error) {
    console.error('Error verifying Google ID token:', error);
    res.status(403).send('Failed to authenticate token');
  }
});

app.post('/submit-transaction', authenticateToken, (req, res) => {
  const {
    transactionName,
    accountHolderName,
    employmentType,
    employerName,
    accountHolderAge,
    profession,
  } = req.body;

  const username = req.user.username;
  console.log('Submitting transaction for user:', username); 

  if (!username) {
    return res.status(400).send('Username is missing');
  }

  // Log the entire request body to inspect it
  console.log('Request body:', req.body);
  console.log('Request files:', req.files);

  // Check if files were received
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No files were uploaded.');
  }

  const documents = Array.isArray(req.files.documents) ? req.files.documents : [req.files.documents];
  console.log('Documents array:', documents);

  const insertTransaction = `INSERT INTO transactions (transaction_name, account_holder_name, employment_type, employer_name, account_holder_age, profession, username) VALUES (?, ?, ?, ?, ?, ?, ?)`;

  db.query(insertTransaction, [transactionName, accountHolderName || null, employmentType || null, employerName || null, accountHolderAge || null, profession || null, username], (err, result) => {
    if (err) {
      console.error('Error inserting transaction into database:', err);
      return res.status(500).send('Error submitting transaction');
    }

    const transactionId = result.insertId;
    console.log('Inserted transaction ID:', transactionId); 

    if (documents.length > 0) {
      let documentErrors = [];
      let completedUploads = 0;

      documents.forEach((document, index) => {
        const documentPath = path.join(__dirname, 'uploads', `${transactionId}_${index}_${document.name}`);
        console.log('Saving document to:', documentPath);

        document.mv(documentPath, (err) => {
          if (err) {
            console.error('Error saving document:', err);
            documentErrors.push(err);
          } else {
            const insertDocument = 'INSERT INTO transaction_files (transaction_id, file_name, file_path) VALUES (?, ?, ?)';
            db.query(insertDocument, [transactionId, document.name, documentPath], (err, result) => {
              if (err) {
                console.error('Error inserting document into database:', err);
                documentErrors.push(err);
              } else {
                console.log('Document inserted into database:', document.name);
              }

              completedUploads++;
              if (completedUploads === documents.length) {
                if (documentErrors.length > 0) {
                  console.error('Document errors:', documentErrors);
                  return res.status(500).send('Error submitting some documents');
                } else {
                  res.status(201).send('Transaction submitted with all documents');
                }
              }
            });
          }
        });
      });

    } else {
      res.status(201).send('Transaction submitted without documents');
    }
  });
});
app.get('/download-document/:id', (req, res) => {
  const { id } = req.params;

  const sql = 'SELECT file_path FROM transaction_files WHERE id = ?';
  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).send('Error retrieving document');
    }

    if (results.length === 0) {
      return res.status(404).send('Document not found');
    }

    const filePath = results[0].file_path;
    res.sendFile(filePath, { root: __dirname }, (err) => {
      if (err) {
        console.error('Error sending file:', err);
        res.status(500).send('Error sending file');
      }
    });
  });
});



app.get('/previous-transactions', authenticateToken, (req, res) => {
  const username = req.user.username; // Use the username from the token
  console.log('Fetching previous transactions for user:', username); // Debugging line

  const sql = 'SELECT * FROM transactions WHERE username = ?';
  db.query(sql, [username], (err, transactionResults) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error', details: err });
    }

    const transactionIds = transactionResults.map(transaction => transaction.id);
    if (transactionIds.length === 0) {
      return res.status(200).json(transactionResults);
    }

    const documentSql = 'SELECT * FROM transaction_files WHERE transaction_id IN (?)';
    db.query(documentSql, [transactionIds], (err, documentResults) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error', details: err });
      }

      const transactionsWithDocuments = transactionResults.map(transaction => {
        const documents = documentResults.filter(doc => doc.transaction_id === transaction.id);
        return { ...transaction, documents };
      });

      res.status(200).json(transactionsWithDocuments);
    });
  });
});


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
