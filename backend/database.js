const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');

    // Create tables
    db.run(`CREATE TABLE IF NOT EXISTS companies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      investment REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS waste_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER,
      waste_type TEXT, -- 'paper', 'plastic', 'electronic'
      amount_kg REAL DEFAULT 0,
      energy_savings_kwh REAL DEFAULT 0,
      logistics_savings REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(company_id) REFERENCES companies(id)
    )`, (err) => {
      if (!err) {
        // Seed some data for the single company setup if empty.
        db.get('SELECT COUNT(*) as count FROM companies', (err, row) => {
          if (row.count === 0) {
            db.run(`INSERT INTO companies (name, investment) VALUES ('Acme Corp', 50000)`);
          }
        });
      }
    });
  }
});
module.exports = db;
