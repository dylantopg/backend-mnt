import { getDb } from './database';

async function createTables() {
    try {
        await getDb();
        console.log('Tables created or already exist.');
    } catch (error) {
        console.error('Error creating tables:', error);
    }
}

createTables().then(() => {
    console.log('Database setup complete.');
    process.exit(0); // Exit the process after completion
}).catch((error) => {
    console.error('Failed to set up database:', error);
    process.exit(1); // Exit with error code
});