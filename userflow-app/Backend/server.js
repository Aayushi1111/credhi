const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { OAuth2Client } = require('google-auth-library');
//const fileUpload = require('express-fileupload');
const path = require('path');
const axios = require('axios');


const app = express();
const port = process.env.PORT || 3001;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({
  origin: "http://localhost:3000",
  methods: ["POST", "GET"],
  credentials: true,
}));

const db = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: '',
  database: 'user_database',
});

const client = new OAuth2Client('iKuDQ9fOF5edd6h7NUSQd9Zw9oe9omhX');  //clientid google

db.connect((err) => {
  if (err) {
    console.error('MySQL connection error:', err);
    return;
  }
  console.log('MySQL Connected...');
});

const jwtSecret = 'your-default-secret-key'; 
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

app.post('/api/initiate-transaction', async (req, res) => {
  try {
    const lambdaResponse = await axios.post(
      'https://cbhxr5c6cnosoyw2gld5rtaza40mwtjc.lambda-url.ap-south-1.on.aws/',
      {
        bankStatementS3Location: req.body.bankStatementS3Location,
        S3Bucket: req.body.S3Bucket,
        bankName: req.body.bankName,
        bankStatementPassword: req.body.bankStatementPassword
      }
    );
    res.status(200).json(lambdaResponse.data);
  } catch (error) {
    if (error.response) {
      console.error('Error Response Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    res.status(500).json({ status: 'failure', message: 'Failed to process the transaction' });
  }
});



const transactionStatuses = {};

// API to update the transaction status from Lambda
app.post('/update-transaction-status', (req, res) => {
  const { transactionId, status } = req.body;
  if (!transactionId || !status) {
    return res.status(400).json({ success: false, message: 'Transaction ID and status are required' });
  }

  // Update the status in the in-memory store
  transactionStatuses[transactionId] = status;
  console.log(`Transaction ${transactionId} updated to ${status}`);

  res.json({ success: true });
});

// API to retrieve the current status of a transaction
app.get('/get-transaction-status/:transactionId', (req, res) => {
  const { transactionId } = req.params;
  const status = transactionStatuses[transactionId] || 'pending'; // Default to 'pending'
  res.json({ status });
});

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


const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post('/submit-transaction', authenticateToken, upload.array('documents'), async (req, res) => {
  const { transactionName, accountHolderName, employmentType, employerName, accountHolderAge, profession } = req.body;
  const username = req.user.username;

  if (!transactionName || !username) {
    return res.status(400).json({ message: 'Transaction name and username are required' });
  }

  const insertTransactionQuery = `
    INSERT INTO transactions (transaction_name, account_holder_name, employment_type, employer_name, account_holder_age, profession, username)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(insertTransactionQuery, [transactionName, accountHolderName || null, employmentType || null, employerName || null, accountHolderAge || null, profession || null, username], async (err, result) => {
    if (err) {
      console.error('Error inserting transaction:', err);
      return res.status(500).json({ message: 'Error submitting transaction' });
    }

    const transactionId = result.insertId;

    if (req.files.length > 0) {
      try {
        const uploadPromises = req.files.map(file => {
          const s3Params = {
            Bucket: 'myawsbucketforcredhi',
            Key: `${username}/${Date.now()}_${file.originalname}`,
            Body: file.buffer,
            ContentType: file.mimetype,
            ACL: 'private',
          };

          return s3.upload(s3Params).promise()
            .then(data => {
              const insertDocumentQuery = `
                INSERT INTO transaction_files (transaction_id, file_name, file_path)
                VALUES (?, ?, ?)
              `;

              return new Promise((resolve, reject) => {
                db.query(insertDocumentQuery, [transactionId, file.originalname, data.Location], (err, result) => {
                  if (err) {
                    console.error('Error inserting document:', err);
                    reject(err);
                  } else {
                    resolve(result);
                  }
                });
              });
            });
        });

        await Promise.all(uploadPromises);
        res.status(201).json({ message: 'Transaction submitted successfully with all documents', transaction_id: transactionId });
      } catch (error) {
        console.error('Error processing transaction:', error);
        res.status(500).json({ message: 'Error submitting transaction or uploading files' });
      }
    } else {
      res.status(201).json({ message: 'Transaction submitted successfully without documents', transaction_id: transactionId });
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