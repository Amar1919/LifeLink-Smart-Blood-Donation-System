const express = require('express');
const cors = require('cors');
const db = require('./config/db');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const donorRoutes = require('./routes/donorRoutes');
const bloodRequestRoutes = require('./routes/bloodRequestRoutes');
const matchRoutes = require('./routes/matchRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/donors', donorRoutes);
app.use('/api/requests', bloodRequestRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/inventory', inventoryRoutes);

app.get('/api/health', async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.status(200).json({ status: 'UP', message: 'LifeLink Backend API is running', database: 'Connected' });
  } catch (error) {
    res.status(500).json({ status: 'DOWN', message: 'Database connection failed' });
  }
});

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  try {
    await db.query('SELECT 1');
    console.log('[MySQL] Successfully connected to lifelink_db');
  } catch (error) {
    console.error('[MySQL] Connection failed:', error.message);
  }
});
