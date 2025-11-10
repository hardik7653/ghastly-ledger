/**
 * Database initialization and schema setup
 * Creates SQLite database with necessary tables
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DATABASE_PATH || path.join(__dirname, '..', 'database.sqlite');

function initializeDatabase() {
  // Ensure database directory exists
  const dbDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL'); // Enable Write-Ahead Logging for better concurrency

  // Create cases table
  db.exec(`
    CREATE TABLE IF NOT EXISTS cases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      mistakes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create targets table
  db.exec(`
    CREATE TABLE IF NOT EXISTS targets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      plan TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create media table for images
  db.exec(`
    CREATE TABLE IF NOT EXISTS media (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_type TEXT NOT NULL CHECK(item_type IN ('case', 'target')),
      item_id INTEGER NOT NULL,
      filename TEXT NOT NULL,
      thumbnail_filename TEXT NOT NULL,
      original_name TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create indexes for better query performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_media_item ON media(item_type, item_id);
    CREATE INDEX IF NOT EXISTS idx_cases_created ON cases(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_targets_created ON targets(created_at DESC);
  `);

  console.log('✓ Database initialized successfully');
  db.close();
}

function getDatabase() {
  return new Database(DB_PATH);
}

module.exports = { initializeDatabase, getDatabase };
