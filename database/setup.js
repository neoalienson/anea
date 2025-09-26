const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'kol_platform',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password'
};

async function setupDatabase() {
  const client = new Client(dbConfig);
  
  try {
    await client.connect();
    console.log('Connected to PostgreSQL database');

    // Read and execute schema
    const schemaSQL = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await client.query(schemaSQL);
    console.log('Database schema created successfully');

    // Read and execute seed data
    const seedSQL = fs.readFileSync(path.join(__dirname, 'seed-data.sql'), 'utf8');
    await client.query(seedSQL);
    console.log('Mock data inserted successfully');

    console.log('\nDatabase setup completed!');
    console.log('Test users created:');
    console.log('- Business: techcorp@example.com (password: password123)');
    console.log('- KOL: techreviewer@example.com (password: password123)');
    console.log('- KOL: beautyguru@example.com (password: password123)');

  } catch (error) {
    console.error('Error setting up database:', error);
  } finally {
    await client.end();
  }
}

// Run setup if called directly
if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase };