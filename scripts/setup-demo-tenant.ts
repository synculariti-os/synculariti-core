import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const DEMO_FRANCHISE_GROUP_ID = '00000000-0000-0000-0000-000000000001';
const DEMO_RESTAURANT_ID = '00000000-0000-0000-0000-000000000011';
const FRANCHISE_OWNER_ROLE = '00000000-0000-0000-0000-000000000001';

const USERS = [
  { email: 'nikshanbhag@gmail.com', name: 'Nik Shanbhag', phone: '+421904855155' },
  { email: 'prasanth.k.ramesh@gmail.com', name: 'Prasanth Ramesh', phone: '+421944016820' },
  { email: 'Yokheshraja@gmail.com', name: 'Yokheshraja', phone: '+421951153761' },
];

async function main() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  for (const u of USERS) {
    console.log(`\n--- ${u.email} ---`);

    const { data: existingUser, error: lookupErr } = await supabase
      .from('users')
      .select('id')
      .eq('email', u.email)
      .maybeSingle();

    if (lookupErr) {
      console.error(`  Lookup error:`, lookupErr.message);
      continue;
    }

    if (existingUser) {
      console.log(`  User record exists: ${existingUser.id}`);
    }

    const { data: authData, error: signUpErr } = await supabase.auth.admin.createUser({
      email: u.email,
      email_confirm: true,
      user_metadata: { full_name: u.name, phone: u.phone },
    });

    if (signUpErr && signUpErr.message.includes('already registered')) {
      console.log(`  Auth user already exists`);
    } else if (signUpErr) {
      console.error(`  SignUp error:`, signUpErr.message);
      continue;
    } else {
      console.log(`  Auth user created: ${authData.user.id}`);
    }

    const authUserId = authData?.user.id || existingUser?.id;
    if (!authUserId) {
      console.error(`  Could not determine user ID`);
      continue;
    }

    const profile = existingUser || { id: authUserId };
    if (!existingUser) {
      await supabase.from('users').upsert({
        id: authUserId,
        email: u.email,
        full_name: u.name,
        phone_number: u.phone,
        is_active: true,
      });
      console.log(`  Profile created`);
    }

    const { data: existingRole } = await supabase
      .from('user_restaurant_roles')
      .select('id')
      .eq('user_id', authUserId)
      .eq('restaurant_id', DEMO_RESTAURANT_ID)
      .maybeSingle();

    if (!existingRole) {
      await supabase.from('user_restaurant_roles').insert({
        user_id: authUserId,
        restaurant_id: DEMO_RESTAURANT_ID,
        role_id: FRANCHISE_OWNER_ROLE,
        is_primary: true,
      });
      console.log(`  Assigned Franchise Owner role`);
    } else {
      console.log(`  Already has Franchise Owner role`);
    }
  }

  console.log('\nDone! Users can now login with their email and a password set via "Forgot Password" flow, or an admin can set their password.');
}

main().catch(console.error);
