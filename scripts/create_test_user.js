const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://eallydhjoozqehxylugm.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function main() {
    const email = 'testcontractor2@vizvillanyfutes.hu';
    const password = 'TestPassword123!';

    console.log('Creating auth user...');
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { role: 'contractor' }
    });

    if (userError) {
        console.error('Error creating user:', userError.message);
        if (!userError.message.includes('already')) process.exit(1);
    }

    // Fetch the user ID
    const { data: listData } = await supabase.auth.admin.listUsers();
    const user = listData.users.find(u => u.email === email);

    if (!user) {
        console.error('User not found after creation.');
        process.exit(1);
    }

    console.log('Auth user created with ID:', user.id);

    console.log('Upserting user_meta...');
    const { error: metaError } = await supabase.from('user_meta').upsert({
        user_id: user.id,
        role: 'contractor',
        status: 'active'
    });

    if (metaError) {
        console.error('Error creating user_meta:', metaError);
        process.exit(1);
    }

    console.log('Upserting contractor profile...');
    const { error: profileError } = await supabase.from('contractor_profiles').upsert({
        user_id: user.id,
        display_name: 'Teszt Vízszerelő Kft.',
        phone: '+36301234567',
        type: 'company',
        trades: ['viz'],
        service_areas: ['XI', 'XII'],
        years_experience: 5,
        status: 'approved',
        credit_balance: 50000
    });

    if (profileError) {
        console.error('Error creating profile:', profileError);
        process.exit(1);
    }

    console.log('✅ Test contractor created successfully!');
    console.log('Email:', email);
    console.log('Password:', password);
    process.exit(0);
}

main();
