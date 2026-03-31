const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load .env from backend
dotenv.config({ path: path.join(__dirname, 'backend', '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  console.log('Checking questions table...');
  const { data, error } = await supabase.from('questions').select('*').limit(1);
  if (error) {
    console.error('Error fetching questions:', error);
  } else {
    console.log('Question Columns:', Object.keys(data[0] || {}));
  }

  console.log('Checking experiences table...');
  const { data: expData, error: expError } = await supabase.from('experiences').select('*').limit(1);
  if (expError) {
    console.error('Error fetching experiences:', expError);
  } else {
    console.log('Experience Columns:', Object.keys(expData[0] || {}));
  }
}

checkSchema();
