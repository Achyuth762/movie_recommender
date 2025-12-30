const db = require('better-sqlite3')('movies.db');
db.prepare('DELETE FROM recommendations').run();
console.log('Database cleared.');
