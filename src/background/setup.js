const sqlite3 = require('sqlite3').verbose();


let db = new sqlite3.Database('./db/pos.db', (err) => {
  if (err) {
    console.error(err.message);
  }

  console.log('Connected to the database.');
});

db.serialize(() => {
  db.run(`
    CREATE TABLE global_config (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      section_name TEXT,
      setting_name TEXT,
      setting_value TEXT,
      setting_type INTEGER
    );`
  );

  db.run(`
    CREATE TABLE transactions (
      hash TEXT PRIMARY KEY,
      account TEXT,
      amount INTEGER,
      date INTEGER,
      type INTEGER
    );`
  );

  db.run(`
    CREATE TABLE items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      price REAL
    );`
  );

  db.run(`
    CREATE TABLE bill_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bill_id INTEGER,
      item_id INTEGER
    );`
  );

  db.run(`
    CREATE TABLE bills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      transaction_hash TEXT,
      price REAL,
      date INTEGER
    );`
  );

});

db.close((err) => {
  if (err) {
    return console.error(err.message);
  }

  console.log('Close the database connection.');
});