// const { supabase } = require('./services/supabase.js');

// async function checkUsers() {
//     const { data, error } = await supabase
//         .from('users')
//         .select('email, name, role');

//     if (error) {
//         console.error('Error fetching users:', error);
//         return;
//     }

//     console.log('Current users:');
//     console.table(data);
// }

// checkUsers()
//     .then(() => console.log('Check completed.'))
//     .catch(err => console.error('Unhandled error in checkUsers:', err));
