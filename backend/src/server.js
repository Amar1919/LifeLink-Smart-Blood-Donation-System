const express = require('express');
const cors = require('cors');
const db = require('./config/db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json());

// Enhanced Health Check Endpoint
app.get('/api/health', async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.status(200).json({ status: 'UP', message: 'LifeLink Backend API is running', database: 'Connected' });
  } catch (error) {
    console.error('DB Error:', error);
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
