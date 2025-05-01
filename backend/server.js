const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt'); // For password hashing
const jwt = require('jsonwebtoken'); // For creating JWTs
const stripe = require('stripe')('');
const app = express();
const port = 5001;

// Secret key for JWT (keep this secure and in an environment variable in production)
const JWT_SECRET = 'your-super-secret-key';

// Enable CORS
const corsOptions = {
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'], // Add Authorization header
};
app.use(cors(corsOptions));

// Middleware to parse JSON request bodies
app.use(express.json());

// Initialize the database
const db = new sqlite3.Database('./journal.db', (err) => {
  if (err) {
    console.error('Could not connect to the database', err);
    throw err;
  }
  console.log('Connected to the journal database.');
  db.run(`
    CREATE TABLE IF NOT EXISTS entries (
      id TEXT PRIMARY KEY,
      text TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      tags TEXT DEFAULT ''
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      displayName TEXT,
      theme TEXT DEFAULT 'dark',
      notificationsEnabled INTEGER DEFAULT 1,
      preferredLanguage TEXT DEFAULT 'en',
      fontSize TEXT DEFAULT 'medium'
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      summary TEXT,
      content TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.all("PRAGMA table_info(users)", [], (err, rows) => {
    if (err) {
      console.error("Error getting table info:", err.message);
      return;
    }
    const columns = rows ? rows.map(columnInfo => columnInfo.name) : [];

    const addColumnIfNotExists = (columnName, columnDefinition) => {
      if (!columns.includes(columnName)) {
        db.run(`ALTER TABLE users ADD COLUMN ${columnName} ${columnDefinition}`, (err) => {
          if (err) {
            console.error(`Error adding column ${columnName}:`, err.message);
          } else {
            console.log(`Column ${columnName} added successfully.`);
          }
        });
      } else {
        console.log(`Column ${columnName} already exists.`);
      }
    };

    addColumnIfNotExists('displayName', 'TEXT');
    addColumnIfNotExists('theme', 'TEXT DEFAULT \'dark\'');
    addColumnIfNotExists('notificationsEnabled', 'INTEGER DEFAULT 1');
    addColumnIfNotExists('preferredLanguage', 'TEXT DEFAULT \'en\'');
    addColumnIfNotExists('fontSize', 'TEXT DEFAULT \'medium\'');
  });
});

// JWT Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403); // Invalid token
    req.user = user;
    next();
  });
};

// --- Authentication Routes ---

// User Registration
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], function(err) {
      if (err) {
        if (err.code === 'SQLITE_CONSTRAINT' && err.message.includes('UNIQUE constraint failed: users.username')) {
          return res.status(409).json({ error: 'Username already exists.' });
        }
        console.error(err.message);
        return res.status(500).json({ error: 'Failed to register user.' });
      }
      const userId = this.lastID;
      const token = jwt.sign({ userId, username }, JWT_SECRET, { expiresIn: '1h' }); // Token expires in 1 hour
      res.status(201).json({ message: 'User registered successfully', token });
    });
  } catch (error) {
    console.error('Error hashing password:', error);
    res.status(500).json({ error: 'Failed to register user.' });
  }
});

// User Login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  db.get('SELECT id, username, password FROM users WHERE username = ?', [username], async (err, user) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: 'Failed to login.' });
    }
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }
    try {
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (passwordMatch) {
        const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ message: 'Login successful', token });
      } else {
        res.status(401).json({ error: 'Invalid credentials.' });
      }
    } catch (error) {
      console.error('Error comparing passwords:', error);
      res.status(500).json({ error: 'Failed to login.' });
    }
  });
});

// --- User Settings Routes ---

// GET user settings (protected)
app.get('/api/settings', authenticateToken, (req, res) => {
  db.get('SELECT displayName, theme, notificationsEnabled, preferredLanguage, fontSize FROM users WHERE id = ?', [req.user.userId], (err, row) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: 'Failed to retrieve user settings.' });
    }
    if (row) {
      res.json(row);
    } else {
      res.status(404).json({ error: 'User settings not found.' });
    }
  });
});

// POST user settings (protected)
app.post('/api/settings', authenticateToken, (req, res) => {
  const { displayName, theme, notificationsEnabled, preferredLanguage, fontSize } = req.body;
  const userId = req.user.userId;
  db.run(
    `UPDATE users SET displayName = ?, theme = ?, notificationsEnabled = ?, preferredLanguage = ?, fontSize = ? WHERE id = ?`,
    [displayName, theme, notificationsEnabled ? 1 : 0, preferredLanguage, fontSize, userId],
    function(err) {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ error: 'Failed to save user settings.' });
      }
      if (this.changes > 0) {
        res.json({ message: 'User settings saved successfully.' });
      } else {
        res.status(404).json({ error: 'User not found or settings not updated.' });
      }
    }
  );
});

// DELETE user account (protected)
app.delete('/api/account', authenticateToken, (req, res) => {
  const userId = req.user.userId;

  // First, delete associated journal entries (optional, depending on your needs)
  db.run('DELETE FROM entries WHERE userId = ?', [userId], function(err) {
    if (err) {
      console.error('Error deleting journal entries:', err.message);
      // Optionally, you might want to handle this differently (e.g., still delete the user)
    }
    // Then, delete the user account
    db.run('DELETE FROM users WHERE id = ?', [userId], function(err) {
      if (err) {
        console.error('Error deleting user account:', err.message);
        return res.status(500).json({ error: 'Failed to delete account.' });
      }
      if (this.changes > 0) {
        res.json({ message: 'Account deleted successfully.' });
      } else {
        res.status(404).json({ error: 'User account not found.' });
      }
    });
  });
});

// --- Journal Routes ---

// GET all journal entries (protected)
app.get('/api/journal', authenticateToken, (req, res) => {
  db.all('SELECT id, text, timestamp, tags FROM entries ORDER BY timestamp DESC', [], (err, rows) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: 'Failed to retrieve journal entries.' });
    }
    const entriesWithTagsArray = rows.map(row => ({ ...row, tags: row.tags ? row.tags.split(',') : [] }));
    res.json(entriesWithTagsArray);
  });
});

// POST a new journal entry (protected)
app.post('/api/journal', authenticateToken, (req, res) => {
  const { text, tags } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'Text content is required.' });
  }
  const id = uuidv4();
  const tagsString = Array.isArray(tags) ? tags.join(',') : '';
  db.run('INSERT INTO entries (id, text, tags, userId) VALUES (?, ?, ?, ?)', [id, text, tagsString, req.user.userId], function(err) {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: 'Failed to add new journal entry.' });
    }
    db.get('SELECT id, text, timestamp, tags FROM entries WHERE id = ?', [id], (err, row) => {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ error: 'Failed to retrieve the newly added entry.' });
      }
      res.status(201).json(row);
    });
  });
});

// PUT (update) a journal entry (protected)
app.put('/api/journal/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { text, tags } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'Text content is required for updating.' });
  }
  const tagsString = Array.isArray(tags) ? tags.join(',') : '';
  db.run('UPDATE entries SET text = ?, tags = ? WHERE id = ? AND userId = ?', [text, tagsString, id, req.user.userId], function(err) {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: `Failed to update entry with ID ${id}.` });
    }
    if (this.changes > 0) {
      db.get('SELECT id, text, timestamp, tags FROM entries WHERE id = ?', [id], (err, row) => {
        if (err) {
          console.error(err.message);
          return res.status(500).json({ error: 'Failed to retrieve the updated entry.' });
        }
        res.json(row);
      });
    } else {
      res.status(404).json({ error: `Entry with ID ${id} not found or does not belong to the user.` });
    }
  });
});

// DELETE a journal entry (protected)
app.delete('/api/journal/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM entries WHERE id = ? AND userId = ?', [id, req.user.userId], function(err) {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: `Failed to delete entry with ID ${id}.` });
    }
    if (this.changes > 0) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: `Entry with ID ${id} not found or does not belong to the user.` });
    }
  });
});

// Donate endpoint (no authentication required for donations in this basic example)
app.post('/api/donate', async (req, res) => {
  const { amount, paymentMethodId } = req.body;

  if (!amount || !paymentMethodId) {
    return res.status(400).json({ error: 'Amount and payment method ID are required.' });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'usd',
      payment_method: paymentMethodId,
      confirm: true,
    });

    console.log('PaymentIntent:', paymentIntent);

    if (paymentIntent.status === 'succeeded') {
      res.json({ success: true });
      // Optionally store donation info in the database (consider user association if logged in)
    } else {
      res.status(400).json({ error: 'Payment failed.' });
    }
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: 'Failed to process donation.' });
  }
});

// --- Articles Route ---

// GET all articles (protected)
app.get('/api/articles', authenticateToken, async (req, res) => {
  try {
    db.all('SELECT id, title, summary FROM articles ORDER BY createdAt DESC', [], (err, rows) => {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ error: 'Failed to retrieve articles.' });
      }
      res.json(rows);
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({ error: 'Failed to retrieve articles.' });
  }
});

app.get('/api/articles/:id', authenticateToken, async (req, res) => {
  const articleId = req.params.id;

  try {
    db.get('SELECT id, title, content, createdAt FROM articles WHERE id = ?', [articleId], (err, row) => {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ error: 'Failed to retrieve article.' });
      }
      if (row) {
        res.json(row); // Send the article data as JSON
      } else {
        res.status(404).json({ error: 'Article not found.' });
      }
    });
  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(500).json({ error: 'Failed to retrieve article.' });
  }
});

app.delete('/api/articles/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    db.run('DELETE FROM articles WHERE id = ?', [id], function(err) {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ error: `Failed to delete article with ID ${id}.` });
      }
      if (this.changes > 0) {
        res.status(204).send(); // 204 No Content for successful deletion
      } else {
        res.status(404).json({ error: `Article with ID ${id} not found.` });
      }
    });
  } catch (error) {
    console.error(`Error deleting article with ID ${id}:`, error);
    res.status(500).json({ error: `Failed to delete article with ID ${id}.` });
  }
});


// POST a new article (protected)
app.post('/api/articles', authenticateToken, async (req, res) => {
  const { title, summary, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required.' });
  }

  try {
    db.run(
      'INSERT INTO articles (title, summary, content) VALUES (?, ?, ?)',
      [title, summary, content],
      function(err) {
        if (err) {
          console.error(err.message);
          return res.status(500).json({ error: 'Failed to create new article.' });
        }
        const articleId = this.lastID;
        res.status(201).json({ message: 'Article created successfully', id: articleId });
      }
    );
  } catch (error) {
    console.error('Error creating article:', error);
    res.status(500).json({ error: 'Failed to create new article.' });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port} with SQLite, Stripe, and Authentication.`);
});