// Supabase Configuration Template
const supabaseConfig = {
  url: 'https://your-project.supabase.co',
  anonKey: 'your-anon-key',
  serviceRoleKey: 'your-service-role-key',
  database: {
    host: 'db.your-project.supabase.co',
    port: 5432,
    database: 'postgres',
    username: 'postgres',
    password: 'your-password'
  }
};

module.exports = supabaseConfig;