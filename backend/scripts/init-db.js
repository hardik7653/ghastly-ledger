/**
 * Database initialization script
 * Run this to manually initialize the database
 */

const { initializeDatabase } = require('../database/init');

console.log('Initializing database...');
initializeDatabase();
console.log('Database initialization complete!');
