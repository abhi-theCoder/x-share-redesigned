
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables.');
}

let supabaseOptions = {};

// When NOT in production, use the local DNS bypass for ISP blocks
if (process.env.NODE_ENV !== 'production') {
  console.log('Running in Development Mode: Using Local DNS Bypass for Supabase');
  const localFetchBypass = require('./localFetchBypass');
  supabaseOptions = {
    global: {
      fetch: localFetchBypass
    }
  };
} else {
  console.log('Running in Production Mode: Using standard Supabase connection');
}

module.exports.supabase = createClient(supabaseUrl, supabaseServiceKey, supabaseOptions);