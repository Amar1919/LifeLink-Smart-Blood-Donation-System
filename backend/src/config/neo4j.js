
const neo4j = require("neo4j-driver");
require("dotenv").config();

const uri = process.env.NEO4J_URI;
const username = process.env.NEO4J_USERNAME;
const password = process.env.NEO4J_PASSWORD;
const database = process.env.NEO4J_DATABASE || "lifelink";

if (!uri || !username || !password) {
  throw new Error("Neo4j environment variables are missing");
}

const driver = neo4j.driver(
  uri,
  neo4j.auth.basic(username, password)
);

async function verifyNeo4jConnection() {
  await driver.verifyConnectivity();
  console.log(`[Neo4j] Successfully connected to ${database}`);
}

function getSession() {
  return driver.session({ database });
}

module.exports = {
  driver,
  getSession,
  verifyNeo4jConnection
};
