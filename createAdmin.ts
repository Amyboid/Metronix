import connectToDatabase from './src/lib/server/connectDatabase'
import { createInitialAdminUser } from './src/lib/server/auth';
async function setupAdmin() {
    await connectToDatabase()
    const username = 'rakesh'; // Choose your admin username
    const password = 'r@1234';
    console.log(`Attempting to create admin user: ${username}`);
    await createInitialAdminUser(username, password);
    process.exit();
}

setupAdmin().catch(err => {
    console.error('Failed to set up admin user:', err);
    process.exit(1);
});