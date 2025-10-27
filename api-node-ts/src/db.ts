import sqlite3 from 'sqlite3';
sqlite3.verbose();

const DB_PATH = './db/database.sqlite';

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Erreur ouverture DB :', err);
    process.exit(1);
  } else {
    console.log('SQLite connecté');
  }
});

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE
  );`);
});

export default db;

