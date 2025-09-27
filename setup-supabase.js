require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  try {
    const schema = fs.readFileSync('./supabase/migrations/20241227_initial_schema.sql', 'utf8');
    console.log('Setting up database schema...');
    
    // Note: This requires service role key with proper permissions
    const { data, error } = await supabase.rpc('exec_sql', { sql: schema });
    
    if (error) {
      console.error('Error setting up database:', error);
    } else {
      console.log('Database schema created successfully');
    }
  } catch (err) {
    console.error('Setup failed:', err.message);
  }
}

setupDatabase();