const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'https://ooljbdretyikzdfoshjv.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'sb_publishable_R9a8qk-z_OO8TOFoMFsE_A_PqlaILnk';

const [email, password] = process.argv.slice(2);

if (!email || !password) {
  console.error('Usage: node scripts/get-token.cjs <email> <password>');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

(async () => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    console.error('Login failed:', error.message);
    process.exit(1);
  }

  console.log('\n--- ACCESS TOKEN ---');
  console.log(data.session.access_token);
  console.log('\n--- CURL EXAMPLE ---');
  console.log(`curl -H "Authorization: Bearer ${data.session.access_token}" -H "x-restaurant-id: YOUR_RESTAURANT_ID" http://localhost:3001/items`);
})();
