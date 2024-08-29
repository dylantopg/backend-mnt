import { Database } from 'sqlite3';
import { open } from 'sqlite';

let db: any;

export async function getDb() {
    if (!db) {
        db = await open({
            filename: './database.sqlite',
            driver: Database // Updated to use named import
        });

        try {
            await db.exec(`
              CREATE TABLE IF NOT EXISTS employees (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                unique_ci TEXT NOT NULL UNIQUE,
                name TEXT NOT NULL,
                department TEXT,
                cel INTEGER
              )
            `);
            
            await db.exec(`
              CREATE TABLE IF NOT EXISTS attendance (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                employee_ci TEXT NOT NULL,
                check_in DATETIME,
                check_out DATETIME,
                FOREIGN KEY (employee_ci) REFERENCES employees(unique_ci) ON DELETE CASCADE
              )
            `);
        } catch (error) {
            console.error('Error creating attendance table:', error);
        }
    }
    return db;
}