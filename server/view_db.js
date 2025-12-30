const db = require('better-sqlite3')('movies.db');

// Get all rows
const rows = db.prepare('SELECT * FROM recommendations').all();

console.log("--- Database Content (" + rows.length + " rows) ---");
if (rows.length === 0) {
    console.log("Database is empty.");
} else {
    // Print as a table
    console.table(rows);
}
