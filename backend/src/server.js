
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const db = require('./config/db');

const {
  driver,
  verifyNeo4jConnection
} = require('./config/neo4j');

const authRoutes = require('./routes/authRoutes');
const donorRoutes = require('./routes/donorRoutes');
const bloodRequestRoutes = require('./routes/bloodRequestRoutes');
const matchRoutes = require('./routes/matchRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/donors', donorRoutes);
app.use('/api/requests', bloodRequestRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/inventory', inventoryRoutes);

// Health check
app.get('/api/health', async (req, res) => {
  let mysqlConnected = false;
  let neo4jConnected = false;

  try {
    await db.query('SELECT 1');
    mysqlConnected = true;
  } catch (error) {
    console.error('[MySQL] Health check failed:', error.message);
  }

  try {
    await verifyNeo4jConnection();
    neo4jConnected = true;
  } catch (error) {
    console.error('[Neo4j] Health check failed:', error.message);
  }

  const isHealthy = mysqlConnected && neo4jConnected;

  return res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'UP' : 'DOWN',
    message: 'LifeLink Backend API health check',
    mysql: mysqlConnected ? 'Connected' : 'Disconnected',
    neo4j: neo4jConnected ? 'Connected' : 'Disconnected'
  });
});

// Start server
const server = app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);

  try {
    await db.query('SELECT 1');
    console.log('[MySQL] Successfully connected to lifelink_db');
  } catch (error) {
    console.error('[MySQL] Connection failed:', error.message);
  }

  try {
    await verifyNeo4jConnection();
  } catch (error) {
    console.error('[Neo4j] Connection failed:', error.message);
  }
});

// Graceful shutdown
let isShuttingDown = false;

async function shutdown() {
  if (isShuttingDown) return;

  isShuttingDown = true;

  console.log('Shutting down LifeLink backend...');

  try {
    // Wait for HTTP server to finish handling requests
    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) reject(error);
        else resolve();
      });
    });

    // Close Neo4j and MySQL connections
    await driver.close();
    await db.end();

    console.log('Database connections closed successfully');

  } catch (error) {
    console.error('Shutdown error:', error.message);
    process.exitCode = 1;
  }
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
